from fastapi import APIRouter, Depends, File, UploadFile

from app.core.deps import require_admin
from app.models.user import User
from app.services.storage_service import save_product_image

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/product-image")
async def upload_product_image(
    file: UploadFile = File(...), _admin: User = Depends(require_admin)
) -> dict[str, str]:
    url = await save_product_image(file)
    return {"url": url}
