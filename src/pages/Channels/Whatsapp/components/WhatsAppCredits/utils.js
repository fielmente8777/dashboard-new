export const formatMoney = (amount = 0, currency = "INR", maxFraction = 2) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: maxFraction,
  }).format(Number(amount) || 0);

export const formatCount = (n = 0) =>
  new Intl.NumberFormat("en-IN").format(Number(n) || 0);

export const percent = (part = 0, total = 0) =>
  total > 0 ? Math.min(100, Math.round((part / total) * 100)) : 0;

export const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
