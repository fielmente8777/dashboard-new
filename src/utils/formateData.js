export const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear().toString().slice(); // Get last 2 digits
  const month = (d.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
  const day = d.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatDateByDay = (date) => {
  const d = new Date(date);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const dayName = days[d.getDay()];
  const dayNumber = d.getDate().toString().padStart(2, "0");

  return `${dayName} ${dayNumber}`;
};
