import React, { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";
import { getAnalyticsService } from "../../services/api/analytics.api";
import DashboardCard from "../../components/Card/DashboardCard";

import AnalyticsCard from "../../components/Card/AnalyticsCard";
import TemperatureCard from "../../components/Card/TemperatureCard";
const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f97316",
  "#eab308",
  "#a855f7",
  "#ef4444",
  "#14b8a6",
];

const Dashboard = () => {
  const [data, setData] = useState(null);

  const getAnalytics = async () => {
    try {
      const response = await getAnalyticsService();
      setData(response?.result?.docs);
    } catch (error) {
      console.log("Error fetching analytics:", error);
    }
  };

  useEffect(() => {
    getAnalytics();
  }, []);

  // -----------------------
  // Derived Values
  // -----------------------

  const total = data?.totalLeads?.[0]?.count || 0;
  const converted = data?.convertedLeads?.[0]?.count || 0;
  const whatsapp = data?.totalWhatsappConversations || 0;

  const conversionRate = total
    ? ((converted / total) * 100).toFixed(1)
    : 0;

  const cleanedSource = useMemo(() => {
    return (
      data?.sourceBreakdown
        ?.map((item) => ({
          name: item._id,
          count: item.count,
        }))
        .sort((a, b) => b.count - a.count) || []
    );
  }, [data]);

  const cleanedStatus = useMemo(() => {
    return (
      data?.statusBreakdown
        ?.filter((item) => item._id && item._id !== "")
        .map((item) => ({
          name: item._id,
          count: item.count,
        })) || []
    );
  }, [data]);

  const getStatusCount = (status) =>
    cleanedStatus.find((s) => s.name === status)?.count || 0;

  if (!data) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      
      {/* KPI CARDS */}
      <div className="grid grid-cols-4 gap-6">
        {/* <Card title="Total Leads" value={total} />
        <Card title="Converted Leads" value={converted} />
        <Card title="Conversion Rate" value={`${conversionRate}%`} />
        <Card title="WhatsApp Conversations" value={whatsapp} /> */}
              <DashboardCard
                amount={total}
                label={"Total Leads"}
                // progress={item.progress}
                // key={index}
              />
              <DashboardCard
                amount={converted}
                label={"Converted Leads"}
                // progress={item.progress}
                // key={index}
              />
              <DashboardCard
                amount={conversionRate}
                label={"Conversion Rate"}
                progress={conversionRate}
                // key={index}
              />
              <DashboardCard
                amount={whatsapp}
                label={"WhatsApp Conversations"}
                // progress={"20"}
                // key={index}
              />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Attractive Source Distribution */}
        <div className="bg-white rounded p-5">
          <h2 className="text-lg font-semibold mb-4">
            Source Distribution
          </h2>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={cleanedSource}
              layout="vertical"
              // margin={{ left: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
              />
              <Tooltip />
              <Bar
                dataKey="count"
                radius={[0, 8, 8, 0]}
              >
                {cleanedSource.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
                <LabelList dataKey="count" position="right" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded p-5">
          <h2 className="text-lg font-semibold mb-4">
            Stages Breakdown
          </h2>

          <ResponsiveContainer width="100%" >
            <BarChart data={cleanedStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                <LabelList dataKey="count" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
         <div className="lg:col-span-3">
               <AnalyticsCard />
             </div>
             <div className="md:hidden lg:block lg:col-span-2">
               <TemperatureCard />
            </div>
           </div>
      {/* FUNNEL */}
      <div className="bg-white rounded- p-5">
        <h2 className="text-lg font-semibold mb-4">
          Lead Funnel
        </h2>

        <FunnelBar
          label="Open"
          value={getStatusCount("open")}
          total={total}
        />
        <FunnelBar
          label="Hot"
          value={getStatusCount("hot")}
          total={total}
        />
        <FunnelBar
          label="Converted"
          value={converted}
          total={total}
        />
      </div>
    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="bg-white rounded  p-5">
    <p className="text-gray-500 text-sm">{title}</p>
    <h3 className="text-3xl font-bold mt-2">{value}</h3>
  </div>
);

const FunnelBar = ({ label, value, total }) => {
  const percentage = total ? (value / total) * 100 : 0;

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="font-medium">{label}</span>
        <span>{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-green-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Dashboard;

// import DashboardCard from "../../components/Card/DashboardCard";
// import AnalyticsCard from "../../components/Card/AnalyticsCard";
// import TemperatureCard from "../../components/Card/TemperatureCard";
// import MiniLineChartCard from "../../components/Card/MiniLineChartCard";
// import {useEffect, useState } from "react";
// import Review from "../../components/Card/Review";
// import Services from "../../components/Card/Services";
// import AdLeadsAnalytics from "../Enquiry/AdLeadsAnalytics";
// import { getAnalyticsService } from "../../services/api/analytics.api";

// const Dashboard = () => {
//   const [loading, setLoading] = useState(true);

//   const [dateRange, setDateRange] = useState(""); // default 7 days

//   const handleDateSelect = (e) => {
//     const { value } = e.target;
//     setDateRange(value);
//   };
//   const getAnalytics=async()=>{
//     try{
//       const response=await getAnalyticsService();
//       console.log(response);
//     }catch(error){
//       console.log("Error",error);
//     }
//   }

//   useEffect(()=>{
//     getAnalytics()
//   },[])
//   return (
//     <>
//       {!loading ? (
//         <div className="flex flex-col gap-5 hide-scrollbar md:px-4">

//           <div className="flex items-center justify-end p-2">
//             <select
//               value={dateRange}
//               onChange={handleDateSelect}
//               className="border border-gray-400 shadow-md rounded-md px-3 py-2 text-sm outline-none cursor-pointer"
//             >
//               <option value="" disabled>
//                 Select Date
//               </option>
//               <option value="7d">Last 7 Days</option>
//               <option value="30d">Last 30 Days</option>
//               <option value="90d">Last 90 Days</option>
//               <option value="all">All Time</option>
//             </select>
//           </div>

//           <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 xxl:grid-cols-6 gap-4 md:gap-6 mt-4">
//             {data?.map((item, index) => (
//               <DashboardCard
//                 amount={item.amount}
//                 label={item.lable}
//                 progress={item.progress}
//                 key={index}
//               />
//             ))}
//           </div>

//           <div>
//             <AdLeadsAnalytics showTitle={false} rangeDate={dateRange} />
//           </div>
//           <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 border">
//             <div className="lg:col-span-3">
//               <AnalyticsCard />
//             </div>
//             <div className="md:hidden lg:block lg:col-span-2">
//               <TemperatureCard />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 pb-10">
//             <Review />
//             <div className="hidden md:block lg:hidden">
//               <TemperatureCard />
//             </div>
//             <Services />

//             <div className="lg:col-span-2">
//               <MiniLineChartCard
//                 title="Other"
//                 value="0.00"
//                 changePercent={0.0}
//                 isPositive={false}
//                 currentData={[20, 15, 30, 35, 25, 50]}
//                 lastWeekData={[25, 30, 22, 40, 33, 38]}
//               />
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="flex flex-col gap-5 hide-scrollbar px-4">

//           <div className="grid grid-cols-1 md:gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 xxl:grid-cols-6 mt-4">
//             {[1, 2, 3, 4].map((_, index) => (
//               <div
//                 key={index}
//                 className="h-[156px] p-4 rounded-xl overflow-hidden bg-zinc-200 animate-pulse flex flex-col justify-between"
//               ></div>
//             ))}
//           </div>

//           <div className="grid grid-cols-5 gap-5">
//             <div className="col-span-3">
//               <div className="h-[335px] rounded-xl bg-zinc-200 animate-pulse w-full"></div>
//             </div>
//             <div className="col-span-2">
//               <div className="h-[335px] rounded-xl bg-zinc-200 animate-pulse w-full"></div>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 pb-10">
//             <div className="lg:col-span-2 bg-zinc-200 animate-pulse p-4 rounded-xl h-[300px]" />

//             <div className="lg:col-span-1 bg-zinc-200 animate-pulse p-4 rounded-xl h-[300px]" />

//             <div className="col-span-2 bg-zinc-200 animate-pulse rounded-xl h-[300px]" />
//           </div>
//         </div>
//       )}

//     </>
//   );
// };

// export default Dashboard;
