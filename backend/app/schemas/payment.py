from pydantic import BaseModel, Field


class PaymentInitializeRequest(BaseModel):
    order_id: int
    provider: str = Field(pattern="^(paystack|flutterwave)$")


class PaymentInitializeResponse(BaseModel):
    authorization_url: str
    reference: str
    provider: str


class PaymentVerifyResponse(BaseModel):
    reference: str
    status: str
    order_status: str
    order_number: str
