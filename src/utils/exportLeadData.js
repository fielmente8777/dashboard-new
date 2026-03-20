export const createExportData = (apiData) => {
  return apiData.map((item) => {
    const message = item?.Message || "";

    const checkInMatch = message.match(/check-in:\s*(\d{2}-\d{2}-\d{4})/i);
    const checkOutMatch = message.match(/check-out:\s*(\d{2}-\d{2}-\d{4})/i);
    const guestsMatch = message.match(/number of guest:\s*([\w\s\d]+)/i);
    return {
      ...item,
      check_in: checkInMatch ? checkInMatch[1] : null,
      check_out: checkOutMatch ? checkOutMatch[1] : null,
      number_of_guest: guestsMatch ? guestsMatch[1].trim() : null,
    };
  });
};
