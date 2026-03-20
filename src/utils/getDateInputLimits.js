export function getDateInputLimits(options) {
  const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'

  let min;
  let max;

  if (options.showPast && !options.showFuture) {
    max = today; // Only allow today or earlier
  } else if (!options.showPast && options.showFuture) {
    min = today; // Only allow today or later
  } else if (!options.showPast && !options.showFuture) {
    // If neither, restrict to today only
    min = max = today;
  }

  return { min, max };
}
