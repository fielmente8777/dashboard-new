// Date -> "YYYY-MM-DDTHH:mm" in local time, the value the date picker uses
export const toInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
};
