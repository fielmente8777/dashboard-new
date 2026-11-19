import { ArrowRight, Phone, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/ui/Icon";
import { useTenant } from "../../hooks/useTenant";
import { useGetLeadsQuery } from "../../redux/api/leadsApi";
import { PAGES, dashboardPath, leadViewPath } from "../../routes/paths";
import { timeAgo } from "../../utils/formateDate";
import { useNewLeadRefresh } from "../Leads/hooks/useNewLeadRefresh";
import {
  getLeadCreatedAt,
  getLeadName,
  getLeadSourceLabel,
} from "../Leads/leadUtils";

const DAY_MS = 24 * 60 * 60 * 1000;
// newest leads asked for; the ones from the last 24 hours are kept
const FETCH_LIMIT = 20;
const SHOWN = 6;

const STAGE_TONES = {
  Open: "blue",
  Contacted: "sky",
  "Follow Up": "amber",
  "Quotation Provided": "purple",
  Potential: "purple",
  Converted: "green",
  "Turn Away": "red",
  "Dead Lead": "red",
  "Out Of Budget": "red",
};

const getPhone = (lead) =>
  lead.Contact && lead.Contact !== "undefined" ? lead.Contact : "";

// Leads that came in during the last 24 hours, newest first. Updates live
// when a new lead arrives. Renders nothing when there are none, so the home
// page only gains the section when there is something new.
const RecentLeads = () => {
  const navigate = useNavigate();
  const tenant = useTenant();
  const { hid } = tenant;
  const leads = useGetLeadsQuery(
    { hid, page: 1, limit: FETCH_LIMIT },
    { skip: !hid, refetchOnMountOrArgChange: true },
  );
  useNewLeadRefresh(tenant, true);

  const recent = useMemo(() => {
    const since = Date.now() - DAY_MS;
    return (leads.currentData?.leads || []).filter((lead) => {
      const time = new Date(getLeadCreatedAt(lead)).getTime();
      return !Number.isNaN(time) && time >= since;
    });
  }, [leads.currentData]);

  if (recent.length === 0) return null;

  const shown = recent.slice(0, SHOWN);
  // every lead fetched is recent, so there may be more than we know of
  const countLabel = recent.length === FETCH_LIMIT ? `${FETCH_LIMIT}+` : recent.length;
  const open = (lead) => navigate(leadViewPath(lead._id, { hid }));

  return (
    <section className="anim-enter overflow-hidden rounded-xl border border-app-border! bg-app-surface">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-app-border! px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Icon icon={Sparkles} />
            <span className="absolute -right-0.5 -top-0.5 size-2.5 animate-pulse rounded-full bg-emerald-500 ring-2 ring-app-surface" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-app-text">Recent leads</h2>
            <p className="text-xs text-app-text-muted">
              {countLabel} new in the last 24 hours
            </p>
          </div>
        </div>
        <Link
          to={dashboardPath(PAGES.LEADS_ALL)}
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          View all <Icon icon={ArrowRight} size="sm" />
        </Link>
      </header>

      {/* phones: one tappable row per lead */}
      <ul className="divide-y divide-app-border md:hidden">
        {shown.map((lead) => (
          <li key={lead._id}>
            <button
              type="button"
              onClick={() => open(lead)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-app-surface-secondary"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium capitalize text-app-text">
                  {getLeadName(lead)}
                </p>
                <p className="truncate text-xs text-app-text-muted">
                  {[getPhone(lead), getLeadSourceLabel(lead)].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[11px] text-app-text-faint">
                  {timeAgo(getLeadCreatedAt(lead))}
                </span>
                {lead.status && (
                  <Badge tone={STAGE_TONES[lead.status] || "gray"}>{lead.status}</Badge>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>

      {/* larger screens: a table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-app-surface-secondary text-xs uppercase tracking-wide text-app-text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Phone</th>
              <th className="px-4 py-2.5 font-medium">Source</th>
              <th className="px-4 py-2.5 font-medium">Stage</th>
              <th className="px-4 py-2.5 text-right font-medium">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {shown.map((lead) => {
              const phone = getPhone(lead);

              return (
                <tr
                  key={lead._id}
                  onClick={() => open(lead)}
                  className="cursor-pointer transition-colors hover:bg-app-surface-secondary"
                >
                  <td className="max-w-56 truncate px-4 py-3 font-medium capitalize text-app-text">
                    {getLeadName(lead)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-app-text-muted">
                    {phone ? (
                      <a
                        href={`tel:${phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 hover:text-blue-500"
                      >
                        <Icon icon={Phone} size="xs" />
                        {phone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 capitalize text-app-text-muted">
                    {getLeadSourceLabel(lead)}
                  </td>
                  <td className="px-4 py-3">
                    {lead.status ? (
                      <Badge tone={STAGE_TONES[lead.status] || "gray"}>{lead.status}</Badge>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-app-text-muted">
                    {timeAgo(getLeadCreatedAt(lead))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {recent.length > SHOWN && (
        <Link
          to={dashboardPath(PAGES.LEADS_ALL)}
          className="block border-t border-app-border! px-4 py-2.5 text-center text-xs font-medium text-blue-600 hover:bg-app-surface-secondary dark:text-blue-400"
        >
          See {recent.length - SHOWN}
          {recent.length === FETCH_LIMIT ? "+" : ""} more from today
        </Link>
      )}
    </section>
  );
};

export default RecentLeads;
