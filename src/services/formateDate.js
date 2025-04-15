export const formatDateTime = (isoString) => {
    const date = new Date(isoString);

    const month = date.toLocaleString('en-US', { month: 'short' }); // e.g., "Dec"
    const day = date.getDate().toString().padStart(2, '0'); // e.g., "05"

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // convert to 12-hour format
    const hoursStr = hours.toString().padStart(2, '0'); // e.g., "02"

    return `${month} ${day} - ${hoursStr}:${minutes} ${period}`;
};