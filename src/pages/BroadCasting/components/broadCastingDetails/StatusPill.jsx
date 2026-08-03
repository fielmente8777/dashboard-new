const STATUS_MAP = {
  read: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "Read",
  },
  delivered: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-500",
    label: "Delivered",
  },
  sent: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
    label: "Sent",
  },
  failed: {
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
    label: "Failed",
  },
};

const StatusPill = ({ status }) => {
  const s = STATUS_MAP[status] ?? STATUS_MAP.sent;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

export default StatusPill;
