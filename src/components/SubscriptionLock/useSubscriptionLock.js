import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

// Whether the account being viewed may use the dashboard. Read from the profile
// (nexon's getuser, loaded before any page renders, so nothing flashes before the
// lock) and enriched with the plan name from /subscription/my when it has loaded.
//
// Locked when the subscription's end date has passed. Eazotel staff pausing or
// expiring a hotel in the admin console move the end date to "now", and mark it
// with staffStop, so those are locked too.
export function useSubscriptionLock() {
  const details = useSelector((state) => state.userProfile.user?.SubscriptionDetails);
  const loaded = useSelector((state) => state.subscription?.subscription);
  const subscription = loaded && !Array.isArray(loaded) ? loaded : null;

  // re-check every minute, so a page left open locks when the plan runs out
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const endDate = subscription?.endDate ?? details?.endDate ?? null;
  const staffStop = subscription?.staffStop ?? details?.staffStop ?? null;
  // no subscription record at all: never locked, as before
  if (!endDate && !staffStop) return { locked: false };

  const ended = endDate ? new Date(endDate).getTime() <= now : false;
  if (!ended && !staffStop) return { locked: false };

  return {
    locked: true,
    reason: staffStop?.kind === "paused" ? "paused" : "ended",
    endDate,
    planName: subscription?.planId?.planName ?? null,
    apps: subscription?.apps?.length ?? details?.apps?.length ?? 0,
  };
}
