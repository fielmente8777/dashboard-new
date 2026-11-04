import { ExternalLink, PhoneOff, Wallet } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useTenant } from "../../hooks/useTenant";
import { useGetBalanceAlertQuery } from "../../redux/api/callsApi";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import Icon from "../ui/Icon";

// The calling-balance pop-up, shown when the dashboard opens.
//
// gian decides who sees what (GET /call/balance-alert):
//   admin  - amount, days left and "Recharge on Exotel"
//   caller - team members with calling access: only that calls will stop and to tell an admin
//   others - nothing
// Levels: "low" (runs out within 2 days at the current spend) and "empty" (used up).
//
// Closing it in any way hides it for the rest of the day in this browser. The key holds the
// level and the date, so it comes back tomorrow, and the same day when "low" becomes "empty".

const RECHECK_MS = 30 * 60 * 1000;

const storageKey = (email, ndid) => `balanceAlert:dismissed:${ndid}:${email}`;

const readDismissed = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const money = (amount, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
};

const runsOutText = (iso) => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
};

const BalanceAlertDialog = () => {
  const { ndid } = useTenant();
  const email = useSelector((state) => state.userProfile.authUser?.emailId);
  const { data: alert } = useGetBalanceAlertQuery(undefined, {
    skip: !ndid || !email,
    pollingInterval: RECHECK_MS,
    refetchOnFocus: true,
  });

  const key = storageKey(email, ndid);
  const [dismissed, setDismissed] = useState(() => readDismissed(key));

  const active = alert && (alert.level === "low" || alert.level === "empty") && alert.alertKey;
  if (!active || dismissed === alert.alertKey || readDismissed(key) === alert.alertKey) return null;

  const close = () => {
    try {
      localStorage.setItem(key, alert.alertKey);
    } catch {
      // storage blocked: it stays closed until the page reloads
    }
    setDismissed(alert.alertKey);
  };

  const empty = alert.level === "empty";
  const isAdmin = alert.audience === "admin";
  const runsOut = runsOutText(alert.runsOutAt);

  return (
    <Dialog
      open
      title={alert.title}
      onClose={close}
      footer={
        isAdmin ? (
          <>
            <Button variant="ghost" onClick={close}>
              Remind me tomorrow
            </Button>
            <a href={alert.rechargeUrl} target="_blank" rel="noopener noreferrer" onClick={close}>
              <Button variant={empty ? "danger" : "primary"} icon={ExternalLink}>
                Recharge on Exotel
              </Button>
            </a>
          </>
        ) : (
          <Button onClick={close}>OK, got it</Button>
        )
      }
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
            empty ? "bg-red-500/12 text-red-600 dark:text-red-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
          }`}
        >
          <Icon icon={empty ? PhoneOff : Wallet} size="lg" />
        </span>
        <div className="min-w-0 space-y-3">
          <p className="text-sm leading-relaxed text-app-text-muted">{alert.message}</p>

          {isAdmin && typeof alert.amount === "number" && (
            <div className="rounded-lg border border-app-border! bg-app-surface-secondary px-3 py-2.5">
              <p className="text-xs text-app-text-muted">Exotel calling balance</p>
              <p className={`text-xl font-semibold tabular-nums ${empty ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}>
                {money(alert.amount, alert.currency)}
              </p>
              {!empty && runsOut && <p className="mt-0.5 text-xs text-app-text-muted">Expected to run out around {runsOut}</p>}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default BalanceAlertDialog;
