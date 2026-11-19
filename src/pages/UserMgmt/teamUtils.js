import { isGranted } from "./userAccess";

// "Ravi Kumar" -> "RK"; falls back to the email
export const initials = (user) => {
  const name = (user?.displayName || user?.emailId || "?").trim();
  const parts = name.split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2);
  return letters.toUpperCase();
};

export const formatAddedDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const userLocations = (user) =>
  Array.isArray(user?.assigned_location) ? user.assigned_location : [];

export const worksAt = (user, hid) =>
  userLocations(user).some((location) => String(location?.hid) === String(hid));

// how many areas the user may use at one location
export const accessCount = (user, hid) => {
  const location = userLocations(user).find(
    (item) => String(item?.hid) === String(hid),
  );
  return Object.values(location?.accessScope || {}).filter(isGranted).length;
};

export const matchesSearch = (user, search) => {
  const term = search.trim().toLowerCase();
  if (!term) return true;
  return [user?.displayName, user?.emailId, user?.phone].some((value) =>
    String(value || "").toLowerCase().includes(term),
  );
};
