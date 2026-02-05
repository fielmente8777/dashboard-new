import { useState } from "react";
import { FiStar, FiMessageSquare, FiFilter, FiSend } from "react-icons/fi";

export default function Reviews() {
  const [filter, setFilter] = useState("all");

  const reviews = [
    {
      author: "Sarah Johnson",
      rating: 5,
      platform: "Google",
      time: "2 hours ago",
      text: "Amazing coffee and friendly staff! Highly recommend.",
    },
    {
      author: "Mike Chen",
      rating: 4,
      platform: "Google",
      time: "1 day ago",
      text: "Great location and ambiance. Service could be faster.",
    },
    {
      author: "Emily Davis",
      rating: 3,
      platform: "Yelp",
      time: "2 days ago",
      text: "Good coffee, but seating space is limited.",
    },
  ];

  const filteredReviews =
    filter === "all"
      ? reviews
      : reviews.filter((r) => r.rating === Number(filter));

  return (
    <div className="flex-1 bg-gray-50 p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-1">
            Manage and respond to customer reviews
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Average Rating" value="4.6" icon={FiStar} />
        <SummaryCard title="Total Reviews" value="234" icon={FiMessageSquare} />
        <SummaryCard title="New This Week" value="12" icon={FiMessageSquare} />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border flex items-center gap-4">
        <FiFilter className="text-gray-500" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl border divide-y">
        {filteredReviews.map((review, index) => (
          <div key={index} className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-semibold">
                  {review.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>

                <div>
                  <p className="font-semibold text-gray-900">{review.author}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <FiStar
                          key={i}
                          className="w-4 h-4 text-yellow-500 fill-yellow-500"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{review.time}</span>
                  </div>
                </div>
              </div>

              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {review.platform}
              </span>
            </div>

            <p className="text-sm text-gray-700 mb-4">{review.text}</p>

            <button className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline">
              <FiSend />
              Reply
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl p-6 border hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-600">{title}</p>
        <Icon className="text-gray-400" />
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
