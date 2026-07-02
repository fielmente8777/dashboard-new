const LEGEND = [
  { label: "Read", color: "bg-sky-400" },
  { label: "Delivered", color: "bg-emerald-400" },
  { label: "Failed", color: "bg-red-400" },
  { label: "Pending", color: "bg-gray-200" },
];

const DeliveryFunnel = ({ campaign }) => {
  if (!campaign) return null;

  const { totalRecipients, deliveredCount, readCount, failedCount } = campaign;

  const pct = (n) => Math.round((n / totalRecipients) * 100) || 0;

  const readPct = pct(readCount);
  const deliveredPct = pct(deliveredCount) - readPct;
  const failedPct = pct(failedCount);

  const segments = [
    { pct: readPct, color: "bg-sky-400" },
    { pct: deliveredPct, color: "bg-emerald-400" },
    { pct: failedPct, color: "bg-red-400" },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700">
          Delivery Funnel
        </span>
        <span className="text-xs text-gray-400">{totalRecipients} total</span>
      </div>

      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={`${seg.color} transition-all`}
            style={{ width: `${seg.pct}%` }}
          />
        ))}
        <div className="bg-gray-100 flex-1" />
      </div>

      <div className="flex gap-5 mt-3">
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
            <span className="text-xs text-gray-500">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryFunnel;
