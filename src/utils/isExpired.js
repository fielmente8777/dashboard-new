export const isExpired = (endDate) => {
  if (!endDate) return true;

  const now = new Date();
  const expiry = new Date(endDate);

  return expiry < now;
};
