import { ArrowRight, BadgePercent, Info, LoaderCircle, Receipt, RefreshCw, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import Switch from "../../../components/ui/Switch";
import { fromPaise } from "../../../redux/api/billingApi";
import { cycleWords, day } from "../billingText";

const Row = ({ label, value, muted = false, accent = false }) => (
  <div className="flex items-start justify-between gap-3 py-1 text-sm">
    <span className={muted ? "text-app-text-muted" : "text-app-text"}>{label}</span>
    <span className={`shrink-0 font-medium tabular-nums ${accent ? "text-emerald-600 dark:text-emerald-400" : muted ? "text-app-text-muted" : "text-app-text"}`}>{value}</span>
  </div>
);

const STEP_TEXT = {
  starting: "Preparing payment…",
  paying: "Waiting for payment…",
  confirming: "Confirming payment…",
  autorenew: "Setting up auto-renew…",
};

// What the hotel pays, as the server priced it. Nothing here is computed in the browser.
export default function OrderSummary({
  quote,
  quoting,
  quoteError,
  offerCode,
  onApplyOffer,
  autoRenew,
  onAutoRenew,
  onPay,
  step,
  error,
  canPay,
  paymentsReady,
}) {
  const [code, setCode] = useState(offerCode || "");
  const busy = step !== "idle";

  return (
    <aside className="rounded-2xl border border-app-border! bg-app-surface p-4 @md:p-5">
      <h2 className="flex items-center gap-2 border-b border-app-border! pb-3 text-base font-semibold text-app-text">
        <Receipt className="size-4 text-orange-500" aria-hidden /> Order summary
      </h2>

      {!quote ? (
        <div className="py-10 text-center text-sm text-app-text-muted">
          {quoteError ? quoteError : quoting ? <LoaderCircle className="mx-auto size-5 animate-spin" /> : "Choose a plan to see the total."}
        </div>
      ) : (
        <div className={`transition-opacity ${quoting ? "opacity-60" : ""}`}>
          <KindNote quote={quote} />

          <div className="mt-3">
            {quote.lines.map((line) => (
              <Row key={line.code} label={line.label} value={`${fromPaise(line.monthlyPaise)}/mo`} />
            ))}
          </div>

          <div className="mt-2 border-t border-dashed border-app-border! pt-2">
            <Row label={`${quote.cycleMonths} × ${fromPaise(quote.monthlyPaise)}`} value={fromPaise(quote.grossPaise)} muted />
            {quote.cycleDiscountPaise > 0 && (
              <Row label={`${quote.cycleLabel} discount (${quote.cycleDiscountPercent}%)`} value={`− ${fromPaise(quote.cycleDiscountPaise)}`} accent />
            )}
            {quote.offer && <Row label={`Offer ${quote.offer.code}`} value={`− ${fromPaise(quote.offer.discountPaise)}`} accent />}
            {quote.creditPaise > 0 && <Row label="Credit for unused time" value={`− ${fromPaise(quote.creditPaise)}`} accent />}
            <Row label={`GST (${quote.gstPercent}%)`} value={`+ ${fromPaise(quote.gstPaise)}`} muted />
          </div>

          <div className="mt-2 flex items-end justify-between gap-3 border-t border-app-border! pt-3">
            <div>
              <p className="text-sm font-semibold text-app-text">Total today</p>
              <p className="text-xs text-app-text-muted">
                Valid until {day(quote.periodEnd)}
                {quote.bonusDays > 0 ? ` (incl. ${quote.bonusDays} bonus days)` : ""}
              </p>
            </div>
            <p className="text-2xl font-bold tracking-tight text-app-text tabular-nums">{fromPaise(quote.totalPaise)}</p>
          </div>
        </div>
      )}

      {/* offer code */}
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          onApplyOffer(code.trim());
        }}
      >
        <label htmlFor="offer-code" className="text-xs font-medium text-app-text-muted">
          Offer code
        </label>
        <div className="mt-1 flex gap-2">
          <div className="relative flex-1">
            <BadgePercent className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-app-text-muted" aria-hidden />
            <input
              id="offer-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. WELCOME20"
              className="h-9 w-full rounded-lg border border-app-border! bg-app-surface pl-8 pr-8 text-sm text-app-text uppercase outline-none focus:border-orange-500!"
            />
            {offerCode && (
              <button
                type="button"
                aria-label="Remove offer"
                onClick={() => {
                  setCode("");
                  onApplyOffer("");
                }}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-app-text-muted hover:text-app-text"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <button type="submit" disabled={!code.trim()} className="h-9 rounded-lg border border-app-border! px-3 text-sm font-medium text-app-text hover:bg-app-surface-secondary disabled:opacity-40">
            Apply
          </button>
        </div>
        {quote?.offerError && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{quote.offerError}</p>}
        {quote?.offer && <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400">{quote.offer.name} applied.</p>}
      </form>

      {/* auto-renew */}
      <div className="mt-4 flex items-start justify-between gap-3 rounded-xl bg-app-surface-secondary p-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-app-text">
            <RefreshCw className="size-3.5" aria-hidden /> Auto-renew
          </p>
          <p className="mt-0.5 text-xs leading-snug text-app-text-muted">
            {quote
              ? `Renews by itself every ${cycleWords(quote.cycleMonths)} for ${fromPaise(quote.renewalPaise)} (incl. GST). After paying you'll authorise UPI AutoPay or your card once; Razorpay may take a small refundable amount (such as ₹5) to check it. Turn it off any time in Settings.`
              : "Renew by itself at the end of each period. Turn it off any time."}
          </p>
        </div>
        <Switch checked={autoRenew} onChange={onAutoRenew} label="Auto-renew" disabled={busy} />
      </div>

      {error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {!paymentsReady ? (
        <p className="mt-4 flex gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden /> Online payment is being set up. Please contact Eazotel support to renew.
        </p>
      ) : !canPay ? (
        <p className="mt-4 flex gap-2 rounded-lg bg-app-surface-secondary px-3 py-2 text-sm text-app-text-muted">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden /> Only the account owner can pay. Ask them to sign in and renew.
        </p>
      ) : (
        <button
          type="button"
          onClick={onPay}
          disabled={!quote || quoting || busy || Boolean(quote?.offerError)}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-500 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <>
              <LoaderCircle className="size-4 animate-spin" /> {STEP_TEXT[step]}
            </>
          ) : quote?.totalPaise === 0 ? (
            <>
              Switch plan now <ArrowRight className="size-4" />
            </>
          ) : (
            <>
              Pay {quote ? fromPaise(quote.totalPaise) : ""} <ArrowRight className="size-4" />
            </>
          )}
        </button>
      )}
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-app-text-muted">
        <ShieldCheck className="size-3.5" aria-hidden /> Secure payment by Razorpay · UPI, cards, net banking
      </p>
    </aside>
  );
}

function KindNote({ quote }) {
  const text =
    quote.kind === "renew"
      ? `Renewal: ${cycleWords(quote.cycleMonths)} added after your current end (${day(quote.periodStart)}).`
      : quote.kind === "change"
        ? `Your new plan starts today. The unused part of your current plan is taken off the price.`
        : `Starts today. Your apps unlock as soon as the payment goes through.`;
  return <p className="mt-3 rounded-lg bg-blue-500/5 px-3 py-2 text-xs leading-snug text-app-text-muted">{text}</p>;
}
