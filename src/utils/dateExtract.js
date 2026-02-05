// utils/dateExtractor.js
export function extractBookingDates(message) {
  const checkInRegex = /check-?in[:\-]?\s*(\d{2}[-/]\d{2}[-/]\d{4})/i;
  const checkOutRegex = /check-?out[:\-]?\s*(\d{2}[-/]\d{2}[-/]\d{4})/i;
  const guestsRegex = /\b(?:guests?|number of guests)[:\-]?\s*(\d+)/i;

  const checkInMatch = message?.match(checkInRegex);
  const checkOutMatch = message?.match(checkOutRegex);
  const guestsMatch = message?.match(guestsRegex);

  return {
    checkIn: checkInMatch ? checkInMatch[1] : null,
    checkOut: checkOutMatch ? checkOutMatch[1] : null,
    guests: guestsMatch ? parseInt(guestsMatch[1], 10) : undefined,
  };
}

// Example usage
