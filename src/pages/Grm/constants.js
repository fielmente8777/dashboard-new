import { Check, Play } from "lucide-react";

// how often the requests list reloads on its own while the page is open
export const REFRESH_INTERVAL_MS = 60_000;

// a pending request older than this is flagged as waiting too long
export const LONG_WAIT_MINUTES = 30;

// `value` is the status text the backend stores; `tone` is the Badge colour,
// `dot` the matching small status dot
export const REQUEST_STATUSES = [
  { value: "Pending", label: "Pending", tone: "amber", dot: "bg-amber-500" },
  { value: "In Progress", label: "In Progress", tone: "blue", dot: "bg-blue-500" },
  { value: "Completed", label: "Completed", tone: "green", dot: "bg-emerald-500" },
  { value: "Cancelled", label: "Cancelled", tone: "red", dot: "bg-red-500" },
];

export const ALL_STATUSES = "all";

export const getStatus = (value) =>
  REQUEST_STATUSES.find((status) => status.value === value) || {
    label: value || "—",
    tone: "gray",
    dot: "bg-gray-400",
  };

// the usual next step for a request, offered as a one-click action
export const NEXT_STEP = {
  Pending: { status: "In Progress", label: "Start", icon: Play },
  "In Progress": { status: "Completed", label: "Complete", icon: Check },
};
