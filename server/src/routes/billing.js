import { Router } from "express";
import { all, find, save } from "../db.js";
import { requireAuth, publicUser } from "../auth.js";
import { asyncHandler, HttpError, nowIso } from "../util.js";
import { logActivity } from "../log.js";
import {
  billingStatus,
  createSubscription,
  verifySubscriptionSignature,
  verifyWebhookSignature,
  cancelSubscription,
  isLive,
} from "../billing.js";

const router = Router();

// GET /billing/status — current plan, usage and price.
router.get(
  "/status",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ ...billingStatus(req.user), live: isLive() });
  })
);

// POST /billing/subscription — create a Razorpay subscription (or a mock one).
router.post(
  "/subscription",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.user.plan === "premium") throw new HttpError(400, "You are already on Premium");
    const sub = await createSubscription();
    res.status(201).json(sub);
  })
);

// POST /billing/verify — verify the checkout signature and activate Premium.
router.post(
  "/verify",
  requireAuth,
  asyncHandler(async (req, res) => {
    const {
      razorpay_payment_id: paymentId,
      razorpay_subscription_id: subscriptionId,
      razorpay_signature: signature,
    } = req.body || {};

    const ok = verifySubscriptionSignature({ paymentId, subscriptionId, signature });
    if (!ok) throw new HttpError(400, "Payment signature verification failed");

    const user = req.user;
    user.plan = "premium";
    user.subscriptionId = subscriptionId || `sub_mock_${user.id}`;
    user.subscriptionStatus = "active";
    user.premiumSince = nowIso();
    save();

    logActivity("note", `<b>${user.name}</b> upgraded to Premium.`, user.name);
    res.json({ user: publicUser(user), status: billingStatus(user) });
  })
);

// POST /billing/cancel — cancel the subscription and revert to free.
router.post(
  "/cancel",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = req.user;
    if (user.plan !== "premium") throw new HttpError(400, "No active Premium subscription");
    await cancelSubscription(user.subscriptionId);
    user.plan = "free";
    user.subscriptionStatus = "cancelled";
    user.subscriptionId = null;
    save();
    res.json({ user: publicUser(user), status: billingStatus(user) });
  })
);

export default router;

// ── Webhook handler ──────────────────────────────────────
// Registered separately in index.js with a raw body parser so the signature can be
// verified against the exact bytes Razorpay sent.
export function webhookHandler(req, res) {
  const signature = req.headers["x-razorpay-signature"];
  const raw = req.body instanceof Buffer ? req.body.toString("utf8") : "";

  if (!verifyWebhookSignature(raw, signature)) {
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return res.status(400).json({ message: "Invalid JSON" });
  }

  const subId = event?.payload?.subscription?.entity?.id;
  if (subId) {
    const user = all("users").find((u) => u.subscriptionId === subId);
    if (user) {
      switch (event.event) {
        case "subscription.activated":
        case "subscription.charged":
        case "subscription.resumed":
          user.plan = "premium";
          user.subscriptionStatus = "active";
          break;
        case "subscription.halted":
        case "subscription.cancelled":
        case "subscription.completed":
          user.plan = "free";
          user.subscriptionStatus = event.event.replace("subscription.", "");
          break;
        default:
          break;
      }
      save();
    }
  }

  res.json({ received: true });
}
