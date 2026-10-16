// Date ranges as "YYYY-MM-DD" strings in local time, and the quick presets
// of the date range picker.

export const toISODate = (date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

// "2026-04-01" -> Date at local midnight (new Date("2026-04-01") would be UTC)
export const parseISODate = (value) => {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const today = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Monday of the week `date` is in
const startOfWeek = (date) => addDays(date, -((date.getDay() + 6) % 7));

const range = (start, end) => ({ start: toISODate(start), end: toISODate(end) });

export const DATE_PRESETS = [
  { key: "today", label: "Today", get: () => range(today(), today()) },
  { key: "yesterday", label: "Yesterday", get: () => range(addDays(today(), -1), addDays(today(), -1)) },
  { key: "thisWeek", label: "This week (Mon – Today)", get: () => range(startOfWeek(today()), today()) },
  { key: "last7", label: "Last 7 days", get: () => range(addDays(today(), -6), today()) },
  {
    key: "lastWeek",
    label: "Last week (Mon – Sun)",
    get: () => {
      const monday = addDays(startOfWeek(today()), -7);
      return range(monday, addDays(monday, 6));
    },
  },
  { key: "last14", label: "Last 14 days", get: () => range(addDays(today(), -13), today()) },
  {
    key: "thisMonth",
    label: "This month",
    get: () => range(new Date(today().getFullYear(), today().getMonth(), 1), today()),
  },
  { key: "last30", label: "Last 30 days", get: () => range(addDays(today(), -29), today()) },
  {
    key: "lastMonth",
    label: "Last month",
    get: () => {
      const t = today();
      return range(new Date(t.getFullYear(), t.getMonth() - 1, 1), new Date(t.getFullYear(), t.getMonth(), 0));
    },
  },
  { key: "last90", label: "Last 90 days", get: () => range(addDays(today(), -89), today()) },
];

// A preset as a picker value: { start, end, preset, label }
export const presetRange = (key) => {
  const preset = DATE_PRESETS.find((p) => p.key === key);
  return { ...preset.get(), preset: key, label: preset.label };
};

// "1 Apr – 30 Sept 2026", "1 Apr 2025 – 2 Jan 2026", "5 Oct 2026"
export const formatRange = ({ start, end }) => {
  const from = parseISODate(start);
  const to = parseISODate(end);
  const day = { day: "numeric", month: "short" };
  const full = { ...day, year: "numeric" };
  if (start === end) return to.toLocaleDateString("en-IN", full);
  const sameYear = from.getFullYear() === to.getFullYear();
  return `${from.toLocaleDateString("en-IN", sameYear ? day : full)} – ${to.toLocaleDateString("en-IN", full)}`;
};

// "YYYY-MM-DD" pair -> full-day ISO timestamps, for APIs that take instants
export const toTimestampRange = ({ start, end }) => {
  const to = parseISODate(end);
  to.setHours(23, 59, 59, 999);
  return { from: parseISODate(start).toISOString(), to: to.toISOString() };
};
