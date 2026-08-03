export const daysLeft = (endDate) => {
  if (!endDate) return 0;

  return Math.max(
    0,
    Math.ceil(
      (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    ),
  );
};
