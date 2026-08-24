import uuid
from pathlib import Path

from fastapi import UploadFile

from app.core.config import settings


_ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif", "avif", "mp4", "webm", "mov"}


def _safe_extension(filename: str | None) -> str:
    if not filename or "." not in filename:
        return ""
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in _ALLOWED_EXTENSIONS:
        return "jpg"
    return ext


async def save_product_image(file: UploadFile) -> str:
    ext = _safe_extension(file.filename)
    key = f"products/{uuid.uuid4().hex}.{ext}" if ext else f"products/{uuid.uuid4().hex}"
    content = await file.read()

    if settings.STORAGE_BACKEND == "s3":
        return _save_to_s3(key, content, file.content_type)
    return _save_to_local(key, content)


def _save_to_local(key: str, content: bytes) -> str:
    dest = Path(settings.LOCAL_UPLOAD_DIR) / key
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(content)
    return f"{settings.PUBLIC_UPLOAD_URL.rstrip('/')}/{key}"


def _save_to_s3(key: str, content: bytes, content_type: str | None) -> str:
    import boto3

    client = boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT_URL,
        aws_access_key_id=settings.S3_ACCESS_KEY_ID,
        aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY,
        region_name=settings.S3_REGION,
    )
    # Note: Cloudflare R2 does not support per-object ACLs (unlike AWS S3) --
    # make the bucket public via a custom domain / R2.dev public access instead.
    client.put_object(
        Bucket=settings.S3_BUCKET_NAME,
        Key=key,
        Body=content,
        ContentType=content_type or "application/octet-stream",
    )
    return f"{settings.S3_PUBLIC_URL.rstrip('/')}/{key}"
