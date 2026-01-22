import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function DailyInsightsChart({ data }) {
  if (!data || data.length === 0) return null;

  const formattedData = data.map((item) => ({
    date: item.date.slice(5), // MM-DD for readability
    cost: item.cost,
    clicks: item.clicks,
    impressions: item.impressions,
    conversions: item.conversions,
  }));

  return (
    <div
      style={{
        width: "100%",
        height: 420,
        background: "#fff",
        borderRadius: 12,
        padding: "16px 8px",
      }}
    >
      <ResponsiveContainer>
        <LineChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />

          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#888" />

          <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#888" />

          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            stroke="#888"
          />

          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "none",
              boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            }}
          />

          <Legend verticalAlign="top" height={36} />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="cost"
            strokeWidth={3}
            dot={false}
          />

          <Line
            yAxisId="right"
            type="monotone"
            dataKey="clicks"
            strokeWidth={2}
            dot={false}
          />

          <Line
            yAxisId="right"
            type="monotone"
            dataKey="impressions"
            strokeWidth={2}
            dot={false}
          />

          <Line
            yAxisId="right"
            type="monotone"
            dataKey="conversions"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";

// export default function DailyInsightsBarChart({ data }) {
//   if (!data || data.length === 0) return null;

//   const formattedData = data.map((item) => ({
//     date: item.date.slice(5), // MM-DD
//     cost: item.cost,
//     clicks: item.clicks,
//     impressions: item.impressions,
//     conversions: item.conversions,
//   }));

//   console.log(formattedData);

//   return (
//     <div
//       style={{
//         width: "100%",
//         height: 420,
//         background: "#ffffff",
//         borderRadius: 14,
//         padding: "16px 8px",
//       }}
//     >
//       <ResponsiveContainer>
//         <BarChart
//           data={formattedData}
//           margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
//           barCategoryGap="20%"
//         >
//           <CartesianGrid strokeDasharray="3 3" stroke="#eee" />

//           <XAxis dataKey="date" tick={{ fontSize: 12 }} />

//           <YAxis yAxisId="left" stroke="#888" tick={{ fontSize: 12 }} />

//           <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />

//           <Tooltip
//             cursor={{ fill: "rgba(0,0,0,0.04)" }}
//             contentStyle={{
//               borderRadius: 10,
//               border: "none",
//               boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
//             }}
//           />

//           <Legend verticalAlign="top" height={36} />

//           {/* Cost */}
//           <Bar
//             yAxisId="left"
//             dataKey="cost"
//             radius={[8, 8, 0, 0]}
//             maxBarSize={28}
//           />

//           {/* Clicks */}
//           <Bar
//             yAxisId="right"
//             dataKey="clicks"
//             radius={[8, 8, 0, 0]}
//             maxBarSize={28}
//           />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }
