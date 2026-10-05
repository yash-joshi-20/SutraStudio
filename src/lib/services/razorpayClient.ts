"use client";

/**
 * SUTRA STUDIO — Razorpay Client Checkout Integration
 * Dynamically loads official Razorpay Checkout SDK and provides
 * double-click protected, branded checkout experience.
 */

export interface RazorpayCheckoutOptions {
  key: string;
  amount?: number; // in paise
  amountINR?: number; // in INR (auto-converted to paise if amount omitted)
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  onSuccess: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure?: (error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
  }) => void;
  onError?: (err: any) => void;
  onDismiss?: () => void;
}

let scriptLoadingPromise: Promise<boolean> | null = null;

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if ((window as any).Razorpay) {
    return Promise.resolve(true);
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve) => {
    // Check if already in DOM
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("[Razorpay SDK] Failed to load checkout script from CDN.");
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return scriptLoadingPromise;
}

export async function openRazorpayCheckout(
  options: RazorpayCheckoutOptions
): Promise<{ success: boolean; error?: string }> {
  // Catch mock orders generated when RAZORPAY_KEY_SECRET is absent
  if (options.order_id && options.order_id.startsWith("mock_rp_")) {
    console.warn("[Razorpay] Mock order ID detected. Simulating successful checkout.");
    setTimeout(() => {
      options.onSuccess({
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_order_id: options.order_id,
        razorpay_signature: "mock_signature_for_testing",
      });
    }, 1500);
    return { success: true };
  }

  const loaded = await loadRazorpayScript();
  if (!loaded || !(window as any).Razorpay) {
    return {
      success: false,
      error: "Unable to load Razorpay payment gateway. Please check your internet connection.",
    };
  }

  try {
    const paiseAmount =
      typeof options.amount === "number"
        ? options.amount
        : typeof options.amountINR === "number"
        ? Math.round(options.amountINR * 100)
        : 10000;

    const rzpOptions = {
      key: options.key,
      amount: paiseAmount,
      currency: options.currency || "INR",
      name: options.name || "Sutra Studio",
      description: options.description || "Studio Creative Commission",
      image: options.image || "/favicon.ico",
      order_id: options.order_id,
      prefill: {
        name: options.prefill?.name || "",
        email: options.prefill?.email || "",
        contact: options.prefill?.contact || "",
      },
      notes: options.notes || {},
      theme: {
        color: options.theme?.color || "#5C3A1E",
        backdrop_color: options.theme?.backdrop_color || "rgba(23, 23, 23, 0.6)",
      },
      handler: function (response: any) {
        if (
          response &&
          response.razorpay_payment_id &&
          response.razorpay_order_id &&
          response.razorpay_signature
        ) {
          options.onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
        }
      },
      modal: {
        ondismiss: function () {
          if (options.onDismiss) {
            options.onDismiss();
          }
        },
        escape: true,
        backdropclose: false,
      },
    };

    const instance = new (window as any).Razorpay(rzpOptions);

    instance.on("payment.failed", function (response: any) {
      if (options.onFailure && response && response.error) {
        options.onFailure(response.error);
      }
      if (options.onError && response && response.error) {
        options.onError(response.error);
      }
    });

    instance.open();
    return { success: true };
  } catch (err: any) {
    console.error("[Razorpay Modal] Error opening checkout instance:", err);
    return {
      success: false,
      error: err?.message || "Failed to initialize Razorpay checkout window.",
    };
  }
}
