// "Just now", "12 min ago", "3 h ago", "2 d ago", then the date
export const timeAgo = (date, now = Date.now()) => {
  if (!date) return "—";
  const minutes = Math.floor((now - new Date(date).getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d ago`;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

// "Today", "Yesterday", or "Mon, 27 Oct" - for grouping a list by day
export const dayLabel = (date) => {
  const day = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (day.toDateString() === today.toDateString()) return "Today";
  if (day.toDateString() === yesterday.toDateString()) return "Yesterday";
  return day.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(day.getFullYear() !== today.getFullYear() && { year: "numeric" }),
  });
};

// [{ label, items }] in the list's order; `getDate` reads an item's date
export const groupByDay = (items, getDate) => {
  const groups = [];
  items.forEach((item) => {
    const label = dayLabel(getDate(item));
    const last = groups[groups.length - 1];
    if (last?.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  });
  return groups;
};
