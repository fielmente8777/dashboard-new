import {
  FiTrendingUp,
  FiTrendingDown,
  FiMapPin,
  FiSmartphone,
  FiMonitor,
} from "react-icons/fi";

export default function Ranks() {
  const rankSummary = [
    { label: "Average Rank", value: "#3.2", change: +1.1 },
    { label: "Best Rank", value: "#1", change: 0 },
    { label: "Worst Rank", value: "#12", change: -2 },
    { label: "Tracked Locations", value: "6", change: +1 },
  ];

  const locationRanks = [
    { location: "Downtown", rank: 2, device: "mobile" },
    { location: "City Center", rank: 4, device: "desktop" },
    { location: "Nearby Area", rank: 1, device: "mobile" },
  ];

  return (
    <div className="flex-1 bg-gray-50 p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ranks</h1>
        <p className="text-gray-600 mt-1">Overall local ranking performance</p>
      </div>

      {/* Rank Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {rankSummary.map((item, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl border hover:shadow-md transition"
          >
            <p className="text-sm text-gray-600">{item.label}</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">
              {item.value}
            </h2>

            <div
              className={`flex items-center gap-1 text-sm font-semibold mt-2 ${
                item.change >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {item.change >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
              {Math.abs(item.change)}
            </div>
          </div>
        ))}
      </div>

      {/* Rank Trend */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-bold mb-4">Rank Trend</h3>

        <div className="h-56 flex items-end gap-2">
          {[6, 5, 4, 3, 3, 2, 3].map((rank, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t-lg"
                style={{ height: `${(12 - rank) * 8}%` }}
              />
              <span className="text-xs text-gray-500 mt-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Location Rankings */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-bold mb-4">Rank by Location</h3>

        <div className="space-y-4">
          {locationRanks.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiMapPin className="text-gray-500" />
                <span className="font-medium">{item.location}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-bold text-gray-900">#{item.rank}</span>
                {item.device === "mobile" ? (
                  <FiSmartphone className="text-gray-500" />
                ) : (
                  <FiMonitor className="text-gray-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
