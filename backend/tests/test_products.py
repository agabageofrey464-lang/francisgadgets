from tests.conftest import TestSessionLocal

from app.models.category import Category
from app.models.product import Product


async def _create_sample_product():
    async with TestSessionLocal() as db:
        category = Category(name="Audio", slug="audio")
        db.add(category)
        await db.flush()
        product = Product(
            name="Test Headphones",
            slug="test-headphones",
            description="Great sound",
            price=19999,
            stock_quantity=10,
            category_id=category.id,
        )
        db.add(product)
        await db.commit()


async def test_list_and_get_product(client):
    await _create_sample_product()

    list_resp = await client.get("/api/v1/products")
    assert list_resp.status_code == 200
    body = list_resp.json()
    assert body["total"] == 1
    assert body["items"][0]["name"] == "Test Headphones"

    detail_resp = await client.get("/api/v1/products/test-headphones")
    assert detail_resp.status_code == 200
    assert detail_resp.json()["price"] == "19999.00" or float(detail_resp.json()["price"]) == 19999


async def test_get_missing_product_404(client):
    resp = await client.get("/api/v1/products/does-not-exist")
    assert resp.status_code == 404
