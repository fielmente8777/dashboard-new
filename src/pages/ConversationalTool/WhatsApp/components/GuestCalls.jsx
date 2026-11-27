import { ExternalLink, PhoneIncoming, PhoneOutgoing, Play, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../../../../components/ui/Badge";
import Icon from "../../../../components/ui/Icon";
import { Skeleton } from "../../../../components/ui/States";
import { useGetCallsQuery } from "../../../../redux/api/callsApi";
import { callViewPath, dashboardPath, PAGES } from "../../../../routes/paths";
import {
  formatCallDuration,
  getCallOutcome,
  getGuestNumber,
  isOutgoing,
} from "../../../Calls/callUtils";
import RecordingPlayer from "../../../Calls/components/RecordingPlayer";
import { samePhone } from "../chatUtils";

const SHOWN = 5;
const lastDigits = (phone) => String(phone || "").replace(/\D/g, "").slice(-10);

const formatWhen = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};

// The guest's calls made or taken through Eazotel (Exotel): who called whom,
// how it went, when, the talk time, and the recording to play right here.
// Shown only to accounts with Exotel connected (the panel decides).
const GuestCalls = ({ hid, phone }) => {
  const digits = lastDigits(phone);
  const [playing, setPlaying] = useState(null);
  const calls = useGetCallsQuery(
    { hid, page: 1, limit: SHOWN * 2, search: digits },
    { skip: !hid || digits.length < 10 },
  );
  // the search also matches call ids and statuses: keep this guest's calls only
  const list = (calls.data?.calls || [])
    .filter((call) => samePhone(call.guest?.number || getGuestNumber(call), phone))
    .slice(0, SHOWN);
  const total = calls.data?.total || 0;

  return (
    <section className="space-y-3 border-b border-app-border! p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-app-text">
          Calls &amp; recordings
          {list.length > 0 && (
            <span className="ml-2 rounded-full bg-app-surface-secondary px-2 py-0.5 text-xs font-medium text-app-text-muted">
              {total > list.length ? `${list.length} of ${total}` : list.length}
            </span>
          )}
        </h3>
        <img src="/exotel.svg" alt="Exotel" title="Calls through Exotel" className="size-5" />
      </div>

      {calls.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : calls.isError ? (
        <p className="text-xs text-red-500">Could not load the calls.</p>
      ) : list.length === 0 ? (
        <p className="rounded-lg border border-dashed border-app-border! px-3 py-4 text-center text-xs text-app-text-muted">
          No calls with this guest yet. Calls you make from the chat show up
          here with their recording.
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((call) => {
            const outcome = getCallOutcome(call);
            const out = isOutgoing(call);
            const open = playing === call.sid;
            return (
              <li
                key={call.sid || call._id}
                className="rounded-lg border border-app-border! bg-app-surface-secondary/40 p-2.5"
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${
                      out
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                    title={out ? "We called the guest" : "The guest called us"}
                  >
                    <Icon icon={out ? PhoneOutgoing : PhoneIncoming} size="sm" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Badge tone={outcome.tone} className="max-w-full truncate">
                      {outcome.label}
                    </Badge>
                    <p className="mt-1 text-xs text-app-text-muted">
                      {formatWhen(call.startTime || call.createdAt)} · Talk{" "}
                      {formatCallDuration(call.duration)}
                    </p>
                    {call.assignedTo && (
                      <p className="truncate text-xs text-app-text-faint">
                        By {call.assignedTo}
                      </p>
                    )}
                  </div>
                  {call.sid && (
                    <Link
                      to={callViewPath(call.sid, { hid })}
                      title="Open the call"
                      className="rounded-md p-1 text-app-text-muted hover:bg-app-surface hover:text-app-text"
                    >
                      <Icon icon={ExternalLink} size="sm" />
                    </Link>
                  )}
                </div>
                {call.recordingUrl && call.sid && (
                  <div className="mt-2">
                    {open ? (
                      <div className="flex items-center gap-1">
                        <div className="min-w-0 flex-1">
                          <RecordingPlayer callSid={call.sid} autoLoad />
                        </div>
                        <button
                          type="button"
                          aria-label="Close the recording"
                          onClick={() => setPlaying(null)}
                          className="rounded-md p-1 text-app-text-muted hover:bg-app-surface"
                        >
                          <Icon icon={X} size="sm" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPlaying(call.sid)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-blue-600/10 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-600/15 dark:text-blue-300"
                      >
                        <Icon icon={Play} size="xs" /> Play recording
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {total > list.length && (
        <Link
          to={dashboardPath(PAGES.CALLS, { hid })}
          className="block text-center text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          See all calls
        </Link>
      )}
    </section>
  );
};

export default GuestCalls;
