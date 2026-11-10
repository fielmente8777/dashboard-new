import { RAZORPAY_CHECKOUT_SCRIPT_URL } from "../../config/env";

let loading = null;

// Loads Razorpay's checkout script once.
const loadScript = () => {
  if (window.Razorpay) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = RAZORPAY_CHECKOUT_SCRIPT_URL;
      script.onload = () => resolve();
      script.onerror = () => {
        script.remove();
        loading = null;
        reject(new Error("Could not load the payment window. Check your connection and try again."));
      };
      document.body.appendChild(script);
    });
  }
  return loading;
};

export class CheckoutClosedError extends Error {
  constructor() {
    super("Payment window closed");
    this.name = "CheckoutClosedError";
  }
}

// Opens Razorpay checkout and resolves with its handler result
// ({ razorpay_payment_id, razorpay_order_id | razorpay_subscription_id, razorpay_signature }).
// Rejects with CheckoutClosedError when the hotel closes it, or with Razorpay's reason when a
// payment fails. `options` is everything for Razorpay except the handler.
export async function openRazorpay(options) {
  await loadScript();
  return new Promise((resolve, reject) => {
    let failure = null;
    const checkout = new window.Razorpay({
      name: "Eazotel Technologies Pvt Ltd",
      theme: { color: "#152547" },
      ...options,
      handler: (result) => resolve(result),
      modal: {
        ondismiss: () => reject(failure ?? new CheckoutClosedError()),
        confirm_close: true,
      },
    });
    // Razorpay lets the guest retry inside the window; remember the reason in case they close it
    checkout.on("payment.failed", (response) => {
      failure = new Error(response?.error?.description || "The payment failed. No money was taken.");
    });
    checkout.open();
  });
}
