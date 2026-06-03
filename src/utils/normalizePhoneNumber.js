export const normalizePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return phoneNumber;

  return phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
};
