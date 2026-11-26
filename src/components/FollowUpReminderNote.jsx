import { BellRing } from "lucide-react";
import { stageLabel } from "../data/constant";

// Shown as soon as a follow-up stage is picked: the stage needs a date, and a
// time gets the team an alert. Matches gian's reminders
// (services/fcm/fcm.followup.cron.ts): 10 minutes before and at the time, to
// the person assigned (everyone when no one is); a date alone reminds at 10 am.
//   stage   the follow-up round picked ("Follow Up 2"), if known
const FollowUpReminderNote = ({ stage, className = "" }) => (
  <div
    role="status"
    className={`flex items-start gap-2.5 rounded-lg border border-blue-500/25! bg-blue-500/10 px-3 py-2.5 text-xs text-app-text ${className}`}
  >
    <BellRing className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
    <p className="leading-relaxed">
      <b className="font-semibold">
        Please select a date and time{stage ? ` for ${stageLabel(stage)}` : ""} so you get an alert.
      </b>{" "}
      The person assigned gets a reminder 10 minutes before and at that time. With only a date, it comes at 10 am that day.
    </p>
  </div>
);

export default FollowUpReminderNote;
