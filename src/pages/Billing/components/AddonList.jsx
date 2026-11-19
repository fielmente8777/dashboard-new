import { Check, Minus, Plus } from "lucide-react";
import { appIcon } from "../billingText";
import { rupees } from "../../../redux/api/billingApi";

// The apps the chosen plan doesn't include, to add at their own monthly price, plus extra seats.
export default function AddonList({ plan, apps, selected, onToggle, onSelectAll, seats, onSeats, seatPrice, teamIncluded }) {
  const included = new Set(plan?.includedApps || []);
  const extras = apps.filter((a) => !included.has(a.code));
  const allOn = extras.length > 0 && extras.every((a) => selected.includes(a.code));

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-app-text">3. Add apps</h2>
            <p className="mt-0.5 text-xs text-app-text-muted">
              {extras.length
                ? `Pay only for what you add. Prices per month, before GST. ${selected.filter((c) => !included.has(c)).length} of ${extras.length} selected.`
                : "Your plan already includes every app."}
            </p>
          </div>
          {extras.length > 1 && (
            <button
              type="button"
              onClick={() => onSelectAll(!allOn)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-app-border! px-3 text-xs font-semibold text-app-text hover:border-orange-500! hover:text-orange-600"
            >
              <span
                className={`grid size-4 place-content-center rounded border ${allOn ? "border-orange-500! bg-orange-500 text-white" : "border-app-border!"}`}
                aria-hidden
              >
                {allOn && <Check className="size-3" />}
              </span>
              {allOn ? "Clear all" : "Select all"}
            </button>
          )}
        </div>
        <ul className="grid grid-cols-1 gap-2.5 @xl:grid-cols-2">
          {extras.map((app) => {
            const on = selected.includes(app.code);
            const AppIcon = appIcon(app.code);
            return (
              <li key={app.code} className="min-w-0">
                <button
                  type="button"
                  onClick={() => onToggle(app.code)}
                  aria-pressed={on}
                  className={`flex w-full items-start gap-3 rounded-xl border bg-app-surface p-3.5 text-left transition ${
                    on ? "border-orange-500! ring-1 ring-orange-500/40" : "border-app-border! hover:border-app-text/30!"
                  }`}
                >
                  <span className={`grid size-9 shrink-0 place-content-center rounded-lg ${on ? "bg-orange-500/15 text-orange-600" : "bg-app-surface-secondary text-app-text-muted"}`}>
                    <AppIcon className="size-4.5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="min-w-0 text-sm font-semibold leading-snug text-app-text">{app.name}</span>
                      <span className="shrink-0 text-sm font-semibold text-app-text">{rupees(app.price)}</span>
                    </span>
                    {app.description && <span className="mt-0.5 block text-xs leading-snug text-app-text-muted">{app.description}</span>}
                  </span>
                  <span
                    className={`mt-0.5 grid size-5 shrink-0 place-content-center rounded-md border ${on ? "border-orange-500! bg-orange-500 text-white" : "border-app-border!"}`}
                    aria-hidden
                  >
                    {on && <Check className="size-3.5" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-app-border! bg-app-surface p-4">
        <div>
          <p className="text-sm font-semibold text-app-text">Extra team seats</p>
          <p className="text-xs text-app-text-muted">
            {teamIncluded < 0 ? "Your plan has unlimited seats." : `${teamIncluded} included · ${rupees(seatPrice)} per extra member / month`}
          </p>
        </div>
        <div className="flex items-center overflow-hidden rounded-lg border border-app-border!">
          <button type="button" aria-label="One seat less" disabled={seats === 0} onClick={() => onSeats(seats - 1)} className="grid size-9 place-content-center text-app-text hover:bg-app-surface-secondary disabled:opacity-30">
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center text-sm font-semibold text-app-text tabular-nums" aria-live="polite">
            {seats}
          </span>
          <button type="button" aria-label="One more seat" disabled={teamIncluded < 0 || seats >= 200} onClick={() => onSeats(seats + 1)} className="grid size-9 place-content-center text-app-text hover:bg-app-surface-secondary disabled:opacity-30">
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
