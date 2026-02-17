export function is24HoursCompletedFnc(date) {
  if (!date) return false;

  const inputDate = date instanceof Date ? date : new Date(date);

  console.log(inputDate);

  if (isNaN(inputDate.getTime())) {
    throw new Error("Invalid date provided");
  }

  const now = Date.now();
  const diffInMs = now - inputDate.getTime();

  const HOURS_24_IN_MS = 24 * 60 * 60 * 1000;

  return diffInMs >= HOURS_24_IN_MS;
}
