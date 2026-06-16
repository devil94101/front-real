# Stackline API (Backend)

Node + Express REST API that backs the Stackline frontend. Implements every endpoint
the frontend's Redux thunks call, with the exact request/response shapes from
`src/types.ts`.

## Stack
- **Express** (ESM, plain JS — no build step)
- **JSON-file datastore** at `data/db.json` (no database server to install)
- **JWT** access + refresh tokens, **bcryptjs** password hashing

## Run

```bash
cd server
npm install
npm run dev      # auto-restarts on change (node --watch)
# or: npm start
```

Server boots on `http://localhost:3001/api` — which is exactly what the frontend's
`.env` (`VITE_API_BASE_URL`) already points to. Start the backend, then run the
frontend (`npm run dev` in the repo root) and sign in.

On first boot it seeds `data/db.json` with the same dataset the frontend's demo mode
shows (10 properties, 10 contacts, 12 vacancies, 9 deals, 4 team members). Delete
`data/db.json` to reset to a clean seed.

## Seeded login accounts
The four seeded brokers are real, login-able accounts. Password for all of them is
`SEED_PASSWORD` (default `demo1234`):

| Email | Role |
|---|---|
| `jordan@stackline.co` | Principal Broker |
| `maya@stackline.co` | Senior Associate |
| `devon@stackline.co` | Acquisitions Lead |
| `riley@stackline.co` | Research Analyst |

You can also register a brand-new account from the frontend's Register screen.

## Endpoints
All routes are under `/api` and (except `/auth/*` and `/health`) require
`Authorization: Bearer <token>`.

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | liveness check |
| POST | `/auth/register` | `{ name, email, password, firmName? }` → `{ token, refreshToken, user }` |
| POST | `/auth/login` | `{ email, password }` → `{ token, refreshToken, user }` |
| GET | `/auth/me` | current user |
| POST | `/auth/refresh` | `{ refreshToken }` → new token pair |
| GET/POST | `/properties` | list / create |
| PUT/DELETE | `/properties/:id` | update / delete (cascades vacancies, unlinks deals) |
| POST | `/properties/:id/share` | `{ memberIds }` |
| GET/POST | `/contacts` | delete unlinks owner refs |
| PUT/DELETE | `/contacts/:id` | |
| GET/POST | `/vacancies` · PUT/DELETE `/vacancies/:id` | |
| GET/POST | `/deals` · PUT/DELETE `/deals/:id` | |
| PATCH | `/deals/:id/stage` | `{ stage }` |
| GET/POST | `/team` · DELETE `/team/:id` | |
| GET | `/activity` | server-logged audit feed |
| GET | `/billing/status` | plan, usage (`used`/`limit`), price |
| POST | `/billing/subscription` | create a Razorpay subscription (or mock) |
| POST | `/billing/verify` | verify checkout signature → activate Premium |
| POST | `/billing/cancel` | cancel subscription → revert to Free |
| POST | `/billing/webhook` | Razorpay webhook (raw-body signature verified) |

## Premium subscriptions (Razorpay)
Brokers on the **Free** plan can list up to `FREE_PROPERTY_LIMIT` (10) properties;
**Premium** raises this to `PREMIUM_PROPERTY_LIMIT` (100). The cap is per broker —
counted by the `listedBy` field stamped on each property at creation. `POST /properties`
returns **403** once the limit is hit.

Upgrades go through Razorpay's **Subscriptions API** (₹4,999/year by default):
`/billing/subscription` creates the subscription → the frontend opens Razorpay
Checkout → `/billing/verify` validates the `payment_id|subscription_id` HMAC signature
and flips the user to Premium. A signed webhook keeps the plan in sync with
Razorpay-side events (activated/charged/cancelled/halted).

**Mock mode (default):** with `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` blank, the
server logs `Billing mode: MOCK` and the upgrade completes locally with no real
payment — so the full flow is testable now. Drop your keys into `.env` and restart to
go live (`Billing mode: LIVE`); no code change needed. For live webhooks, set
`RAZORPAY_WEBHOOK_SECRET` and point the dashboard webhook at
`https://<your-host>/api/billing/webhook`.

> Demo tip: log in as **jordan@stackline.co** — he's seeded with all 10 listings, so
> you'll hit the limit and see the upgrade flow immediately. Log in as
> **maya@stackline.co** (0 listings) to add freely.

## Configuration (`.env`)
See `.env.example`. No third-party API keys are required. The only values worth
setting for a real deployment are the secrets:

| Key | Default | Notes |
|---|---|---|
| `PORT` | `3001` | |
| `API_PREFIX` | `/api` | |
| `CORS_ORIGIN` | `*` | comma-separated list, or `*` to reflect any origin (dev only) |
| `JWT_SECRET` | dev value | **TODO: rotate to a long random string in production** |
| `JWT_REFRESH_SECRET` | dev value | **TODO: rotate in production** |
| `JWT_EXPIRES_IN` | `1h` | |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | |
| `SEED_PASSWORD` | `demo1234` | password for the seeded broker accounts |
| `RAZORPAY_KEY_ID` | _(blank)_ | **provide for live payments** — blank = mock mode |
| `RAZORPAY_KEY_SECRET` | _(blank)_ | **provide for live payments** |
| `RAZORPAY_PLAN_ID` | _(blank)_ | optional; auto-created if blank |
| `RAZORPAY_WEBHOOK_SECRET` | _(blank)_ | required for live webhook verification |
| `FREE_PROPERTY_LIMIT` | `10` | listings allowed on Free |
| `PREMIUM_PROPERTY_LIMIT` | `100` | listings allowed on Premium |
| `PREMIUM_AMOUNT` | `499900` | price in paise (₹4,999) |
| `PREMIUM_CURRENCY` | `INR` | |
| `PREMIUM_PERIOD` | `yearly` | `yearly` or `monthly` |

## Known simplifications (prototype)
- **Single shared workspace** — all authenticated users see the same
  properties/contacts/deals. Multi-tenancy by `firmId` is not enforced yet.
- **JSON file, not a database** — fine for local/demo; swap `src/db.js` for a real
  DB (Postgres/SQLite) for production scale and concurrent writes.
- Refresh tokens are stateless JWTs (no server-side revocation list).
