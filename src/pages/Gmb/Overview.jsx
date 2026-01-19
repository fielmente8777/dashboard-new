import { useEffect } from "react";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiStar,
  FiMessageSquare,
  FiPhone,
  FiNavigation,
  FiMousePointer,
  FiCalendar,
  FiAlertCircle,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";

export function Overview() {
  const metrics = [
    {
      title: "Local Visibility Score",
      value: "87",
      change: "+12%",
      trend: "up",
      icon: FiTrendingUp,
      color: "blue",
    },
    {
      title: "Average Google Rating",
      value: "4.8",
      change: "+0.2",
      trend: "up",
      icon: FiStar,
      color: "yellow",
    },
    {
      title: "Total Reviews",
      value: "234",
      change: "+18",
      trend: "up",
      icon: FiMessageSquare,
      color: "green",
    },
    {
      title: "Ranking Change",
      value: "#3",
      change: "↑2",
      trend: "up",
      icon: FiTrendingUp,
      color: "purple",
    },
  ];

  const recentReviews = [
    {
      author: "Sarah Johnson",
      rating: 5,
      text: "Amazing coffee and friendly staff! The atmosphere is perfect for work.",
      time: "2 hours ago",
      platform: "Google",
    },
    {
      author: "Mike Chen",
      rating: 4,
      text: "Great location and good service. Would love more vegan options.",
      time: "5 hours ago",
      platform: "Google",
    },
    {
      author: "Emily Davis",
      rating: 5,
      text: "Best local coffee shop! The pastries are incredible.",
      time: "1 day ago",
      platform: "Yelp",
    },
  ];

  const smartTasksSummary = [
    { task: "Respond to 3 new reviews", status: "pending", priority: "high" },
    {
      task: "Update business hours",
      status: "in-progress",
      priority: "medium",
    },
    { task: "Add new photos", status: "pending", priority: "medium" },
    {
      task: "Optimize business description",
      status: "completed",
      priority: "low",
    },
  ];

  const alerts = [
    {
      type: "warning",
      message: "Your business listing on Yelp needs verification",
      action: "Verify Now",
    },
    {
      type: "info",
      message: "Competitor ranking improved for 'coffee shop downtown'",
      action: "View Details",
    },
  ];

  const getData = async () => {
    const response = await fetch(
      "http://localhost:8000/api/v1/google-ads/sync",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    const data = await response.json();
    console.log(data);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
            <p className="text-gray-600 mt-1">
              Track your local business performance
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 border rounded-lg">
              <FiCalendar className="text-gray-500" />
              <select className="bg-transparent text-sm outline-none">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>

            <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg transition">
              <HiSparkles />
              Start Smart Tasks
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border hover:shadow-lg transition"
              >
                <div className="flex justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center
                      ${
                        metric.color === "blue"
                          ? "bg-blue-100 text-blue-600"
                          : metric.color === "yellow"
                            ? "bg-yellow-100 text-yellow-600"
                            : metric.color === "green"
                              ? "bg-green-100 text-green-600"
                              : "bg-purple-100 text-purple-600"
                      }`}
                  >
                    <Icon size={22} />
                  </div>

                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
                      ${
                        metric.trend === "up"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                  >
                    {metric.trend === "up" ? (
                      <FiTrendingUp />
                    ) : (
                      <FiTrendingDown />
                    )}
                    {metric.change}
                  </div>
                </div>

                <p className="text-sm text-gray-600">{metric.title}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {metric.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-xl p-6 border">
            <h3 className="text-lg font-bold mb-4">
              Local Search Visibility Trend
            </h3>

            <div className="h-64 flex items-end gap-2">
              {[65, 72, 68, 75, 82, 78, 87].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-teal-500 rounded-t-lg"
                    style={{ height: `${v}%` }}
                  />
                  <span className="text-xs text-gray-500 mt-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border">
            <h3 className="text-lg font-bold mb-4">User Actions</h3>

            {[
              { label: "Calls", value: 124, icon: FiPhone },
              { label: "Clicks", value: 892, icon: FiMousePointer },
              { label: "Directions", value: 341, icon: FiNavigation },
            ].map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="flex items-center gap-2 text-sm">
                      <Icon /> {a.label}
                    </span>
                    <span className="font-bold">{a.value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(a.value / 1000) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-lg font-bold mb-4">Alerts</h3>

          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg mb-3 ${
                alert.type === "warning"
                  ? "bg-yellow-50 border border-yellow-200"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <div className="flex gap-2 mb-2">
                <FiAlertCircle />
                <p className="text-sm">{alert.message}</p>
              </div>
              <button className="text-xs font-semibold text-blue-700">
                {alert.action} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Overview;
