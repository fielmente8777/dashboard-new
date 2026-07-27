export const normalizePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return phoneNumber;

  return phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
};

export const normalizePhoneWithSameFormat = (phone) => {
  if (!phone) return "";

  let num = String(phone).replace(/\D/g, "");

  // Remove leading 0
  if (num.startsWith("0")) {
    num = num.slice(1);
  }

  // Remove India country code
  if (num.startsWith("91") && num.length > 10) {
    num = num.slice(-10);
  }

  return num;
};
