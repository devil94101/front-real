import { useState } from "react";
import { Check, Crown, Loader2, ShieldCheck } from "lucide-react";
import { Modal, Button } from "./ui";
import { useApp } from "../store/hooks";
import { useAppDispatch } from "../store/hooks";
import { createSubscription, verifyPayment } from "../store/slices/billingSlice";
import { openSubscriptionCheckout } from "../lib/razorpay";

function formatPrice(amount: number, currency: string, period: string) {
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : `${currency} `;
  const value = (amount / 100).toLocaleString(currency === "INR" ? "en-IN" : "en-US");
  const per = period === "yearly" ? "/year" : period === "monthly" ? "/month" : "";
  return `${symbol}${value}${per}`;
}

const PERKS = [
  "List up to 100 properties",
  "Everything in Free",
  "Priority support",
  "Cancel anytime",
];

export function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const { currentUser, billing } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const price = billing?.price;
  const limit = billing?.limit ?? 10;

  const handleUpgrade = async () => {
    setBusy(true);
    setError(null);
    try {
      const sub = await dispatch(createSubscription()).unwrap();

      if (sub.mock) {
        // No real keys configured — complete the upgrade directly.
        await dispatch(verifyPayment({ razorpay_subscription_id: sub.subscriptionId })).unwrap();
      } else {
        const result = await openSubscriptionCheckout({
          keyId: sub.keyId,
          subscriptionId: sub.subscriptionId,
          name: "Stackline Premium",
          description: "Unlimited-tier property listings",
          prefill: { name: currentUser.name, email: currentUser.email },
        });
        await dispatch(verifyPayment(result)).unwrap();
      }
      setDone(true);
    } catch (e: any) {
      // A dismissed checkout is not an error worth shouting about.
      if (e?.message !== "Checkout dismissed") {
        setError(typeof e === "string" ? e : e?.message ?? "Upgrade failed");
      }
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    setDone(false);
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="sm"
      title={
        <span className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" /> Upgrade to Premium
        </span>
      }
      subtitle={done ? undefined : "You've reached the Free plan listing limit."}
      footer={
        done ? (
          <Button variant="primary" onClick={close}>Start listing</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={close} disabled={busy}>Maybe later</Button>
            <Button variant="primary" onClick={handleUpgrade} disabled={busy}>
              {busy ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                </span>
              ) : (
                `Upgrade${price ? ` — ${formatPrice(price.amount, price.currency, price.period)}` : ""}`
              )}
            </Button>
          </>
        )
      }
    >
      {done ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <ShieldCheck className="h-7 w-7 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-ink-900">You're on Premium 🎉</h3>
          <p className="text-sm text-slate-500">
            Your listing limit is now {limit} properties. Go add your next one.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-extrabold text-ink-900">
                {price ? formatPrice(price.amount, price.currency, "") : "—"}
              </span>
              <span className="text-sm font-medium text-slate-500">
                {price?.period === "yearly" ? "per year" : price?.period === "monthly" ? "per month" : ""}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Billed via Razorpay · cancel anytime</p>
          </div>

          <ul className="space-y-2">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-2.5 text-sm text-ink-900">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-3 w-3 text-emerald-600" strokeWidth={3} />
                </span>
                {perk}
              </li>
            ))}
          </ul>

          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          {billing && billing.live === false && (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-center text-[11px] text-slate-500">
              Demo billing mode — no real payment will be charged.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
