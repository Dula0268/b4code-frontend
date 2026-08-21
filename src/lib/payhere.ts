import api from "@/lib/axios";

declare global {
  interface Window {
    payhere?: {
      onCompleted?: (orderId: string) => void;
      onDismissed?: () => void;
      onError?: (error: string) => void;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      startPayment: (payment: Record<string, any>) => void;
    };
  }
}

export function loadPayHereScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (window.payhere) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.payhere.lk/lib/payhere.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function submitPayHereForm(checkoutUrl: string, payHereParams: string) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = checkoutUrl;
  form.style.display = "none";

  const params = new URLSearchParams(payHereParams);
  params.forEach((value, key) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

export interface PayHereCheckoutOptions {
  checkoutUrl: string;
  payHereParams: string;
  onSuccess: (orderId: string) => void;
  onDismiss?: () => void;
  onError?: (error: string) => void;
}

export async function startPayHerePopup({
  checkoutUrl,
  payHereParams,
  onSuccess,
  onDismiss,
  onError,
}: PayHereCheckoutOptions): Promise<boolean> {
  try {
    const loaded = await loadPayHereScript();
    if (!loaded || !window.payhere) {
      console.warn("PayHere SDK script could not be loaded, falling back to redirect form.");
      submitPayHereForm(checkoutUrl, payHereParams);
      return false;
    }

    const params = new URLSearchParams(payHereParams);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentObj: Record<string, any> = {};

    params.forEach((value, key) => {
      paymentObj[key] = value;
    });

    if (checkoutUrl.includes("sandbox.payhere.lk")) {
      paymentObj["sandbox"] = true;
    }

    const orderId = paymentObj["order_id"] || "";

    // Failsafe: PayHere's anti-debug scripts sometimes freeze the UI and leave pointer-events: none
    // even after the modal crashes or is removed. This background interval rescues the UI.
    const rescueInterval = setInterval(() => {
      // Check if PayHere applied its lock
      if (document.body.style.pointerEvents === 'none') {
        // Look for the PayHere iframe/modal container (usually injected at the end of body)
        const hasPayhereModal = document.querySelector('iframe[src*="payhere"]') || document.getElementById('payhere-modal');
        
        if (!hasPayhereModal) {
          console.warn("PayHere modal not found but UI is locked. Rescuing pointer events...");
          document.body.style.pointerEvents = 'auto';
          document.body.style.overflow = 'auto';
          clearInterval(rescueInterval);
        }
      }
    }, 1500);

    const cleanup = () => {
      document.body.style.pointerEvents = 'auto';
      document.body.style.overflow = 'auto';
      clearInterval(rescueInterval);
    };

    window.payhere.onCompleted = async (completedOrderId: string) => {
      cleanup();
      const targetOrderId = completedOrderId || orderId;
      console.log("PayHere Popup payment completed. Order ID:", targetOrderId);
      if (targetOrderId) {
        try {
          await api.post(`/payments/verify-local/${targetOrderId}`);
        } catch (e) {
          console.log("Local payment verification fallback skipped:", e);
        }
      }
      onSuccess(targetOrderId);
    };

    window.payhere.onDismissed = () => {
      cleanup();
      console.log("PayHere Popup payment dismissed.");
      if (onDismiss) onDismiss();
    };

    window.payhere.onError = (error: string) => {
      cleanup();
      console.error("PayHere Popup payment error:", error);
      if (onError) onError(error);
    };

    console.log("Launching PayHere popup. NOTE: If DevTools is open, PayHere may intentionally freeze the page for security.");
    window.payhere.startPayment(paymentObj);
    return true;
  } catch (err) {
    console.error("PayHere popup error, falling back to form:", err);
    submitPayHereForm(checkoutUrl, payHereParams);
    return false;
  }
}
