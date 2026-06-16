import crypto from "node:crypto";
import Razorpay from "razorpay";
import { all, getDb, save } from "./db.js";

// ── Config ───────────────────────────────────────────────
export const KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const PLAN_ID_ENV = process.env.RAZORPAY_PLAN_ID || "";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

export const FREE_LIMIT = Number(process.env.FREE_PROPERTY_LIMIT || 10);
export const PREMIUM_LIMIT = Number(process.env.PREMIUM_PROPERTY_LIMIT || 100);

export const PRICE = {
  amount: Number(process.env.PREMIUM_AMOUNT || 499900),
  currency: process.env.PREMIUM_CURRENCY || "INR",
  period: process.env.PREMIUM_PERIOD || "yearly",
  interval: Number(process.env.PREMIUM_INTERVAL || 1),
  totalCount: Number(process.env.PREMIUM_TOTAL_COUNT || 5),
};

// Live only when both keys are present. Otherwise we run a MOCK flow that lets the
// whole upgrade path be exercised locally without real Razorpay credentials.
export const isLive = () => Boolean(KEY_ID && KEY_SECRET);

let _client = null;
function client() {
  if (!_client) _client = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
  return _client;
}

// ── Plan & limit math ────────────────────────────────────
export const planLimit = (user) => (user.plan === "premium" ? PREMIUM_LIMIT : FREE_LIMIT);

export const countListings = (userId) =>
  all("properties").filter((p) => p.listedBy === userId).length;

export function billingStatus(user) {
  const limit = planLimit(user);
  const used = countListings(user.id);
  return {
    plan: user.plan || "free",
    limit,
    used,
    remaining: Math.max(0, limit - used),
    canList: used < limit,
    subscriptionStatus: user.subscriptionStatus || null,
    price: { amount: PRICE.amount, currency: PRICE.currency, period: PRICE.period },
  };
}

// ── Razorpay plan (created lazily and cached) ────────────
async function ensurePlanId() {
  if (PLAN_ID_ENV) return PLAN_ID_ENV;
  const settings = getDb().settings;
  if (settings.razorpayPlanId) return settings.razorpayPlanId;

  const plan = await client().plans.create({
    period: PRICE.period,
    interval: PRICE.interval,
    item: { name: "Stackline Premium", amount: PRICE.amount, currency: PRICE.currency },
  });
  settings.razorpayPlanId = plan.id;
  save();
  return plan.id;
}

// ── Subscription creation ────────────────────────────────
export async function createSubscription() {
  if (!isLive()) {
    // Mock: no real Razorpay call. The frontend detects `mock` and completes
    // the upgrade by calling /verify directly.
    return {
      mock: true,
      subscriptionId: `sub_mock_${crypto.randomBytes(8).toString("hex")}`,
      keyId: "rzp_test_mock",
      amount: PRICE.amount,
      currency: PRICE.currency,
    };
  }

  const planId = await ensurePlanId();
  const sub = await client().subscriptions.create({
    plan_id: planId,
    total_count: PRICE.totalCount,
    customer_notify: 1,
  });
  return {
    mock: false,
    subscriptionId: sub.id,
    keyId: KEY_ID,
    amount: PRICE.amount,
    currency: PRICE.currency,
  };
}

// ── Signature verification ───────────────────────────────
// Razorpay subscription checkout returns razorpay_payment_id, razorpay_subscription_id
// and razorpay_signature. The expected signature is HMAC_SHA256(payment_id|subscription_id).
export function verifySubscriptionSignature({ paymentId, subscriptionId, signature }) {
  if (!isLive()) return true; // mock mode
  if (!paymentId || !subscriptionId || !signature) return false;
  const expected = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(`${paymentId}|${subscriptionId}`)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function verifyWebhookSignature(rawBody, signature) {
  if (!WEBHOOK_SECRET || !signature) return false;
  const expected = crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

// ── Cancellation ─────────────────────────────────────────
export async function cancelSubscription(subscriptionId) {
  if (isLive() && subscriptionId && !subscriptionId.startsWith("sub_mock_")) {
    await client().subscriptions.cancel(subscriptionId, false);
  }
}
