// Loads the Razorpay Checkout script on demand and opens the hosted checkout.

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

let loaderPromise: Promise<boolean> | null = null;

export function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => {
      loaderPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });
  return loaderPromise;
}

export interface CheckoutResult {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

export interface CheckoutOptions {
  keyId: string;
  subscriptionId: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string };
  themeColor?: string;
}

// Opens the Razorpay subscription checkout. Resolves with the handler payload on
// success, rejects if the user dismisses the modal or the script fails to load.
export async function openSubscriptionCheckout(opts: CheckoutOptions): Promise<CheckoutResult> {
  const ok = await loadRazorpay();
  if (!ok || !window.Razorpay) throw new Error("Could not load Razorpay checkout");

  return new Promise<CheckoutResult>((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: opts.keyId,
      subscription_id: opts.subscriptionId,
      name: opts.name,
      description: opts.description,
      prefill: opts.prefill ?? {},
      theme: { color: opts.themeColor ?? "#2563eb" },
      handler: (response: CheckoutResult) => resolve(response),
      modal: { ondismiss: () => reject(new Error("Checkout dismissed")) },
    });
    rzp.open();
  });
}
