const normalizePhone = (phone = "") => phone.replace(/[^\d]/g, "");
export default normalizePhone;
