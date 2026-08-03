import StatCard from "./StatCard";

const StatsGrid = ({ campaign }) => {
  const deliveryRate = campaign
    ? Math.round((campaign.deliveredCount / campaign.totalRecipients) * 100) ||
      0
    : 0;
  const readRate = campaign
    ? Math.round((campaign.readCount / campaign.totalRecipients) * 100) || 0
    : 0;

  const stats = [
    {
      label: "Audience",
      value: campaign?.totalRecipients,
      icon: "👥",
      sub: "Total recipients",
      accent: { text: "text-gray-900", iconBg: "bg-gray-100" },
    },
    {
      label: "Sent",
      value: campaign?.sentCount,
      icon: "📤",
      sub: "Messages dispatched",
      accent: { text: "text-indigo-600", iconBg: "bg-indigo-50" },
    },
    {
      label: "Delivered",
      value: campaign?.deliveredCount,
      icon: "✅",
      sub: `${deliveryRate}% delivery rate`,
      accent: { text: "text-emerald-600", iconBg: "bg-emerald-50" },
    },
    {
      label: "Read",
      value: campaign?.readCount,
      icon: "👁️",
      sub: `${readRate}% read rate`,
      accent: { text: "text-sky-600", iconBg: "bg-sky-50" },
    },
    {
      label: "Failed",
      value: campaign?.failedCount,
      icon: "⚠️",
      sub: "Could not deliver",
      accent: { text: "text-red-500", iconBg: "bg-red-50" },
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
};

export default StatsGrid;
