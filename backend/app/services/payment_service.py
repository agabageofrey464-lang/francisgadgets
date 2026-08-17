import hashlib
import hmac
from abc import ABC, abstractmethod
from decimal import Decimal
from typing import Any

import httpx

from app.core.config import settings


class PaymentError(Exception):
    pass


class PaymentProvider(ABC):
    name: str

    @abstractmethod
    async def initialize(
        self, *, reference: str, amount: Decimal, currency: str, email: str, callback_url: str
    ) -> str:
        """Returns the checkout/authorization URL the customer should be redirected to."""

    @abstractmethod
    async def verify(self, reference: str) -> dict[str, Any]:
        """Returns {"successful": bool, "amount": Decimal, "currency": str, "raw": dict}."""


class PaystackProvider(PaymentProvider):
    name = "paystack"
    base_url = "https://api.paystack.co"

    async def initialize(
        self, *, reference: str, amount: Decimal, currency: str, email: str, callback_url: str
    ) -> str:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                f"{self.base_url}/transaction/initialize",
                headers={"Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"},
                json={
                    "email": email,
                    "amount": int(amount * 100),  # kobo
                    "currency": currency,
                    "reference": reference,
                    "callback_url": callback_url,
                },
            )
        data = resp.json()
        if not resp.is_success or not data.get("status"):
            raise PaymentError(data.get("message", "Failed to initialize Paystack transaction"))
        return data["data"]["authorization_url"]

    async def verify(self, reference: str) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(
                f"{self.base_url}/transaction/verify/{reference}",
                headers={"Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"},
            )
        data = resp.json()
        if not resp.is_success or not data.get("status"):
            raise PaymentError(data.get("message", "Failed to verify Paystack transaction"))
        tx = data["data"]
        return {
            "successful": tx.get("status") == "success",
            "amount": Decimal(tx["amount"]) / 100,
            "currency": tx.get("currency", "UGX"),
            "raw": tx,
        }

    @staticmethod
    def verify_webhook_signature(raw_body: bytes, signature: str | None) -> bool:
        if not signature:
            return False
        expected = hmac.new(
            settings.PAYSTACK_SECRET_KEY.encode(), raw_body, hashlib.sha512
        ).hexdigest()
        return hmac.compare_digest(expected, signature)


class FlutterwaveProvider(PaymentProvider):
    name = "flutterwave"
    base_url = "https://api.flutterwave.com/v3"

    async def initialize(
        self, *, reference: str, amount: Decimal, currency: str, email: str, callback_url: str
    ) -> str:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                f"{self.base_url}/payments",
                headers={"Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}"},
                json={
                    "tx_ref": reference,
                    "amount": str(amount),
                    "currency": currency,
                    "redirect_url": callback_url,
                    "customer": {"email": email},
                },
            )
        data = resp.json()
        if not resp.is_success or data.get("status") != "success":
            raise PaymentError(data.get("message", "Failed to initialize Flutterwave transaction"))
        return data["data"]["link"]

    async def verify(self, reference: str) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(
                f"{self.base_url}/transactions/verify_by_reference",
                params={"tx_ref": reference},
                headers={"Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}"},
            )
        data = resp.json()
        if not resp.is_success or data.get("status") != "success":
            raise PaymentError(data.get("message", "Failed to verify Flutterwave transaction"))
        tx = data["data"]
        return {
            "successful": tx.get("status") == "successful",
            "amount": Decimal(str(tx["amount"])),
            "currency": tx.get("currency", "UGX"),
            "raw": tx,
        }

    @staticmethod
    def verify_webhook_signature(signature: str | None) -> bool:
        if not signature or not settings.FLUTTERWAVE_WEBHOOK_SECRET_HASH:
            return False
        return hmac.compare_digest(signature, settings.FLUTTERWAVE_WEBHOOK_SECRET_HASH)


_PROVIDERS: dict[str, PaymentProvider] = {
    "paystack": PaystackProvider(),
    "flutterwave": FlutterwaveProvider(),
}


def get_payment_provider(name: str) -> PaymentProvider:
    provider = _PROVIDERS.get(name)
    if provider is None:
        raise PaymentError(f"Unknown payment provider: {name}")
    return provider
