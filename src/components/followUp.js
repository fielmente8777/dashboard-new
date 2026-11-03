// A follow-up's date (required) and time (optional), as { date, time } -
// see FollowUpFields.

// When a follow-up has a date but no time, the reminder goes out at this time.
export const DEFAULT_FOLLOW_UP_TIME = "10:00";

const pad = (number) => String(number).padStart(2, "0");
export const todayValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// "2026-11-05T14:30" -> { date: "2026-11-05", time: "14:30" }
export const splitFollowUp = (value) =>
  value
    ? { date: value.slice(0, 10), time: value.slice(11, 16) }
    : { date: "", time: "" };

// The time to use when none was picked: 10:00, or for today once 10:00 has
// gone, the next quarter hour.
const fallbackTime = (date) => {
  if (date !== todayValue()) return DEFAULT_FOLLOW_UP_TIME;
  const now = new Date();
  const [hours, minutes] = DEFAULT_FOLLOW_UP_TIME.split(":").map(Number);
  if (now.getHours() * 60 + now.getMinutes() < hours * 60 + minutes) {
    return DEFAULT_FOLLOW_UP_TIME;
  }
  const next = Math.ceil((now.getHours() * 60 + now.getMinutes() + 1) / 15) * 15;
  return next >= 24 * 60 ? "23:59" : `${pad(Math.floor(next / 60))}:${pad(next % 60)}`;
};

// { date, time } -> "2026-11-05T14:30", or "" while there is no date.
// The date is required, the time is optional.
export const toFollowUpValue = ({ date, time }) =>
  date ? `${date}T${time || fallbackTime(date)}` : "";

// Why the follow-up can't be saved yet, or "" when it can.
export const getFollowUpError = ({ date, time }) => {
  if (!date) return "Pick a follow-up date.";
  if (date < todayValue()) return "That date has already passed.";
  if (time && new Date(`${date}T${time}`) <= new Date()) {
    return "That time has already passed. Pick a later one.";
  }
  return "";
};
