import { ArrowUpRight, BrainCircuit, PhoneCall, RefreshCw, Search } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { formatCredits, formatMoney } from "../../../components/AiCredits/aiCredits";
import Badge from "../../../components/ui/Badge";
import Icon from "../../../components/ui/Icon";
import IconButton from "../../../components/ui/IconButton";
import { Skeleton } from "../../../components/ui/States";
import { useTenant } from "../../../hooks/useTenant";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { useGetExotelOverviewQuery } from "../../../redux/api/integrationsApi";
import { useGetSeoTokensQuery } from "../../../redux/api/seoApi";
import { useGetWhatsAppBillingQuery } from "../../../redux/api/whatsappBusinessApi";
import { PAGES, dashboardPath, integrationPath } from "../../../routes/paths";

// the AI part of the page, where the AI card jumps to
export const AI_SECTION_ID = "ai-credits";

const LEVEL_BADGES = {
  healthy: { tone: "green", label: "Healthy" },
  low: { tone: "amber", label: "Low" },
  critical: { tone: "red", label: "Critical" },
  empty: { tone: "red", label: "Empty" },
  off: { tone: "gray", label: "Not connected" },
};

const LINK_CLASS =
  "mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400";

// One balance. `query` is the RTK Query result it comes from (loading,
// error, retry); `demo` marks a balance that isn't live yet. The footer is a
// `link` to another page, or `onClick` for a jump within this one.
const CreditCard = ({ icon, iconClass, name, query, value, caption, level, demo, link, onClick, linkLabel }) => {
  const badge = LEVEL_BADGES[level];
  const footer = (
    <>
      {linkLabel}
      <Icon icon={ArrowUpRight} size="sm" />
    </>
  );

  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-app-border! bg-app-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex min-w-0 items-center gap-2 text-sm font-medium text-app-text">
          <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-app-surface-secondary ${iconClass}`}>
            <Icon icon={icon} />
          </span>
          <span className="truncate">{name}</span>
        </p>
        {demo ? (
          <Badge tone="amber">Demo</Badge>
        ) : (
          <Badge tone="sky">
            <span className="mr-1 size-1.5 rounded-full bg-current" aria-hidden="true" />
            Live
          </Badge>
        )}
      </div>

      {query?.isLoading ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      ) : query?.error ? (
        <div className="mt-4 flex items-start justify-between gap-2">
          <p className="text-sm text-red-500">
            {getApiErrorMessage(query.error, `Couldn't load ${name.toLowerCase()} balance.`)}
          </p>
          <IconButton icon={RefreshCw} label="Try again" onClick={query.refetch} />
        </div>
      ) : (
        <>
          <p className="mt-4 text-2xl font-semibold tabular-nums text-app-text">{value}</p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-app-text-muted">
            {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
            {caption}
          </p>
        </>
      )}

      {link ? (
        <Link to={link} className={LINK_CLASS}>
          {footer}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={`${LINK_CLASS} self-start`}>
          {footer}
        </button>
      )}
    </div>
  );
};

// Every credit balance the account has: AI (demo for now) next to the live
// WhatsApp, calling (Exotel) and SEO balances. Each card loads on its own, so
// one failing service never hides the others.
// aiQuery: the AI wallet query of the page; aiLevel: its creditState()
const AllCredits = ({ aiQuery, aiLevel }) => {
  const aiWallet = aiQuery.data?.wallet ?? {};
  const { hid } = useTenant();
  const whatsapp = useGetWhatsAppBillingQuery(hid, { skip: !hid });
  const exotel = useGetExotelOverviewQuery(hid, { skip: !hid });
  const seo = useGetSeoTokensQuery();

  // WhatsApp: { currency, wallet: { balance, lowBalanceThreshold, totalUsed } };
  // gian answers 404 when no WhatsApp account is connected
  const waOff = whatsapp.error?.status === 404;
  const billing = whatsapp.data?.result?.docs;
  const waBalance = billing?.wallet?.balance ?? 0;
  const waLevel = waOff
    ? "off"
    : !billing ? null
      : waBalance <= 0 ? "empty"
        : waBalance <= (billing.wallet?.lowBalanceThreshold ?? 0) ? "low"
          : "healthy";

  // Exotel: { connected, balance: { amount, currency, isLow, isEmpty, daysLeft } | null, balanceError }
  const call = exotel.data;
  const callBalance = call?.balance;
  const callLevel = !call?.connected
    ? "off"
    : callBalance?.isEmpty ? "empty" : callBalance?.isLow ? "low" : callBalance ? "healthy" : null;

  // SEO: { balance }
  const seoBalance = seo.data?.balance ?? 0;

  return (
    <section aria-label="All credits" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <CreditCard
        icon={BrainCircuit}
        iconClass="text-violet-600 dark:text-violet-400"
        name="AI credits"
        demo
        query={aiQuery}
        value={`${formatCredits(aiWallet.availableCredits)} credits`}
        level={aiLevel}
        caption={`${formatCredits(aiWallet.totalConsumed)} used`}
        onClick={() =>
          document.getElementById(AI_SECTION_ID)?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
        linkLabel="See AI usage below"
      />
      <CreditCard
        icon={FaWhatsapp}
        iconClass="text-green-600 dark:text-green-400"
        name="WhatsApp"
        query={waOff ? { ...whatsapp, error: null } : whatsapp}
        value={waOff ? "—" : formatMoney(waBalance, billing?.currency)}
        level={waLevel}
        caption={
          waOff ? "Connect WhatsApp Business to see your balance"
            : billing && `${formatMoney(billing.wallet?.totalUsed, billing.currency)} used`
        }
        link={
          waOff
            ? integrationPath("whatsapp")
            : dashboardPath(PAGES.SETTINGS, { query: { tab: "WhatsApp", section: "credits" } })
        }
        linkLabel={waOff ? "Connect WhatsApp" : "Add WhatsApp credits"}
      />
      <CreditCard
        icon={PhoneCall}
        iconClass="text-emerald-600 dark:text-emerald-400"
        name="Calls (Exotel)"
        query={exotel}
        value={
          !call?.connected ? "—"
            : callBalance ? formatMoney(callBalance.amount, callBalance.currency)
              : "Unavailable"
        }
        level={callLevel}
        caption={
          !call?.connected ? "Connect Exotel to see your calling balance"
            : !callBalance ? call?.balanceError || "Exotel didn't return a balance"
              : callBalance.daysLeft != null ? `About ${callBalance.daysLeft} days left at your current spend`
                : null
        }
        link={integrationPath("exotel")}
        linkLabel={call?.connected ? "Manage Exotel" : "Connect Exotel"}
      />
      <CreditCard
        icon={Search}
        iconClass="text-blue-600 dark:text-blue-400"
        name="SEO credits"
        query={seo}
        value={`${formatCredits(seoBalance)} credits`}
        level={seo.data ? (seoBalance > 0 ? "healthy" : "empty") : null}
        caption="For keyword tracking and rank scans"
        link={dashboardPath(PAGES.SEO)}
        linkLabel="Open SEO"
      />
    </section>
  );
};

export default AllCredits;
