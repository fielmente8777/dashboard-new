import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  billingError,
  billingErrorCode,
  useConfirmAutoRenewMutation,
  useConfirmPaymentMutation,
  useSetAutoRenewMutation,
  useStartCheckoutMutation,
} from "../../redux/api/billingApi";
import { refreshSubscription } from "../../redux/session";
import { CheckoutClosedError, openRazorpay } from "./razorpay";

// The whole payment, step by step:
//   1. gian-new prices the choice again and creates a Razorpay order (or applies a ₹0 change)
//   2. Razorpay checkout takes the payment
//   3. gian-new checks Razorpay's signature and applies the plan (the webhook does the same,
//      so a closed tab after paying still counts)
//   4. if auto-renew was ticked, the success screen asks to set it up: a separate Razorpay window
//      that authorises the mandate (never opened by itself, so it can't look like paying twice)
// When Eazotel staff switched payments to Zoho Books (admin console → Billing → Zoho Books),
// step 1 answers with a Zoho invoice instead: its payment page opens in a new tab, and the plan
// renews by itself as soon as Zoho says it's paid (done.zohoInvoice).
// `step` drives the button text; `done` holds the account after a successful payment.
export function usePlanCheckout({ onPriceChanged }) {
  const dispatch = useDispatch();
  const [startCheckout] = useStartCheckoutMutation();
  const [confirmPayment] = useConfirmPaymentMutation();
  const [setAutoRenew] = useSetAutoRenewMutation();
  const [confirmAutoRenew] = useConfirmAutoRenewMutation();
  const [step, setStep] = useState("idle");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);

  const authorizeAutoRenew = async () => {
    setStep("autorenew");
    const mandate = await setAutoRenew(true).unwrap();
    const result = await openRazorpay({
      key: mandate.keyId,
      subscription_id: mandate.subscriptionId,
      description: mandate.description,
    });
    return confirmAutoRenew(result).unwrap();
  };

  const pay = async (choice, quote, { autoRenew, prefill }) => {
    setError(null);
    setStep("starting");
    try {
      const started = await startCheckout({ ...choice, autoRenew, expectedTotalPaise: quote.totalPaise }).unwrap();
      if (started.status === "invoice") {
        // opened from the click, so pop-up blockers let it through; the screen has the link too
        if (started.invoiceUrl) window.open(started.invoiceUrl, "_blank", "noopener");
        setDone({
          account: null,
          quote,
          zohoInvoice: { number: started.invoiceNumber, url: started.invoiceUrl, totalPaise: started.totalPaise },
          autoRenewSet: false,
          wantsAutoRenew: false,
        });
        setStep("idle");
        return;
      }
      let account;
      if (started.status === "applied") {
        account = started.account;
      } else {
        setStep("paying");
        const result = await openRazorpay({
          key: started.keyId,
          order_id: started.orderId,
          amount: started.amountPaise,
          currency: started.currency,
          description: started.description,
          prefill: { name: started.prefill?.name || prefill?.name, email: started.prefill?.email || prefill?.email },
        });
        setStep("confirming");
        account = (await confirmPayment(result).unwrap()).account;
      }
      dispatch(refreshSubscription()); // the lock screen and the menu follow the new plan
      setDone({ account, autoRenewSet: Boolean(account?.subscription?.autoRenew), wantsAutoRenew: autoRenew, quote });
      setStep("idle");
    } catch (failure) {
      setStep("idle");
      if (failure instanceof CheckoutClosedError) return;
      if (billingErrorCode(failure) === "PRICE_CHANGED") onPriceChanged?.();
      setError(billingError(failure, failure.message));
    }
  };

  // the success screen's "Set up auto-renew"; the plan is paid either way
  const setUpAutoRenew = async () => {
    setError(null);
    try {
      const account = await authorizeAutoRenew();
      setDone((d) => ({ ...d, account, autoRenewSet: true }));
    } catch (mandateError) {
      if (!(mandateError instanceof CheckoutClosedError)) setError(billingError(mandateError, mandateError.message));
    } finally {
      setStep("idle");
    }
  };

  return { pay, authorizeAutoRenew, setUpAutoRenew, step, busy: step !== "idle", error, setError, done, reset: () => setDone(null) };
}
