export const getDateRange = (type) => {
  const today = new Date();

  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  const start = new Date(today);

  switch (type) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;

    case "yesterday":
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      break;

    case "7days":
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      break;

    case "30days":
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      break;

    case "90days":
      start.setDate(start.getDate() - 89);
      start.setHours(0, 0, 0, 0);
      break;

    case "1year":
      start.setFullYear(start.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      break;

    default:
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
  }

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
};
