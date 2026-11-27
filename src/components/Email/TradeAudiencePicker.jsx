import { Building2, Check, Lock, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTradeCategories } from "../../pages/TradeDirectory/useTradeCategories";
import { previewTradeAudience } from "../../redux/api/emailMarketingApi";
import { useGetTradeAccessQuery, useGetTradeFacetsQuery } from "../../redux/api/tradeDirectoryApi";
import { PAGES, dashboardPath } from "../../routes/paths";
import Segmented from "../ui/Segmented";
import { Skeleton } from "../ui/States";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

/**
 * Trade Directory partners as an email audience: which list (Eazotel's, the hotel's own, or both)
 * and one or more categories (travel agents, yoga…). The count is who has an email address and
 * hasn't opted out. The email goes out like any campaign: from gian, with the hotel's own email.
 *
 *   onChange({ pool, segments, count } | null)   null while it can't be sent yet
 */
export default function TradeAudiencePicker({ onChange }) {
  const access = useGetTradeAccessQuery();
  const { categories } = useTradeCategories();
  const approved = access.data?.status === "approved";
  const [pool, setPool] = useState("mine");
  const [segments, setSegments] = useState([]);
  // the categories and their counts (the data is kept by gian-new)
  const facets = useGetTradeFacetsQuery(pool, { skip: access.isLoading || (pool !== "mine" && !approved) });
  const [quote, setQuote] = useState(null);
  const [counting, setCounting] = useState(false);
  const [error, setError] = useState(null);
  const askId = useRef(0);

  // with access, start on Eazotel's list
  useEffect(() => {
    if (approved) setPool("directory");
  }, [approved]);

  // the live count from gian, a moment after the last change (only the latest answer counts)
  useEffect(() => {
    if (access.isLoading || (pool !== "mine" && !approved)) return undefined;
    const id = ++askId.current;
    setCounting(true);
    const timer = setTimeout(async () => {
      try {
        const res = await previewTradeAudience({ pool, segments });
        if (id === askId.current) {
          setQuote(res || null);
          setError(null);
        }
      } catch (e) {
        if (id === askId.current) {
          setQuote(null);
          setError(e?.message || "Could not count the partners.");
        }
      } finally {
        if (id === askId.current) setCounting(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [pool, segments, approved, access.isLoading]);

  useEffect(() => {
    if (counting || !quote?.reachable) onChange(null);
    else onChange({ pool, segments, count: quote.reachable });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote, counting, pool, segments]);

  const counts = new Map((facets.data?.segments || []).map((s) => [s.segment, s.count]));
  const shown = categories.filter((s) => (counts.get(s.value) || 0) > 0);
  const toggle = (value) => setSegments((now) => (now.includes(value) ? now.filter((v) => v !== value) : [...now, value]));

  if (access.isLoading) return <Skeleton className="h-40 rounded-xl" />;

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-app-text">Which list?</h3>
        {approved ? (
          <Segmented
            label="List"
            value={pool}
            onChange={(v) => {
              setPool(v);
              setSegments([]);
            }}
            options={[
              { value: "directory", label: "Eazotel's directory" },
              { value: "mine", label: "My contacts" },
              { value: "both", label: "Both" },
            ]}
          />
        ) : (
          <div className="flex items-start gap-2.5 rounded-xl border border-app-border! p-3 text-xs text-app-text-muted">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              Sending to your own trade contacts. To also reach Eazotel&apos;s directory of travel agents, MICE, wedding
              planners and more, ask for access on the{" "}
              <Link to={dashboardPath(PAGES.TRADE_DIRECTORY)} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                Trade Directory
              </Link>{" "}
              page.
            </span>
          </div>
        )}
      </section>

      <section className="space-y-2">
        <div>
          <h3 className="text-sm font-semibold text-app-text">Which partners?</h3>
          <p className="text-xs text-app-text-muted">Tick one or more categories, or leave all unticked to send to every category.</p>
        </div>
        {facets.isLoading ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : !shown.length ? (
          <div className="rounded-xl border border-dashed border-app-border! px-4 py-5 text-center text-sm text-app-text-muted">
            {pool === "mine" ? "You have no trade contacts yet. Add or import them on the Trade Directory page." : "No partners in this list yet."}
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            <SegmentTick
              checked={!segments.length}
              onChange={() => setSegments([])}
              icon={Users}
              color="#2563eb"
              label="All categories"
              count={facets.data?.total}
            />
            {shown.map((s) => (
              <SegmentTick
                key={s.value}
                checked={segments.includes(s.value)}
                onChange={() => toggle(s.value)}
                icon={s.icon}
                color={s.color}
                label={s.label}
                count={counts.get(s.value)}
              />
            ))}
          </div>
        )}
      </section>

      {error ? (
        <p className="rounded-lg bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">{error}</p>
      ) : (
        quote &&
        !counting && (
          <p className="flex items-start gap-1.5 text-xs text-app-text-muted">
            <Building2 className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>
              <b className="text-app-text">{fmt(quote.reachable)}</b> have an email address and haven&apos;t opted out. It goes
              from your own email, like your other campaigns; each address gets it once.
              {quote.capped ? " One campaign takes at most 10,000." : ""}
            </span>
          </p>
        )
      )}
    </div>
  );
}

function SegmentTick({ checked, onChange, icon: TickIcon, color, label, count }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${
        checked ? "border-blue-500! bg-blue-500/5 ring-1 ring-blue-500/40" : "border-app-border! hover:bg-app-surface-secondary/60"
      }`}
    >
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded border ${checked ? "border-blue-600! bg-blue-600 text-white" : "border-app-border!"}`}
      >
        {checked && <Check className="size-3" />}
      </span>
      <TickIcon className="size-4 shrink-0" style={{ color }} aria-hidden />
      <span className="min-w-0 flex-1 truncate text-sm text-app-text">{label}</span>
      <span className="shrink-0 text-xs tabular-nums text-app-text-muted">{fmt(count)}</span>
    </button>
  );
}
