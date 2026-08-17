from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.utils import generate_payment_reference
from app.models.order import Order, OrderStatus
from app.models.payment import Payment, PaymentStatus
from app.schemas.payment import PaymentInitializeRequest, PaymentInitializeResponse, PaymentVerifyResponse
from app.services.payment_service import (
    FlutterwaveProvider,
    PaymentError,
    PaystackProvider,
    get_payment_provider,
)

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/initialize", response_model=PaymentInitializeResponse)
async def initialize_payment(payload: PaymentInitializeRequest, db: AsyncSession = Depends(get_db)):
    order = await db.get(Order, payload.order_id)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.status != OrderStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order is not payable")

    provider = get_payment_provider(payload.provider)
    reference = generate_payment_reference()
    callback_url = f"{settings.FRONTEND_URL}/checkout/callback?reference={reference}&provider={payload.provider}"

    try:
        authorization_url = await provider.initialize(
            reference=reference,
            amount=order.total,
            currency=order.currency,
            email=order.email,
            callback_url=callback_url,
        )
    except PaymentError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    order.payment_provider = payload.provider
    order.payment_reference = reference
    db.add(Payment(order_id=order.id, provider=payload.provider, reference=reference, amount=order.total, currency=order.currency))
    await db.commit()

    return PaymentInitializeResponse(authorization_url=authorization_url, reference=reference, provider=payload.provider)


async def _mark_paid(db: AsyncSession, payment: Payment, order: Order, raw: dict) -> None:
    payment.status = PaymentStatus.SUCCESSFUL
    payment.raw_payload = raw
    if order.status == OrderStatus.PENDING:
        order.status = OrderStatus.PAID
        order.paid_at = datetime.now(timezone.utc)
    await db.commit()


@router.get("/verify/{reference}", response_model=PaymentVerifyResponse)
async def verify_payment(reference: str, db: AsyncSession = Depends(get_db)) -> PaymentVerifyResponse:
    payment = (await db.execute(select(Payment).where(Payment.reference == reference))).scalar_one_or_none()
    if payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    order = await db.get(Order, payment.order_id)
    if order is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if payment.status != PaymentStatus.SUCCESSFUL:
        provider = get_payment_provider(payment.provider)
        try:
            result = await provider.verify(reference)
        except PaymentError as exc:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

        if result["successful"]:
            await _mark_paid(db, payment, order, result["raw"])
        else:
            payment.status = PaymentStatus.FAILED
            payment.raw_payload = result["raw"]
            await db.commit()

    return PaymentVerifyResponse(
        reference=reference,
        status=payment.status.value,
        order_status=order.status.value,
        order_number=order.order_number,
    )


@router.post("/webhook/paystack", status_code=status.HTTP_200_OK)
async def paystack_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    raw_body = await request.body()
    signature = request.headers.get("x-paystack-signature")
    if not PaystackProvider.verify_webhook_signature(raw_body, signature):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signature")

    event = await request.json()
    if event.get("event") == "charge.success":
        reference = event["data"]["reference"]
        payment = (await db.execute(select(Payment).where(Payment.reference == reference))).scalar_one_or_none()
        if payment is not None and payment.status != PaymentStatus.SUCCESSFUL:
            order = await db.get(Order, payment.order_id)
            if order is not None:
                await _mark_paid(db, payment, order, event["data"])

    return {"received": True}


@router.post("/webhook/flutterwave", status_code=status.HTTP_200_OK)
async def flutterwave_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    signature = request.headers.get("verif-hash")
    if not FlutterwaveProvider.verify_webhook_signature(signature):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signature")

    event = await request.json()
    data = event.get("data", {})
    if data.get("status") == "successful":
        reference = data.get("tx_ref")
        payment = (await db.execute(select(Payment).where(Payment.reference == reference))).scalar_one_or_none()
        if payment is not None and payment.status != PaymentStatus.SUCCESSFUL:
            order = await db.get(Order, payment.order_id)
            if order is not None:
                await _mark_paid(db, payment, order, data)

    return {"received": True}
