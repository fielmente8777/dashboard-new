import { BadgePercent, CalendarClock, CircleCheck, Download, LoaderCircle, PartyPopper, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import { ErrorState, Skeleton } from "../../components/ui/States";
import {
  billingError,
  downloadInvoice,
  fromPaise,
  useGetBillingAccountQuery,
  useQuotePlanMutation,
} from "../../redux/api/billingApi";
import { dashboardPath, PAGES } from "../../routes/paths";
import AddonList from "./components/AddonList";
import CycleSelector from "./components/CycleSelector";
import ModeSwitch from "./components/ModeSwitch";
import OrderSummary from "./components/OrderSummary";
import PlanCard from "./components/PlanCard";
import { day, PHASE_LABELS, PHASE_TONES, purchasable } from "./billingText";
import { usePlanCheckout } from "./usePlanCheckout";

// Upgrade and renew, inside the dashboard (the lock screen never covers this page), as two modes:
//   renew   - only the plan the hotel is on, with its add-ons and seats ticked; more can be added
//   upgrade - every plan to compare and switch to
// gian-new prices the choice (the browser never sends an amount) and Razorpay takes the payment.
// A hotel without a paid plan (trial, never paid) only sees "upgrade". ?plan=PRO&cycle=12 (from
// the website's pricing page) opens "upgrade" with that plan picked.
//
// Layout follows the page's own width (container queries, `@container`), not the screen's, because
// the sidebar takes part of the screen: one column on phones and small tablets with a pay bar
// stuck to the bottom, the order summary beside the plans from about 900px of page width. The plans
// column is its own container too, so its grids follow the column's width, not the page's.
export default function PlansPage() {
  const account = useGetBillingAccountQuery();
  const [params] = useSearchParams();
  const [quotePlan] = useQuotePlanMutation();

  const [mode, setMode] = useState("upgrade");
  const [planId, setPlanId] = useState(null);
  const [cycleMonths, setCycleMonths] = useState(null);
  const [addonCodes, setAddonCodes] = useState([]);
  const [seats, setSeats] = useState(0);
  const [offerCode, setOfferCode] = useState(params.get("offer")?.toUpperCase() || "");
  const [autoRenew, setAutoRenew] = useState(false);
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState(null);
  const [quoteRound, setQuoteRound] = useState(0);
  const checkout = usePlanCheckout({ onPriceChanged: () => setQuoteRound((n) => n + 1) });
  const summaryRef = useRef(null);
  // the bottom pay bar hides while the order summary itself is on screen
  const [summaryVisible, setSummaryVisible] = useState(false);
  useEffect(() => {
    const el = summaryRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => setSummaryVisible(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [account.data, checkout.done]);

  const data = account.data;
  const plans = useMemo(() => data?.catalogue.plans ?? [], [data]);
  const apps = useMemo(() => data?.catalogue.apps ?? [], [data]);
  const cycles = useMemo(() => data?.catalogue.settings.cycles ?? [], [data]);
  const plan = plans.find((p) => p.id === planId) ?? null;
  const cycle = cycles.find((c) => c.months === cycleMonths) ?? null;

  // first load: the current plan (renew), or the one the website asked for, or the most popular
  const initialised = useRef(false);
  useEffect(() => {
    if (!data || initialised.current) return;
    initialised.current = true;
    const buyable = plans.filter(purchasable);
    const fromUrl = buyable.find((p) => p.code === params.get("plan")?.toUpperCase());
    const current = data.current && buyable.find((p) => p.id === data.current.planId);
    const start = fromUrl ?? current ?? buyable.find((p) => p.featured) ?? buyable[0];
    const months = Number(params.get("cycle")) || data.current?.cycleMonths || 12;
    setMode(current && !fromUrl ? "renew" : "upgrade");
    setPlanId(start?.id ?? null);
    setCycleMonths(cycles.some((c) => c.months === months) ? months : (cycles.at(-1)?.months ?? 1));
    if (current && start?.id === current.id) {
      setAddonCodes(data.current.addonCodes ?? []);
      setSeats(data.current.seats ?? 0);
    }
    setAutoRenew(Boolean(data.subscription?.autoRenew));
  }, [data, plans, cycles, params]);

  // ask the server for the price whenever the choice changes (a little after the last click)
  useEffect(() => {
    if (!planId || !cycleMonths) return undefined;
    setQuoting(true);
    const timer = setTimeout(async () => {
      try {
        const result = await quotePlan({ planId, cycleMonths, addonCodes, seats, offerCode: offerCode || null }).unwrap();
        setQuote(result);
        setQuoteError(null);
      } catch (error) {
        setQuote(null);
        setQuoteError(billingError(error, "Could not price this choice."));
      } finally {
        setQuoting(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [planId, cycleMonths, addonCodes, seats, offerCode, quoteRound, quotePlan]);

  if (account.isLoading) {
    return (
      <Frame>
        <Skeleton className="h-16 rounded-xl" />
        <div className="mt-6 grid grid-cols-1 gap-4 @2xl:grid-cols-2 @6xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </Frame>
    );
  }
  if (account.isError || !data) {
    return (
      <Frame>
        <ErrorState message={billingError(account.error, "Could not load the plans.")} onRetry={account.refetch} />
      </Frame>
    );
  }
  if (checkout.done?.zohoInvoice) {
    return (
      <Frame>
        <ZohoInvoiceStarted invoice={checkout.done.zohoInvoice} onBack={checkout.reset} />
      </Frame>
    );
  }
  if (checkout.done) {
    return (
      <Frame>
        <Success checkout={checkout} />
      </Frame>
    );
  }

  const maxDiscount = Math.max(0, ...cycles.map((c) => c.discountPercent));
  // renewing needs a paid plan that can still be bought online
  const currentPlan = data.current ? (plans.find((p) => p.id === data.current.planId && purchasable(p)) ?? null) : null;
  const renewing = mode === "renew" && currentPlan;
  const allExtras = plan ? apps.filter((a) => !plan.includedApps.includes(a.code)).map((a) => a.code) : [];

  const onMode = (next) => {
    setMode(next);
    if (next === "renew" && currentPlan) {
      // back to exactly what the hotel has, so the summary shows a plain renewal
      setPlanId(currentPlan.id);
      setAddonCodes(data.current.addonCodes ?? []);
      setSeats(data.current.seats ?? 0);
      if (cycles.some((c) => c.months === data.current.cycleMonths)) setCycleMonths(data.current.cycleMonths);
    }
  };
  const onChoosePlan = (next) => {
    setPlanId(next.id);
    // add-ons the new plan includes are dropped by the server; drop them here too
    setAddonCodes((codes) => codes.filter((c) => !next.includedApps.includes(c)));
  };
  const onPay = () =>
    checkout.pay({ planId, cycleMonths, addonCodes, seats, offerCode: offerCode || null }, quote, { autoRenew });
  const canPayNow = data.paymentsReady && data.canPay && quote && !quoting && !quote.offerError && !checkout.busy;

  return (
    <Frame>
      <CurrentPlan data={data} />

      <header className="mt-6">
        <h1 className="text-2xl font-bold tracking-tight text-app-text @2xl:text-3xl">
          {!currentPlan ? "Choose your plan" : renewing ? `Renew your ${currentPlan.name} plan` : "Upgrade or change your plan"}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-app-text-muted">
          Every plan includes your hotel website, CMS, SEO tools, front desk and payment gateway. Add apps only when you need them.
        </p>
      </header>

      {data.catalogue.offers.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-orange-500/30! bg-orange-500/5 px-4 py-3 text-sm text-app-text">
          <BadgePercent className="size-4 shrink-0 text-orange-500" aria-hidden />
          {data.catalogue.offers.map((o) => (
            <span key={o.code}>
              <b>{o.name}</b>
              {o.description ? `: ${o.description}` : ""} · code{" "}
              <button type="button" className="font-mono font-semibold text-orange-600 underline" onClick={() => setOfferCode(o.code)}>
                {o.code}
              </button>
            </span>
          ))}
        </div>
      )}

      {currentPlan && (
        <div className="mt-5">
          <ModeSwitch mode={mode} onChange={onMode} currentPlanName={currentPlan.name} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 @4xl:grid-cols-[minmax(0,1fr)_320px] @4xl:items-start @6xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="@container min-w-0 space-y-8">
          <section aria-labelledby="cycle-heading">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h2 id="cycle-heading" className="text-base font-semibold text-app-text">
                1. How often do you want to pay?
              </h2>
              {maxDiscount > 0 && <p className="text-xs text-app-text-muted">Save up to {maxDiscount}% with a longer cycle</p>}
            </div>
            <CycleSelector cycles={cycles} value={cycleMonths} onChange={setCycleMonths} planPrice={plan?.price ?? 0} />
          </section>

          <section aria-labelledby="plan-heading">
            <h2 id="plan-heading" className="mb-3 text-base font-semibold text-app-text">
              2. {renewing ? "Your plan" : "Choose a plan"}
            </h2>
            {renewing ? (
              <div className="min-w-0 max-w-md pt-3">
                <PlanCard plan={currentPlan} apps={apps} cycle={cycle} selected current onSelect={() => {}} />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 pt-3 @xl:grid-cols-2 @4xl:grid-cols-3">
                {plans.map((p) => (
                  <PlanCard
                    key={p.id}
                    plan={p}
                    apps={apps}
                    cycle={cycle}
                    selected={p.id === planId}
                    current={data.current?.planId === p.id && data.phase !== "ended" && data.phase !== "stopped"}
                    onSelect={() => onChoosePlan(p)}
                  />
                ))}
              </div>
            )}
          </section>

          {plan && (
            <AddonList
              plan={plan}
              apps={apps}
              selected={addonCodes}
              onToggle={(code) => setAddonCodes((codes) => (codes.includes(code) ? codes.filter((c) => c !== code) : [...codes, code]))}
              onSelectAll={(on) => setAddonCodes(on ? allExtras : [])}
              seats={seats}
              onSeats={setSeats}
              seatPrice={data.catalogue.settings.seatPrice}
              teamIncluded={plan.limits.teamMembers}
            />
          )}
        </div>

        <div ref={summaryRef} className="min-w-0 scroll-mt-4 @4xl:sticky @4xl:top-4">
          <OrderSummary
            quote={quote}
            quoting={quoting}
            quoteError={quoteError}
            offerCode={offerCode}
            onApplyOffer={setOfferCode}
            autoRenew={data.paymentProvider === "zoho" ? false : autoRenew}
            onAutoRenew={setAutoRenew}
            zoho={data.paymentProvider === "zoho"}
            step={checkout.step}
            error={checkout.error}
            canPay={data.canPay}
            paymentsReady={data.paymentsReady}
            onPay={onPay}
          />
        </div>
      </div>

      {/* phones and tablets: the total and Pay stay in reach while choosing */}
      {quote && !summaryVisible && (
        <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-app-border! bg-app-surface/95 px-4 py-3 backdrop-blur @2xl:-mx-6 @2xl:px-6 @4xl:hidden">
          {/* room on the right for the floating AI assistant button */}
          <div className="flex items-center justify-between gap-3 pr-16">
            <button type="button" onClick={() => summaryRef.current?.scrollIntoView({ behavior: "smooth" })} className="min-w-0 text-left">
              <span className="block text-xs text-app-text-muted">Total today · see details</span>
              <span className="block text-lg font-bold text-app-text tabular-nums">{fromPaise(quote.totalPaise)}</span>
            </button>
            {canPayNow ? (
              <button
                type="button"
                onClick={onPay}
                className="h-11 shrink-0 rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
              >
                {quote.totalPaise === 0 ? "Switch now" : "Pay now"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => summaryRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="h-11 shrink-0 rounded-lg border border-app-border! px-4 text-sm font-medium text-app-text"
              >
                {checkout.busy ? <LoaderCircle className="size-4 animate-spin" /> : "Review"}
              </button>
            )}
          </div>
        </div>
      )}
    </Frame>
  );
}

// The page frame inside the dashboard: padding, and the container the layout measures.
function Frame({ children }) {
  return (
    <div className="@container min-h-full px-4 pt-4 pb-0 @2xl:px-6 @2xl:pt-6">
      <div className="mx-auto max-w-[1400px] pb-6">{children}</div>
    </div>
  );
}

function CurrentPlan({ data }) {
  const sub = data.subscription;
  if (!sub) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-app-border! bg-app-surface px-4 py-3">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <Badge tone={PHASE_TONES[data.phase]}>{PHASE_LABELS[data.phase]}</Badge>
        <span className="text-sm text-app-text">
          <b>{sub.planName || "Your plan"}</b>
          {data.phase === "ended" || data.phase === "stopped"
            ? ` · ended ${day(sub.endDate)}`
            : ` · ${sub.daysLeft} ${sub.daysLeft === 1 ? "day" : "days"} left · until ${day(sub.endDate)}`}
        </span>
      </div>
      <span className="flex items-center gap-1.5 text-xs text-app-text-muted">
        <RefreshCw className="size-3.5" aria-hidden />
        {sub.autoRenew ? `Auto-renews ${day(sub.endDate)}` : "Auto-renew off"}
      </span>
    </div>
  );
}

/** After the pay button made a Zoho Books invoice: pay it there, the plan renews by itself. */
function ZohoInvoiceStarted({ invoice, onBack }) {
  return (
    <div className="flex justify-center py-4 @2xl:py-10">
      <section className="w-full max-w-md rounded-2xl border border-app-border! bg-app-surface p-6 text-center shadow-xl @2xl:p-8">
        <span className="mx-auto grid size-14 place-content-center rounded-2xl bg-orange-500/15 text-orange-600">
          <CalendarClock className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-app-text">Your invoice is ready</h1>
        <p className="mt-2 text-sm text-app-text-muted">
          Invoice {invoice.number} for {fromPaise(invoice.totalPaise)} (GST included) opened in a new tab. Pay it there by UPI,
          card or net banking. Your plan renews by itself as soon as the payment is through, usually within a few minutes.
        </p>
        {invoice.url && (
          <a
            href={invoice.url}
            target="_blank"
            rel="noreferrer"
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-500 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            Open the payment page
          </a>
        )}
        <button type="button" onClick={onBack} className="mt-3 text-sm text-app-text-muted hover:text-app-text">
          Back to plans
        </button>
        <p className="mt-4 text-xs text-app-text-muted">The invoice is also emailed to you and listed under Settings → Subscription.</p>
      </section>
    </div>
  );
}

function Success({ checkout }) {
  const { done } = checkout;
  const sub = done.account?.subscription;
  const invoice = done.account?.payments?.find((p) => p.invoice)?.invoice ?? null;
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const renewal = sub?.autoRenewal;
  const home = dashboardPath(PAGES.HOME);

  const onDownload = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadInvoice(invoice.id);
    } catch (error) {
      setDownloadError(error.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex justify-center py-4 @2xl:py-10">
      <section className="w-full max-w-md rounded-2xl border border-app-border! bg-app-surface p-6 text-center shadow-xl @2xl:p-8">
        <span className="mx-auto grid size-14 place-content-center rounded-2xl bg-emerald-500/15 text-emerald-600">
          <PartyPopper className="size-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-app-text">Payment successful</h1>
        <p className="mt-2 text-sm text-app-text-muted">
          {done.quote.totalPaise > 0 ? `We received ${fromPaise(done.quote.totalPaise)}. ` : ""}
          {invoice ? `Your invoice ${invoice.number} is on its way to your email.` : "A receipt is on its way to your email."}
        </p>
        <ul className="mt-6 space-y-2 text-left text-sm">
          <li className="flex items-center gap-2 text-app-text">
            <CircleCheck className="size-4 shrink-0 text-emerald-500" aria-hidden /> {sub?.planName} plan
          </li>
          <li className="flex items-center gap-2 text-app-text">
            <CalendarClock className="size-4 shrink-0 text-emerald-500" aria-hidden /> Valid until {day(sub?.endDate)}
          </li>
          {done.autoRenewSet && (
            <li className="flex items-center gap-2 text-app-text">
              <RefreshCw className="size-4 shrink-0 text-emerald-500" aria-hidden /> Auto-renew is on
            </li>
          )}
        </ul>

        {invoice && (
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-app-border! text-sm font-medium text-app-text hover:bg-app-surface-secondary disabled:opacity-60"
          >
            {downloading ? <LoaderCircle className="size-4 animate-spin" /> : <Download className="size-4" />}
            Download invoice {invoice.number}
          </button>
        )}
        {downloadError && <p className="mt-2 text-xs text-red-600">{downloadError}</p>}

        {done.wantsAutoRenew && !done.autoRenewSet && (
          <div className="mt-6 rounded-xl border border-orange-500/30! bg-orange-500/5 p-4 text-left">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-app-text">
              <RefreshCw className="size-4 shrink-0 text-orange-500" aria-hidden /> One more step: turn on auto-renew
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-app-text-muted">
              Razorpay will ask you to authorise UPI AutoPay or your card once. To check it works, it may take a small
              amount (such as ₹5) and refund it. This is not another payment for your plan.
              {renewal?.amountPaise
                ? ` Your first automatic renewal will be ${fromPaise(renewal.amountPaise)} on ${day(sub?.endDate)}.`
                : ` Your first automatic renewal will be on ${day(sub?.endDate)}.`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={checkout.setUpAutoRenew}
                disabled={checkout.busy}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {checkout.busy && <LoaderCircle className="size-4 animate-spin" />}
                Set up auto-renew
              </button>
              <Link to={home} className="inline-flex h-9 items-center px-3 text-sm text-app-text-muted hover:text-app-text">
                Not now
              </Link>
            </div>
            {checkout.error && <p className="mt-2 text-xs text-red-600">{checkout.error}</p>}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <Link to={home} className="flex h-11 items-center justify-center rounded-lg bg-orange-500 text-sm font-semibold text-white hover:bg-orange-600">
            Go to dashboard
          </Link>
          <button type="button" onClick={checkout.reset} className="h-10 text-sm text-app-text-muted hover:text-app-text">
            Back to plans
          </button>
        </div>
      </section>
    </div>
  );
}
