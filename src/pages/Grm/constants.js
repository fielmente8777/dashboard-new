// how often the requests list reloads on its own while the page is open
export const REFRESH_INTERVAL_MS = 60_000;

// `value` is the status text the backend stores; `tone` is the Badge colour
export const REQUEST_STATUSES = [
  { value: "Pending", label: "Pending", tone: "amber" },
  { value: "In Progress", label: "In Progress", tone: "blue" },
  { value: "Completed", label: "Completed", tone: "green" },
  { value: "Cancelled", label: "Cancelled", tone: "red" },
];

export const ALL_STATUSES = "all";

export const getStatus = (value) =>
  REQUEST_STATUSES.find((status) => status.value === value) || {
    label: value || "—",
    tone: "gray",
  };
