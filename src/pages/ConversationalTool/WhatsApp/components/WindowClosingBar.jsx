import { Timer } from "lucide-react";
import { CLOSING_SOON_MS, formatTime, formatTimeLeft, getWindowLeft, LAST_CALL_MS } from "../chatUtils";
import { useNow } from "../hooks/useNow";

// Above the message box while the 24-hour reply window is about to close:
// amber in its last 2 hours, red in its last 30 minutes (when gian also sends
// the team a "closes in 30 min" alert). Counts down in the browser.
const WindowClosingBar = ({ conversation }) => {
  const now = useNow(30_000);
  const left = getWindowLeft(conversation, now);
  if (left === null || left <= 0 || left > CLOSING_SOON_MS) return null;

  const lastCall = left <= LAST_CALL_MS;
  const closesAt = formatTime(new Date(now + left));
  return (
    <div
      role="status"
      className={`flex shrink-0 items-start gap-2 border-t px-4 py-2 text-xs sm:items-center ${
        lastCall
          ? "border-red-500/30! bg-red-500/10 text-red-700 dark:text-red-300"
          : "border-amber-500/30! bg-amber-500/10 text-amber-800 dark:text-amber-300"
      }`}
    >
      <Timer className={`mt-px size-4 shrink-0 sm:mt-0 ${lastCall ? "animate-pulse" : ""}`} />
      <p className="min-w-0">
        <b className="font-semibold">
          {lastCall ? "Last chance: " : ""}this chat closes in {formatTimeLeft(left)}
        </b>{" "}
        (at {closesAt}). Reply now — after that only an approved template can be sent.
      </p>
    </div>
  );
};

export default WindowClosingBar;
