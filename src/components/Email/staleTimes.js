// How long email numbers stay on screen before a "Refresh" line appears.
// Nothing reloads on its own (polling loaded the server); these only decide
// when to offer the user a Refresh (see hooks/useStaleAfter + ui/RefreshNotice).
export const STALE_WHILE_SENDING_MS = 30_000; // a campaign is going out: counts move fast
export const STALE_IDLE_MS = 5 * 60_000; // sent: opens and clicks still trickle in
export const STALE_SES_CHECK_MS = 60_000; // waiting for Amazon to see the DNS records
