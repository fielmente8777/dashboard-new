const StatCard = ({ label, value, icon, accent, sub }) => (
  <div className="relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">
        {label}
      </span>
      <span
        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${accent.iconBg}`}
      >
        {icon}
      </span>
    </div>
    <div className={`text-4xl font-black tracking-tight ${accent.text}`}>
      {value ?? "—"}
    </div>
    {sub && <div className="text-xs text-gray-400">{sub}</div>}
  </div>
);

export default StatCard;
