import { MailOpen, MousePointerClick, RefreshCw, Send, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatNumber, percent } from "../../pages/EmailMarketing/emailUtils.js";
import useStaleAfter from "../../hooks/useStaleAfter";
import { getEmailCampaigns } from "../../redux/api/emailMarketingApi";
import IconButton from "../ui/IconButton";
import RefreshNotice from "../ui/RefreshNotice";
import StatCard from "../ui/StatCard";
import { ErrorState, Skeleton } from "../ui/States";
import CampaignsList from "./CampaignsList";
import { STALE_IDLE_MS, STALE_WHILE_SENDING_MS } from "./staleTimes";

// campaigns are loaded in one go so the totals and filters cover all of them
const CAMPAIGN_LIMIT = 500;
const IN_PROGRESS = new Set(["sending", "stopping", "scheduled"]);

// Emails sent so far: four headline numbers and the list, where a row opens
// who got it and who opened / clicked. Used by Email marketing (every email)
// and Newsletter (only newsletters, via `filter`).
//
//   filter(campaign) -> boolean   which campaigns belong here (default: all)
//   reloadSignal                   change it to reload (e.g. right after sending)
//   openId / onOpenChange          the campaign whose details are open
//   onCount(n)                     how many there are, for a tab badge
//   empty                          shown when there are none yet
export default function SentEmailsPanel({
  filter,
  reloadSignal = 0,
  openId = null,
  onOpenChange,
  onCount,
  empty = null,
  label = "Emails sent",
  // false where the page shows its own numbers (Email marketing → Performance)
  showStats = true,
}) {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true);
    try {
      const res = await getEmailCampaigns({ page: 1, limit: CAMPAIGN_LIMIT });
      if (!res) throw new Error();
      setAll(res.doc || []);
      setFailed(false);
    } catch {
      if (!quiet) setFailed(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load({ quiet: reloadSignal > 0 });
  }, [load, reloadSignal]);

  const campaigns = useMemo(() => (filter ? all.filter(filter) : all), [all, filter]);

  useEffect(() => {
    onCount?.(campaigns.length);
  }, [campaigns.length, onCount]);

  // no auto-refresh (it loaded the server): after a while a line offers Refresh,
  // sooner while something is still being sent
  const live = campaigns.some((c) => IN_PROGRESS.has(c.status));
  const { stale, loadedAt, markFresh } = useStaleAfter(live ? STALE_WHILE_SENDING_MS : STALE_IDLE_MS, {
    enabled: !loading && !failed,
  });
  // a successful load replaces `all`: the numbers are fresh again
  useEffect(() => {
    markFresh();
  }, [all, markFresh]);

  const totals = useMemo(
    () =>
      campaigns.reduce(
        (sum, c) => ({
          sent: sum.sent + (c.stats?.sent || 0),
          opened: sum.opened + (c.stats?.opened || 0),
          clicked: sum.clicked + (c.stats?.clicked || 0),
        }),
        { sent: 0, opened: 0, clicked: 0 },
      ),
    [campaigns],
  );

  if (failed) return <ErrorState message="Could not load the emails you sent." onRetry={() => load()} />;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!campaigns.length) return empty;

  // an open email fills the panel, like Gmail: the numbers step aside
  return (
    <div className="space-y-4">
      {!openId && showStats && (
        <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label={label}
          icon={Send}
          value={formatNumber(campaigns.length)}
          caption={live ? "Sending now…" : undefined}
        />
        <StatCard label="People reached" icon={Users} value={formatNumber(totals.sent)} />
        <StatCard
          label="Opened"
          icon={MailOpen}
          value={`${percent(totals.opened, totals.sent)}%`}
          caption={`${formatNumber(totals.opened)} people`}
        />
        <StatCard
          label="Clicked"
          icon={MousePointerClick}
          value={`${percent(totals.clicked, totals.sent)}%`}
          caption={`${formatNumber(totals.clicked)} people`}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-app-text-muted">
          {live ? "Sending now — press Refresh to see the latest numbers." : "Open one to see who opened and clicked."}
        </p>
        <IconButton
          icon={RefreshCw}
          label="Refresh"
          onClick={() => load({ quiet: true })}
          className={refreshing ? "animate-spin" : ""}
        />
      </div>
        </>
      )}

      {!openId && (
        <RefreshNotice
          show={stale}
          loadedAt={loadedAt}
          refreshing={refreshing}
          onRefresh={() => load({ quiet: true })}
        >
          {live ? "An email is still being sent." : "New opens and clicks may have come in."}
        </RefreshNotice>
      )}

      <CampaignsList
        onChanged={() => load({ quiet: true })}
        campaigns={campaigns}
        loading={false}
        selectedId={openId}
        onSelect={(id) => onOpenChange?.(id)}
      />
    </div>
  );
}
