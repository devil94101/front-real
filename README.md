# Stackline — Commercial Property Intelligence Platform

A full-stack CRM for commercial real-estate brokers: property database, contacts,
vacancies, a deal pipeline, team sharing, and **premium subscriptions** (Razorpay).

- **Frontend:** React 19 + TypeScript + Vite + Tailwind + Redux Toolkit
- **Backend:** Node + Express (ESM) + JSON-file datastore + JWT auth + Razorpay

---

## 1. Quick start

You need two processes running: the API and the web app.

### Terminal 1 — backend
```bash
cd server
npm install
npm run dev          # → http://localhost:3001/api   (auto-restarts)
```
On first boot it seeds `server/data/db.json` with the demo dataset and prints:
```
Stackline API listening on http://localhost:3001/api
Billing mode: MOCK (no keys — upgrades auto-complete)
```

### Terminal 2 — frontend
```bash
npm install
npm run dev          # → http://localhost:5173  (or next free port, e.g. 5174)
```

The frontend's `.env` already points at the API (`VITE_API_BASE_URL=http://localhost:3001/api`).

### Sign in
| Account | Password | State |
|---|---|---|
| `jordan@stackline.co` | `demo1234` | owns all 10 seed listings → **at the free limit** (good for testing the upgrade) |
| `maya@stackline.co` | `demo1234` | 0 listings → can add freely |
| `devon@stackline.co` / `riley@stackline.co` | `demo1234` | 0 listings |

Or click **Enter Demo Mode** (no backend, local seed data, never gated), or **register** a new account.

---

## 2. What was built (in order)

### Step 1 — Backend API (`server/`)
A from-scratch Express API implementing every endpoint the frontend's Redux thunks
call, with shapes matching `src/types.ts`. See [`server/README.md`](server/README.md)
for the full endpoint table.

- JWT access + refresh tokens, bcrypt password hashing
- JSON-file persistence (`server/data/db.json`) — no DB server to install
- Single shared workspace, seeded identically to the frontend's demo data
- Delete cascades (property → vacancies, unlink deals; contact → unlink owner refs)
- Server-side activity feed on every mutation

### Step 2 — Session-restore bug fix
On refresh the app hung on **"Verifying session…"**. `loadInitial()` optimistically
set `isAuthenticated: true` when a token existed, but `AuthGate` only validated the
token when `!isAuthenticated` — so `loadUser()` never fired and `loading` never
cleared. Fixed in `src/App.tsx` to validate whenever a token is present (the
`loadUser` thunk clears `loading` on both success and failure).

### Step 3 — Premium subscriptions (Razorpay)
See section 3.

---

## 3. Premium subscriptions

### Behaviour
| Plan | Listing limit | Price |
|---|---|---|
| **Free** | 10 properties | — |
| **Premium** | 100 properties | ₹4,999 / year (configurable) |

- The limit is **per broker** — each property records `listedBy` (the creating user),
  and the count is `properties` where `listedBy === you`.
- The backend hard-enforces it: `POST /properties` returns **403** once you're at the
  limit. The frontend gates the **Add Property** button and shows the upgrade modal.
- A **usage chip** in the header shows `used/limit` (turns red at the limit); Premium
  users see a **Premium** badge.

### Payment flow (Razorpay Subscriptions API)
```
Frontend                         Backend                       Razorpay
   │  click Upgrade                  │                              │
   ├── POST /billing/subscription ──▶│  create subscription ───────▶│
   │◀── { subscriptionId, keyId } ───┤                              │
   │  open Razorpay Checkout ────────────────────────────────────▶ │  (user pays)
   │◀── payment_id, signature ───────────────────────────────────  │
   ├── POST /billing/verify ────────▶│  verify HMAC signature       │
   │                                 │  → user.plan = "premium"     │
   │◀── { user, status } ────────────┤                              │
```
Signature check: `HMAC_SHA256(payment_id + "|" + subscription_id, KEY_SECRET)`.
A signed webhook (`POST /billing/webhook`) keeps the plan in sync with Razorpay-side
events (activated / charged / cancelled / halted).

### Mock mode vs. live mode
- **Mock (default):** `RAZORPAY_KEY_ID`/`SECRET` blank → upgrades auto-complete with no
  real payment. Lets you click the whole flow today.
- **Live:** paste your keys into `server/.env` and restart. The log flips to
  `Billing mode: LIVE` — **no code change required**. For live webhooks set
  `RAZORPAY_WEBHOOK_SECRET` and point the dashboard webhook at
  `https://<your-host>/api/billing/webhook`.

---

## 4. Configuration & keys

All backend config lives in `server/.env` (template in `server/.env.example`).
**No third-party keys are required to run** — only the Razorpay ones matter for *live*
payments.

| Key | Default | Notes |
|---|---|---|
| `PORT` | `3001` | |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | dev values | **TODO: rotate for production** |
| `SEED_PASSWORD` | `demo1234` | password for seeded broker accounts |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | _(blank)_ | **paste to enable live payments** |
| `RAZORPAY_WEBHOOK_SECRET` | _(blank)_ | required for live webhook verification |
| `RAZORPAY_PLAN_ID` | _(blank)_ | optional; auto-created if blank |
| `FREE_PROPERTY_LIMIT` / `PREMIUM_PROPERTY_LIMIT` | `10` / `100` | listing caps |
| `PREMIUM_AMOUNT` / `PREMIUM_CURRENCY` | `499900` / `INR` | price in paise (₹4,999) |
| `PREMIUM_PERIOD` | `yearly` | `yearly` or `monthly` (e.g. ₹999/month) |

---

## 5. Testing the feature manually

1. Log in as **jordan@stackline.co** → header shows `10/10 listings` in red.
2. Click **Add Property** → the **Upgrade to Premium** modal opens (instead of the form).
3. Click **Upgrade — ₹4,999/year** → in mock mode it completes instantly; the badge
   switches to **Premium** and the limit becomes 100.
4. Click **Add Property** again → the property form now opens and saves.
5. Refresh the page → you stay signed in and remain on Premium.

Reset to a clean state anytime: stop the server, `rm server/data/db.json`, restart.

---

## 6. Project layout
```
.
├── README.md                  ← this file
├── PLATFORM_DOCUMENTATION.md  ← original product/feature spec (frontend)
├── src/                       ← frontend
│   ├── App.tsx                ← routing, auth gate, add-property gating
│   ├── config/api.ts          ← axios + JWT refresh
│   ├── lib/razorpay.ts        ← Razorpay Checkout loader
│   ├── store/slices/          ← auth, properties, …, billing
│   └── components/UpgradeModal.tsx
└── server/                    ← backend (see server/README.md)
    └── src/
        ├── billing.js         ← Razorpay + plan/limit logic
        └── routes/            ← auth, properties, …, billing
```

## 7. Known simplifications (prototype)
- **Single shared workspace** — all authenticated users see the same data.
  Multi-tenancy by `firmId` is not yet enforced.
- **JSON file, not a database** — fine for local/demo; swap `server/src/db.js` for
  Postgres/SQLite for production scale and concurrent writes.
- Refresh tokens are stateless JWTs (no server-side revocation list).
