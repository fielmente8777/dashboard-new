// Working-hours rules, the same as gian modules/ai-agents/runtime/schedule.ts
// (validateSchedule): shown inline before saving; the server checks again.
// Whether something is open right now comes from the server (hotel time zone):
// GET /ai-agents/:channel/actions/availability.

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0];
export const MAX_RANGES_PER_DAY = 6;
export const MAX_EXCEPTIONS = 60;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const END_TIME = /^(([01]\d|2[0-3]):[0-5]\d|24:00)$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY = 24 * 60;
const WEEK = 7 * DAY;

export const toMinutes = (time) => {
  const [h, m] = String(time).split(":").map(Number);
  return h * 60 + m;
};

export const isValidTimezone = (tz) => {
  if (typeof tz !== "string" || !tz) return false;
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

const isValidDate = (date) => typeof date === "string" && DATE.test(date) && !Number.isNaN(Date.parse(`${date}T00:00:00Z`));

// [start, end) in minutes from the start of the range's own day
const span = (range) => {
  const from = toMinutes(range.from);
  const to = toMinutes(range.to);
  return [from, to > from ? to : to + DAY];
};

export const crossesMidnight = (range) => TIME.test(range.from) && END_TIME.test(range.to) && range.to !== "24:00" && toMinutes(range.to) < toMinutes(range.from);

const findOverlap = (intervals, length) => {
  const pieces = [];
  for (const item of intervals) {
    if (item.end <= length) pieces.push(item);
    else {
      pieces.push({ ...item, end: length });
      pieces.push({ ...item, start: 0, end: item.end - length });
    }
  }
  pieces.sort((a, b) => a.start - b.start);
  for (let i = 1; i < pieces.length; i++) {
    if (pieces[i].start < pieces[i - 1].end && pieces[i].what !== pieces[i - 1].what) {
      return `${pieces[i - 1].what} overlaps ${pieces[i].what}`;
    }
  }
  return null;
};

const rangeErrors = (ranges, where, errors) => {
  if (ranges.length > MAX_RANGES_PER_DAY) errors.push(`${where}: at most ${MAX_RANGES_PER_DAY} time ranges.`);
  for (const range of ranges) {
    if (!TIME.test(range.from) || !END_TIME.test(range.to)) errors.push(`${where}: "${range.from || "?"}-${range.to || "?"}" is not a valid time range.`);
    else if (toMinutes(range.from) === toMinutes(range.to)) errors.push(`${where}: ${range.from}-${range.to} starts and ends at the same time. Use 00:00-24:00 for the whole day.`);
  }
};

const validRanges = (ranges) => ranges.filter((r) => TIME.test(r.from) && END_TIME.test(r.to) && toMinutes(r.from) !== toMinutes(r.to));

// Returns a list of messages (empty = valid). Same wording as the server.
export const validateSchedule = (schedule) => {
  const errors = [];
  if (!isValidTimezone(schedule?.timezone)) errors.push(`"${schedule?.timezone ?? ""}" is not a valid time zone.`);
  const weekly = Array.isArray(schedule?.weekly) ? schedule.weekly : [];
  for (const day of weekly) {
    const ranges = day.ranges || [];
    rangeErrors(ranges, DAY_NAMES[day.day], errors);
    if (day.enabled && !ranges.length) errors.push(`${DAY_NAMES[day.day]} is on but has no hours.`);
  }
  const overlap = findOverlap(
    weekly.filter((d) => d.enabled).flatMap((d) => validRanges(d.ranges || []).map((range) => {
      const [from, to] = span(range);
      return { start: d.day * DAY + from, end: d.day * DAY + to, what: `${DAY_NAMES[d.day]} ${range.from}-${range.to}` };
    })),
    WEEK,
  );
  if (overlap) errors.push(`Working hours overlap: ${overlap}.`);

  const exceptions = Array.isArray(schedule?.exceptions) ? schedule.exceptions : [];
  if (exceptions.length > MAX_EXCEPTIONS) errors.push(`At most ${MAX_EXCEPTIONS} holidays and exceptions.`);
  for (const e of exceptions) {
    const where = e.label || e.from || "Exception";
    const to = e.to || e.from;
    if (!isValidDate(e.from) || !isValidDate(to)) { errors.push(`${where}: choose a valid date.`); continue; }
    if (to < e.from) { errors.push(`${where}: the end date is before the start date.`); continue; }
    if (!e.closed) {
      const ranges = e.ranges || [];
      rangeErrors(ranges, where, errors);
      if (!ranges.length) errors.push(`${where}: add opening hours or mark it closed.`);
      const inner = findOverlap(validRanges(ranges).map((r) => { const [start, end] = span(r); return { start, end, what: `${r.from}-${r.to}` }; }), 2 * DAY);
      if (inner) errors.push(`${where}: hours overlap (${inner}).`);
    }
  }
  const sorted = exceptions.filter((e) => isValidDate(e.from)).map((e) => ({ ...e, to: e.to || e.from })).sort((a, b) => a.from.localeCompare(b.from));
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].from <= sorted[i - 1].to) errors.push(`Exceptions overlap: ${sorted[i - 1].label || sorted[i - 1].from} and ${sorted[i].label || sorted[i].from} share dates.`);
  }
  if (!schedule?.alwaysOpen && !weekly.some((d) => d.enabled) && !exceptions.some((e) => !e.closed)) {
    errors.push("Choose at least one day with hours, or use 24/7.");
  }
  return errors;
};

// --- helpers for the editor ---------------------------------------------

export const emptyWeek = () => [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, enabled: false, ranges: [] }));

export const officeHours = (timezone) => ({
  timezone,
  alwaysOpen: false,
  weekly: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, enabled: day >= 1 && day <= 5, ranges: day >= 1 && day <= 5 ? [{ from: "09:00", to: "18:00" }] : [] })),
  exceptions: [],
});

export const copyDayToAll = (weekly, sourceDay) => {
  const source = weekly.find((d) => d.day === sourceDay);
  return weekly.map((d) => ({ ...d, enabled: source.enabled, ranges: source.ranges.map((r) => ({ ...r })) }));
};

// "Mon-Fri 09:00-13:00, 16:00-22:00 · Sat 10:00-14:00"
export const summarizeWeekly = (schedule) => {
  if (!schedule) return "";
  if (schedule.alwaysOpen) return "24/7";
  const groups = [];
  for (const day of MONDAY_FIRST) {
    const d = schedule.weekly?.find((item) => item.day === day);
    const hours = d?.enabled && d.ranges?.length ? d.ranges.map((r) => (r.from === "00:00" && r.to === "24:00" ? "all day" : `${r.from}-${r.to}`)).join(", ") : null;
    const last = groups[groups.length - 1];
    if (hours && last && last.hours === hours && MONDAY_FIRST.indexOf(last.to) === MONDAY_FIRST.indexOf(day) - 1) last.to = day;
    else if (hours) groups.push({ from: day, to: day, hours });
  }
  if (!groups.length) return "Closed every day";
  const text = groups.map((g) => `${g.from === g.to ? DAY_SHORT[g.from] : `${DAY_SHORT[g.from]}-${DAY_SHORT[g.to]}`} ${g.hours}`).join(" · ");
  const extra = schedule.exceptions?.length ? ` · ${schedule.exceptions.length} exception${schedule.exceptions.length > 1 ? "s" : ""}` : "";
  return text + extra;
};

// "Tue 09:00" style label for an ISO instant in a time zone
export const formatInZone = (iso, timezone) => {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-GB", { timeZone: timezone, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleString();
  }
};

export const allTimezones = () => {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return ["Asia/Kolkata", "Asia/Dubai", "Asia/Singapore", "Europe/London", "America/New_York", "UTC"];
  }
};
