from fastapi import APIRouter

from app.api.v1.routes import ads, auth, categories, orders, payments, products, reviews, uploads
from app.api.v1.routes.admin.router import router as admin_router

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(products.router)
api_router.include_router(categories.router)
api_router.include_router(orders.router)
api_router.include_router(payments.router)
api_router.include_router(reviews.router)
api_router.include_router(uploads.router)
api_router.include_router(ads.router)
api_router.include_router(admin_router)
