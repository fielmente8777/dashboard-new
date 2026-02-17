export const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear().toString().slice();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const day = d.getDate().toString().padStart(2, "0");

  return `${day}-${month}-${year}`;
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
