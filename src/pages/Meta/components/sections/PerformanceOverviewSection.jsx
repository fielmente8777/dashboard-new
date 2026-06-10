import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const PerformanceOverviewSection = ({ data }) => {
  const chartData = useMemo(() => {
    const dates = data?.reach?.map((item) => item.date) || [];

    return dates.map((date, index) => ({
      date: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      reach: data.reach?.[index]?.value || 0,
      engagements: data.engagements?.[index]?.value || 0,
    }));
  }, [data]);

  return (
    <div className="bg-white dark:bg-black/40 rounded-md border dark:border-gray-500! p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Performance Overview</h3>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" />

          <YAxis yAxisId="left" orientation="left" />

          <YAxis yAxisId="right" orientation="right" />

          <Tooltip />

          <Legend />

          <Line
            yAxisId="left"
            dataKey="reach"
            stroke="#22c55e"
            strokeWidth={2}
          />

          <Line
            yAxisId="right"
            dataKey="engagements"
            stroke="#8b5cf6"
            strokeWidth={2}
          />
        </LineChart>
        {/* <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" />

          <YAxis />

          <Tooltip />

          <Legend />

          <Line
            type="monotone"
            dataKey="reach"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="engagements"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
          />
        </LineChart> */}
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceOverviewSection;
