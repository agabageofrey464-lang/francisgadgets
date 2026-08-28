# Pre-deploy check

Run through this before pushing to production. Everything marked **verified**
was actually run and passed on 2026-08-28; re-run them after any significant
change rather than trusting this file.

## Verified locally

| Check | Command | Result |
|---|---|---|
| Production build compiles | `cd frontend && npm run build` | **passes** — 25 routes |
| Type checking | `cd frontend && npx tsc --noEmit` | **clean** |
| Linting | `cd frontend && npx next lint` | **clean** |
| Backend tests | `cd backend && python -m pytest -q` | **5 passed** |
| Migrations current | `cd backend && alembic heads` | `72d9f6f8ee7f (head)` |
| Every storefront page | see "Page sweep" below | **all 200** |
| Admin dashboard | signed in as admin | **all pages 200** |
| Admin blocked when signed out | `curl /admin` | **307 → /login** |
| Admin API rejects anonymous callers | `curl /api/v1/admin/*` | **401** |

### Page sweep

```bash
for p in / /products /gallery /apps /cart /checkout /about /contact \
         /track-order /login /register; do
  printf "%s %s\n" "$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:3100$p")" "$p"
done
```

## No external runtime dependencies for images

All 160 product photos and all 6 ad images are served by the app itself from
`frontend/public/`. Nothing hotlinks a third-party host, so there is no rate
limit, outage or image-host configuration to worry about at launch.

This was a real failure earlier: the catalogue originally pointed at
`commons.wikimedia.org/wiki/Special:FilePath/...`, which is a redirect endpoint
that returns **429** under the load of a single product grid and **403** to any
client without a policy-compliant User-Agent — Next's image optimizer included.
Both scripts that fixed it are kept in `backend/scripts/` (`resolve_image_urls.py`,
`localize_images.py`) in case new imagery is ever added from that source.

## Things that must change for production

These are safe locally but wrong in production. None are set for you.

| Setting | Local | Production |
|---|---|---|
| `DATABASE_URL` | `sqlite+aiosqlite:///./dev.db` | `postgresql+asyncpg://...` |
| `JWT_SECRET` | dev value | fresh `openssl rand -base64 32` |
| `NEXTAUTH_SECRET` | dev value | fresh, and different from `JWT_SECRET` |
| `CORS_ORIGINS` | `http://localhost:3100` | `https://francisgadgetstechnologies.com` |
| `FRONTEND_URL` | `http://localhost:3100` | the real domain |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8100/api/v1` | `https://api.francisgadgetstechnologies.com/api/v1` |
| `NEXTAUTH_URL` | `http://localhost:3100` | the real domain |
| `SEED_ADMIN_PASSWORD` | dev value | a real password, set before seeding |
| Payment keys | `sk_test_` / `FLWSECK_TEST-` | live keys, **only after a test checkout works** |

## Known gaps — decide before launch

1. **Product photos are stand-ins.** They show the right kind of device but not
   the exact unit stocked. Worse, several are plainly wrong — a screen protector
   showing a power bank, a kettle showing a microwave — because photos were
   sourced per *category* and dealt round-robin across the products in it.
   Replace them via the admin dashboard, or ask for a per-product re-source pass.

2. **Wikimedia photos need attribution.** Most are CC BY-SA. Sources are recorded
   in `backend/scripts/seed.py`. Credit them or replace with your own photography.

3. **Product names and prices are plausible, not real.** They were written to
   fill the catalogue. Check every one against actual stock before selling.

4. **The app page says "in development"** because there is no app. Remove the
   page or ship an app before advertising one.

5. **Payments have never completed end to end.** No real checkout has been run,
   in test or live mode. Do that before taking money.
