# Francis Gadgets Technologies

Full-stack e-commerce platform: FastAPI (Python) backend + PostgreSQL, Next.js storefront with an integrated `/admin` dashboard, Paystack/Flutterwave checkout. Built for `francisgadgetstechnologies.com`, frontend on Vercel, domain on Cloudflare.

## Stack

| Layer | Technology |
|---|---|
| Backend API | Python, FastAPI, SQLAlchemy 2.0 (async), Alembic |
| Database | PostgreSQL |
| Frontend | Next.js 15 (App Router, TypeScript, Tailwind CSS) |
| Auth | NextAuth.js (Credentials) + backend-issued JWT |
| Payments | Paystack + Flutterwave |
| Image storage | Local disk (dev) or S3-compatible / Cloudflare R2 (prod) |
| Frontend hosting | Vercel |
| Backend hosting | Any Docker host (Render/Railway/Fly.io -- see `docs/deployment.md`) |
| Domain / DNS | Cloudflare |

## Project layout

```
backend/    FastAPI app, Alembic migrations, seed script, tests
frontend/   Next.js app -- storefront + /admin dashboard
docs/       Deployment walkthrough
docker-compose.yml   Local dev: Postgres + backend
```

## Prerequisites

You'll need locally: **Python 3.12+**, **PostgreSQL**, and **Node.js 20+**.

This environment has Python 3.12.10 (via winget) and PostgreSQL 17 (via winget, native Windows service -- not Docker; Docker Desktop needs WSL2, which needs admin rights this session doesn't have) and Node.js already installed and verified working end-to-end. If you're setting this up fresh elsewhere, `docker compose up -d postgres` (using the root `docker-compose.yml`) is the more portable option, or install Postgres natively as below.

## Running the backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt

copy .env.example .env          # Windows: copy, macOS/Linux: cp
# edit .env -- at minimum set JWT_SECRET, DATABASE_URL

# Start Postgres -- either:
docker compose up -d postgres          # from the repo root, if using Docker
# ...or point DATABASE_URL at a native/local Postgres instance and:
createdb -U postgres francis_gadgets

alembic upgrade head
python scripts/seed.py          # creates an admin user + sample catalog
uvicorn app.main:app --reload   # http://localhost:8000/docs
```

Seeded admin login (change `SEED_ADMIN_PASSWORD` in `.env` before running in anything beyond local dev):
- Email: value of `SEED_ADMIN_EMAIL` (default `admin@francisgadgetstechnologies.com`)
- Password: value of `SEED_ADMIN_PASSWORD`

Run tests (uses an in-memory SQLite DB, no Postgres required):

```bash
pytest
```

## Running the frontend

```bash
cd frontend
npm install
copy .env.local.example .env.local
# edit .env.local -- set NEXTAUTH_SECRET (openssl rand -base64 32) and NEXT_PUBLIC_API_URL
npm run dev                     # http://localhost:3000
```

## What's actually been verified in this environment

Both the frontend and backend have been installed, built/imported, and exercised end-to-end here, not just written:

- Frontend: `npm install`, `npm run build` (clean), `npm run lint` (clean), dev server smoke-tested against several pages.
- Backend: full pytest suite passes (5/5, in-memory SQLite); with a real local Postgres 17 database, ran the actual HTTP API end-to-end -- product catalog, customer registration/login, admin login, `/admin` blocked for non-admin (403), order creation with correct total calculation and stock decrement, guest order tracking by order number + email, admin order listing and status update, and product reviews including duplicate-review rejection (409). All passed as expected.
- Not exercised: real Paystack/Flutterwave payment redirects and webhooks (need live/test API keys you'll supply), and image upload to S3/R2 (local disk upload path works, R2 needs your credentials).

## Feature scope

**Storefront**: catalog browsing/search/filter, product detail with gallery, client-side cart, guest or logged-in checkout, Paystack/Flutterwave payment, order history, guest order tracking, product reviews.

**Admin (`/admin`, role-gated)**: dashboard stats, product CRUD with image upload, category CRUD, order management with status updates, customer list.

**Not included in this pass** (by design, to ship a working core first): coupons/discounts, multi-vendor, tax/shipping-rate engines, multi-currency, wishlists, live chat, email/SMS notifications, i18n.

## Known limitations worth hardening before going live

- `POST /api/v1/payments/initialize` checks the order is still `pending` but doesn't verify the caller owns the order (guest orders have no auth to check against). Low risk in practice -- it can't move money to an attacker, only let someone else create a checkout session for an existing order -- but tighten this if it matters for your threat model.
- No rate limiting on `/auth/login`, `/auth/register`, or the payment endpoints. Add it (e.g. via a reverse proxy or `slowapi`) before production traffic.
- No automated CI pipeline is set up yet (no GitHub Actions), and there's no git repository initialized in this project yet.

## Deployment

See [`docs/deployment.md`](docs/deployment.md) for the full Vercel + backend host + Cloudflare DNS walkthrough for `francisgadgetstechnologies.com`.
