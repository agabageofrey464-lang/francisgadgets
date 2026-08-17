from fastapi import APIRouter

from app.api.v1.routes.admin import ads, categories, customers, dashboard, orders, products

router = APIRouter(prefix="/admin")
router.include_router(dashboard.router)
router.include_router(products.router)
router.include_router(categories.router)
router.include_router(orders.router)
router.include_router(customers.router)
router.include_router(ads.router)
