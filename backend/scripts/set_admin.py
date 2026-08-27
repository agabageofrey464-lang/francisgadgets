"""Create or update the admin account.

`seed.py` only ever creates an admin if none exists -- it will not change an
email or reset a password. Use this instead:

    python scripts/set_admin.py --email owner@example.com
    python scripts/set_admin.py --email owner@example.com --password "S3cret!"
    python scripts/set_admin.py --email owner@example.com --rename-from old@example.com

With no --password a strong one is generated and printed once.
"""

import argparse
import asyncio
import secrets
import string
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole

ALPHABET = string.ascii_letters + string.digits + "!@#$%^&*"


def generate_password(length: int = 16) -> str:
    return "".join(secrets.choice(ALPHABET) for _ in range(length))


async def set_admin(email: str, password: str, full_name: str, rename_from: str | None) -> None:
    async with AsyncSessionLocal() as db:
        user = None

        if rename_from:
            user = (await db.execute(select(User).where(User.email == rename_from))).scalar_one_or_none()
            if user is None:
                raise SystemExit(f"No user found with email {rename_from}")
            clash = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
            if clash is not None and clash.id != user.id:
                raise SystemExit(f"{email} is already taken by another account")
            user.email = email
            action = f"Renamed {rename_from} -> {email}"
        else:
            user = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
            action = "Updated" if user else "Created"

        if user is None:
            user = User(email=email, hashed_password=hash_password(password), full_name=full_name, role=UserRole.ADMIN)
            db.add(user)
        else:
            user.hashed_password = hash_password(password)
            user.full_name = full_name
            user.role = UserRole.ADMIN
            user.is_active = True

        await db.commit()

    print(f"{action} admin account")
    print(f"  Email:    {email}")
    print(f"  Password: {password}")
    print("  Sign in at /login -- change this password once you are in.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Create or update the admin account.")
    parser.add_argument("--email", required=True, help="Admin email address (used to sign in)")
    parser.add_argument("--password", help="Password to set (a strong one is generated if omitted)")
    parser.add_argument("--name", default="Francis Admin", help="Display name")
    parser.add_argument("--rename-from", help="Existing account email to rename instead of creating a new one")
    args = parser.parse_args()

    password = args.password or generate_password()
    asyncio.run(set_admin(args.email, password, args.name, args.rename_from))


if __name__ == "__main__":
    main()
