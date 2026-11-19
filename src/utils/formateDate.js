export const formatDateTime = (inputDate) => {
  const date = new Date(inputDate);

  const month = date.toLocaleString("en-US", {
    month: "short",
  });

  const day = date.toLocaleString("en-US", {
    day: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  const time = date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const year = date.getFullYear();

  return `${month} ${day}, ${year} : ${time}`;
};

export const formatDate = (date) => {
  const d = new Date(date);
  const month = d.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  const day = d.toLocaleString("en-US", { day: "2-digit", timeZone: "UTC" });
  const year = d.getFullYear();
  return `${month} ${day} ${year}`;
};
export const formatDateByDay = (date) => {
  const d = new Date(date);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const dayName = days[d.getDay()];
  const dayNumber = d.getDate().toString().padStart(2, "0");

  return `${dayName} ${dayNumber}`;
};
export const formatDateByOnlyDay = (date) => {
  const d = new Date(date);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const dayName = days[d.getDay()];
  const dayNumber = d.getDate().toString().padStart(2, "0");

  return `${dayName} ${dayNumber}`;
};
export const formateDateInTimeIS = (date) => {
  const d = new Date(date);
  const istDate = new Date(
    d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );

  let hours = istDate.getHours();
  const minutes = istDate.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";

  hours = hours % 12 || 12; // Convert to 12-hour format
  const formattedHours = hours.toString().padStart(2, "0");

  return `${formattedHours}:${minutes} ${ampm}`;
};

export const timeAgo = (dateString) => {
  if (!dateString) return "-";

  const now = new Date();
  const past = new Date(dateString);

  if (isNaN(past.getTime())) return "-";

  let diffInSeconds = Math.floor((now - past) / 1000);
  const isFuture = diffInSeconds < 0;
  diffInSeconds = Math.abs(diffInSeconds);

  const units = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const { label, seconds } of units) {
    const count = Math.floor(diffInSeconds / seconds);
    if (count >= 1) {
      const plural = count !== 1 ? `${label}s` : label; // "1 day" vs "2 days"
      return isFuture ? `in ${count} ${plural}` : `${count} ${plural} ago`;
    }
  }

  return "just now";
};
