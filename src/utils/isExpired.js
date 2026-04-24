export const isExpired = (endDate) => {
  if (!endDate) return true;

  const now = new Date().getTime();
  const expiry = new Date(endDate).getTime();

  console.log("now", now);
  console.log("expiry", expiry);

  return expiry <= now;
};