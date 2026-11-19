import { ArrowRight, Building2, Check, CircleCheck, Headphones, Home, Sparkles, Users } from "lucide-react";
import { appIcon, effectiveMonthly, limitText, purchasable, SUPPORT_LABELS } from "../billingText";
import { rupees } from "../../../redux/api/billingApi";

const SALES_WHATSAPP_URL = "https://wa.me/919501868775?text=Hi%20Eazotel%2C%20I%27d%20like%20to%20talk%20about%20the%20Enterprise%20plan";

// One plan to choose. The price shown is per month after the chosen cycle's discount.
export default function PlanCard({ plan, apps, cycle, selected, current, onSelect }) {
  const canBuy = purchasable(plan);
  const monthly = effectiveMonthly(plan.price, cycle);
  const discounted = canBuy && monthly < plan.price;
  const included = apps.filter((a) => plan.includedApps.includes(a.code));

  return (
    <article
      className={`relative flex min-w-0 flex-col rounded-2xl border bg-app-surface p-5 transition ${
        selected
          ? "border-orange-500! shadow-lg ring-2 ring-orange-500/30"
          : plan.featured
            ? "border-orange-500/40!"
            : "border-app-border!"
      }`}
    >
      {(current || plan.featured) && (
        <span
          className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap text-white uppercase ${
            current ? "bg-emerald-600" : "bg-orange-500"
          }`}
        >
          {current ? "Your plan" : "Most popular"}
        </span>
      )}

      <h3 className="text-lg font-bold text-app-text">{plan.name}</h3>
      <p className="mt-1 min-h-10 text-sm leading-snug text-app-text-muted">{plan.tagline}</p>

      <div className="mt-4 min-h-16">
        {canBuy ? (
          <>
            <p className="flex flex-wrap items-baseline gap-x-1.5">
              <span className="text-3xl font-bold tracking-tight text-app-text">{rupees(monthly)}</span>
              <span className="text-sm text-app-text-muted">/ month</span>
              {discounted && <span className="text-sm text-app-text-muted line-through">{rupees(plan.price)}</span>}
            </p>
            <p className="mt-0.5 text-xs text-app-text-muted">
              {cycle?.months > 1 ? `${rupees(monthly * cycle.months)} billed every ${cycle.label.toLowerCase()} period` : "Billed monthly"} · + GST
            </p>
          </>
        ) : (
          <>
            <p className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-app-text">
              <span className="grid size-9 shrink-0 place-content-center rounded-lg bg-orange-500/15 text-orange-500">
                <Building2 className="size-5" aria-hidden />
              </span>
              {plan.customPriceLabel || "Let's talk"}
            </p>
            <p className="mt-1.5 text-xs text-app-text-muted">{plan.customPriceNote || "A quote built around your properties"}</p>
          </>
        )}
      </div>

      <div className="mt-4">
        {canBuy ? (
          <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className={`flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition ${
              selected ? "bg-orange-500 text-white" : "border border-app-border! text-app-text hover:border-orange-500! hover:text-orange-600"
            }`}
          >
            {selected ? (
              <>
                <CircleCheck className="size-4" /> Selected
              </>
            ) : current ? (
              "Renew this plan"
            ) : (
              "Choose plan"
            )}
          </button>
        ) : (
          <a
            href={SALES_WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-app-border! py-2.5 text-sm font-semibold text-app-text hover:border-orange-500! hover:text-orange-600"
          >
            {plan.customCtaLabel || "Talk to sales"} <ArrowRight className="size-4" />
          </a>
        )}
      </div>

      <div className="mt-5 space-y-4 border-t border-app-border! pt-4 text-sm">
        {plan.highlights?.length > 0 && (
          <ul className="space-y-1.5">
            {plan.highlights.map((h) => (
              <li key={h} className="flex gap-2 text-app-text">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden />
                {h}
              </li>
            ))}
          </ul>
        )}
        {included.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold tracking-wider text-app-text-muted uppercase">Apps included</p>
            <div className="flex flex-wrap gap-1.5">
              {included.map((a) => {
                const AppIcon = appIcon(a.code);
                return (
                  <span key={a.code} className="inline-flex items-center gap-1 rounded-md bg-app-surface-secondary px-2 py-1 text-xs text-app-text">
                    <AppIcon className="size-3.5 text-orange-500" aria-hidden /> {a.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        <ul className="space-y-1 text-xs text-app-text-muted">
          <li className="flex items-center gap-2">
            <Users className="size-3.5" aria-hidden /> {limitText(plan.limits.teamMembers, "team members")}
          </li>
          <li className="flex items-center gap-2">
            <Home className="size-3.5" aria-hidden /> {limitText(plan.limits.properties, plan.limits.properties === 1 ? "property" : "properties")}
          </li>
          <li className="flex items-center gap-2">
            <Sparkles className="size-3.5" aria-hidden /> {limitText(plan.limits.aiCreditsMonthly, "AI credits / month")}
          </li>
          <li className="flex items-center gap-2">
            <Headphones className="size-3.5" aria-hidden /> {SUPPORT_LABELS[plan.support] || plan.support}
          </li>
        </ul>
      </div>
    </article>
  );
}
