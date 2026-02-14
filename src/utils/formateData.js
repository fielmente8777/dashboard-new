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
export const formatDateByOnlyDay = (date) => {
  const d = new Date(date);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const dayName = days[d.getDay()];
  const dayNumber = d.getDate().toString().padStart(2, "0");

  return `${dayName} ${dayNumber}`;
};



export const formateDateInTimeIS = (date) => {
  const d = new Date(date);
  const istDate = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  
  let hours = istDate.getHours();
  const minutes = istDate.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? 'pm' : 'am';
  
  hours = hours % 12 || 12; // Convert to 12-hour format
  const formattedHours = hours.toString().padStart(2, "0");
  
  return `${formattedHours}:${minutes} ${ampm}`;
}
