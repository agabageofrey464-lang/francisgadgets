# Deploying Francis Gadgets Technologies

This covers taking the app from local dev to `francisgadgetstechnologies.com`, live on:
- **Frontend**: Vercel
- **Backend API**: any Docker-friendly host (examples below use Render.com -- swap for Railway/Fly.io/a VPS if you prefer, the `backend/Dockerfile` works anywhere)
- **Database**: managed PostgreSQL (Render/Railway/Supabase/Neon all work)
- **Domain/DNS**: Cloudflare

I can write and edit all the code and config here, but the actual deploy actions (creating accounts, clicking "Deploy", adding DNS records, pasting API keys) need your accounts -- I don't have access to them.

## 1. Database

Create a managed Postgres instance (Render "PostgreSQL", Railway, Neon, or Supabase all work). You'll get a connection string like:

```
postgresql://user:password@host:5432/dbname
```

For this app's `DATABASE_URL` env var, it must use the `asyncpg` driver prefix:

```
postgresql+asyncpg://user:password@host:5432/dbname
```

## 2. Backend API (Render.com example)

1. Push this repo to GitHub (see "Git setup" below if you haven't yet).
2. In Render: **New > Web Service**, connect the repo, set **Root Directory** to `backend`.
3. Render will detect the `Dockerfile` automatically (or set Runtime to Docker manually).
4. Set environment variables (copy from `backend/.env.example`, using real values):
   - `DATABASE_URL` (the `+asyncpg` connection string from step 1)
   - `JWT_SECRET` -- generate with `openssl rand -base64 32`
   - `FRONTEND_URL` -- `https://francisgadgetstechnologies.com`
   - `CORS_ORIGINS` -- `https://francisgadgetstechnologies.com`
   - `STORAGE_BACKEND=local` is fine to launch with. Every catalogue photo is
     committed to the repo under `frontend/public/products/` and served by the
     frontend, so the shop renders correctly with no object storage at all.
     Switch to `s3` (step 4) before you rely on **admin image uploads** -- those
     write to the API container's disk, which most hosts wipe on restart.
   - `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` -- from your Paystack dashboard (test keys first)
   - `FLUTTERWAVE_SECRET_KEY` / `FLUTTERWAVE_PUBLIC_KEY` / `FLUTTERWAVE_WEBHOOK_SECRET_HASH`
   - `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` -- set a real password before running the seed script in production
5. Deploy. The container's `CMD` runs `alembic upgrade head` automatically before starting `uvicorn`, so migrations apply on every deploy.
6. Once live, note the backend's URL, e.g. `https://fgt-api.onrender.com` -- you'll point `api.francisgadgetstechnologies.com` at this via Cloudflare (step 5), and you can run `python scripts/seed.py` once against production (via a one-off shell on the host, or locally with `DATABASE_URL` pointed at prod) to create the initial admin user and sample catalog.

## 3. Payment provider setup

**Paystack**: Dashboard → Settings → API Keys & Webhooks. Add a webhook URL: `https://api.francisgadgetstechnologies.com/api/v1/payments/webhook/paystack`. Copy the secret key into `PAYSTACK_SECRET_KEY`.

**Flutterwave**: Dashboard → Settings → Webhooks. Set the URL to `https://api.francisgadgetstechnologies.com/api/v1/payments/webhook/flutterwave` and set a "secret hash" -- put that same value in `FLUTTERWAVE_WEBHOOK_SECRET_HASH`. Copy the secret key into `FLUTTERWAVE_SECRET_KEY`.

Test with both providers' test-mode keys before switching to live keys.

## 4. Product images (Cloudflare R2) -- optional at launch

Skip this until you need admin uploads to survive a restart. The 160 catalogue
photos already ship inside the frontend build and need nothing here.

1. Cloudflare dashboard → R2 → Create bucket (e.g. `fgt-product-images`).
2. Enable public access for the bucket (custom domain, e.g. `images.francisgadgetstechnologies.com`, is recommended over the default `r2.dev` URL).
3. R2 → Manage API tokens → create a token with read/write access to the bucket. You'll get an Access Key ID, Secret Access Key, and an account-specific S3 endpoint URL (`https://<account_id>.r2.cloudflarestorage.com`).
4. Backend env vars:
   ```
   STORAGE_BACKEND=s3
   S3_ENDPOINT_URL=https://<account_id>.r2.cloudflarestorage.com
   S3_ACCESS_KEY_ID=<from step 3>
   S3_SECRET_ACCESS_KEY=<from step 3>
   S3_BUCKET_NAME=fgt-product-images
   S3_PUBLIC_URL=https://images.francisgadgetstechnologies.com
   S3_REGION=auto
   ```
5. Frontend env var (so `next/image` is allowed to load from that host):
   ```
   NEXT_PUBLIC_IMAGE_HOST=images.francisgadgetstechnologies.com
   ```

## 5. Frontend (Vercel)

1. Vercel dashboard → **Add New > Project**, import the GitHub repo, set **Root Directory** to `frontend`.
2. Vercel auto-detects Next.js -- no build command changes needed (`vercel.json` in `frontend/` just adds security headers).
3. Environment variables (Production + Preview):
   - `NEXT_PUBLIC_API_URL` = `https://api.francisgadgetstechnologies.com/api/v1`
   - `NEXT_PUBLIC_IMAGE_HOST` = only if you set up R2 in step 4; leave unset otherwise
   - `NEXTAUTH_SECRET` = generate with `openssl rand -base64 32` (different from the backend's `JWT_SECRET` -- they're unrelated, see the comment in `.env.local.example`)
   - `NEXTAUTH_URL` = `https://francisgadgetstechnologies.com`
4. Deploy. Vercel gives you a `*.vercel.app` URL first -- confirm the build works before wiring the custom domain.
5. In the Vercel project → **Settings > Domains**, add `francisgadgetstechnologies.com` and `www.francisgadgetstechnologies.com`. Vercel will show you the exact DNS records to add (see step 6).

## 6. Domain (Cloudflare DNS)

In the Cloudflare dashboard for `francisgadgetstechnologies.com` → DNS:

| Type | Name | Content | Proxy status |
|---|---|---|---|
| A or CNAME | `@` | whatever Vercel's domain page tells you (usually `76.76.21.21` for A, or a `cname.vercel-dns.com` target) | **DNS only** (grey cloud) |
| CNAME | `www` | `cname.vercel-dns.com` | **DNS only** (grey cloud) |
| CNAME | `api` | your backend host's URL (e.g. `fgt-api.onrender.com`) | Proxied (orange cloud) is fine here, or DNS only if your host needs to see real client IPs for something |

Important: Vercel requires the records pointing at it to be **DNS only** (grey cloud, not proxied through Cloudflare) unless you specifically set up Cloudflare for Vercel's documented proxied setup -- otherwise SSL/redirect issues are common. Vercel auto-provisions the TLS certificate once DNS resolves correctly.

DNS propagation can take a few minutes to a few hours. Verify with:

```
nslookup francisgadgetstechnologies.com
nslookup api.francisgadgetstechnologies.com
```

## 7. Post-deploy checklist

- [ ] Visit `https://francisgadgetstechnologies.com`, confirm the homepage loads and pulls products from the live API
- [ ] Register a test customer account, confirm login works
- [ ] Log in as the seeded admin, confirm `/admin` loads and is blocked for the test customer
- [ ] Create a product with an image in the admin dashboard, confirm it appears in the storefront
- [ ] Run a full checkout with Paystack/Flutterwave **test** keys, confirm the webhook marks the order paid
- [ ] Switch payment keys to live mode only after the above is verified
- [ ] Set a strong `SEED_ADMIN_PASSWORD` (or change the admin password after first login) before going live

## Restoring the catalogue on a new machine

`backend/dev.db` is gitignored, so a clone has no data. The catalogue is kept in
version control as `backend/scripts/catalogue_data.py` instead:

```bash
cd backend
alembic upgrade head                    # create the schema
python scripts/seed_catalogue.py        # 22 categories, 160 products, 6 ads
python scripts/set_admin.py --email you@example.com --password "YourPass123!"
```

After changing the catalogue through the admin dashboard, re-export it so the
next clone gets your changes:

```bash
python scripts/export_catalogue.py      # rewrites catalogue_data.py
```

Then commit `catalogue_data.py`.

## Git setup

Already done. The project lives at:

```
https://github.com/agabageofrey464-lang/francisgadgets
```

`main` is the deploy branch, and `origin` points at that repo. Vercel and your
API host both connect to it directly -- no further git work is needed.

A second remote, `mukisa`, points at `mukisa76/FRANCIS-` (the owner's original
repo) for when write access is granted:

```bash
git push mukisa main
```
