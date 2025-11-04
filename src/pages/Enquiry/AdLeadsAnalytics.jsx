import React, { useState, useEffect, useMemo, useContext } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import DataContext from "../../context/DataContext";
import { FaSourcetree } from "react-icons/fa";
import DashboardCard from "../../components/Card/DashboardCard";

const AdLeadsAnalytics = ({ showTitle = true, rangeDate }) => {
  const { Leads, setLeads } = useContext(DataContext);
  const { leadsList, setLeadsLists } = useContext(DataContext);

  // console.log(leadsList);

  // const [leadsLists, setLeadsLists] = useState([]);
  const [leadFromIg, setLeadFromIg] = useState();
  const [leadFromFb, setLeadFromFb] = useState();
  const [parsedData, setParsedData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [insights, setInsights] = useState({});
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // Parse data on component mount
  useEffect(() => {
    if (Leads && Leads.length > 0) {
      const headers = Leads[0];
      const rows = Leads.slice(1);

      setColumns(headers);

      const processedData = rows.map((row, index) => {
        const obj = { _rowIndex: index };
        headers.forEach((header, i) => {
          obj[header] = row[i] || "";
        });
        return obj;
      });

      setParsedData(processedData);
      generateInsights(processedData, headers);

      // Extract date range
      const dates = processedData
        ?.map((lead) => new Date(lead.created_time))
        .filter((d) => !isNaN(d));
      if (dates.length > 0) {
        dates.sort((a, b) => a - b);
        setDateRange({
          start: dates[0],
          end: dates[dates.length - 1],
        });
      }
    }

    const filteredLeads = Leads.filter((leadRow) => {
      const platform = leadRow[11]; // assuming platform is always at index 11
      return platform === "ig";
    });

    const filteredLeads2 = Leads.filter((leadRow) => {
      const platform = leadRow[11]; // assuming platform is always at index 11
      return platform === "fb";
    });

    setLeadFromIg(filteredLeads.length);
    setLeadFromFb(filteredLeads2.length);
  }, [Leads]);

  useEffect(() => {
    if (rangeDate) {
      if (rangeDate === "all") {
        setLeads(leadsList);
        return;
      }
      let now = new Date();
      let days = 7;
      if (rangeDate === "30d") days = 30;
      else if (rangeDate === "90d") days = 90;

      const cutoff = new Date();
      cutoff.setDate(now.getDate() - days);

      const filtered = leadsList.filter((item) => {
        const createdDate = new Date(item[1]);
        return createdDate >= cutoff;
      });
      setLeads(filtered);
    }
  }, [rangeDate]);

  // console.log(Leads);
  // console.log(leadsList);

  // useEffect(() => {
  //   if (Leads) {
  //     setLeadsLists(Leads);
  //   }
  // }, [Leads]);

  // Generate insights from data
  const generateInsights = (data, headers) => {
    const insights = {
      totalLeads: data.length,
      leadSources: {},
      locations: {},
      guestCounts: {},
      budgetRanges: {},
      campaigns: {},
      qualifiedLeads: 0,
      conversionRate: 0,
      anomalies: [],
    };

    // Calculate lead sources
    data.forEach((lead) => {
      const source = lead.platform || "Unknown";
      insights.leadSources[source] = (insights.leadSources[source] || 0) + 1;

      // Location analysis
      const location = lead.city || "Unknown";
      insights.locations[location] = (insights.locations[location] || 0) + 1;

      // Guest count analysis
      const guestCount =
        lead["how_many_guests_are_you_booking_for?"] || "Unknown";
      insights.guestCounts[guestCount] =
        (insights.guestCounts[guestCount] || 0) + 1;

      // Budget analysis
      const budget = lead["whats_your_budget_per_night?"] || "Unknown";
      insights.budgetRanges[budget] = (insights.budgetRanges[budget] || 0) + 1;

      // Campaign analysis
      const campaign = lead.campaign_name || "Unknown";
      insights.campaigns[campaign] = (insights.campaigns[campaign] || 0) + 1;

      // Qualified leads
      if (lead.is_qualified?.toLowerCase() === "true") {
        insights.qualifiedLeads++;
      }
    });

    // Calculate conversion rate
    insights.conversionRate = (
      (insights.qualifiedLeads / insights.totalLeads) *
      100
    ).toFixed(1);

    // Check for anomalies (duplicate emails/phones)
    const emails = {};
    const phones = {};
    data.forEach((lead) => {
      const email = lead.email;
      const phone = lead.phone_number;

      if (email) {
        emails[email] = (emails[email] || 0) + 1;
      }

      if (phone) {
        phones[phone] = (phones[phone] || 0) + 1;
      }
    });

    // Find duplicates
    const duplicateEmails = Object.entries(emails).filter(
      ([_, count]) => count > 1
    );
    const duplicatePhones = Object.entries(phones).filter(
      ([_, count]) => count > 1
    );

    if (duplicateEmails.length > 0) {
      insights.anomalies.push({
        type: "duplicate_emails",
        count: duplicateEmails.length,
        message: `${duplicateEmails.length} duplicate email addresses found`,
      });
    }

    if (duplicatePhones.length > 0) {
      insights.anomalies.push({
        type: "duplicate_phones",
        count: duplicatePhones.length,
        message: `${duplicatePhones.length} duplicate phone numbers found`,
      });
    }

    setInsights(insights);
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!insights.totalLeads) return {};

    return {
      // Lead sources data
      leadSources: Object.entries(insights.leadSources).map(
        ([name, value]) => ({
          name,
          value,
        })
      ),

      // Locations data (top 10)
      locations: Object.entries(insights.locations)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({
          name,
          value,
        })),

      // Guest counts data
      guestCounts: Object.entries(insights.guestCounts).map(
        ([name, value]) => ({
          name,
          value,
        })
      ),

      // Budget ranges data
      budgetRanges: Object.entries(insights.budgetRanges).map(
        ([name, value]) => ({
          name,
          value,
        })
      ),

      // Campaign performance data
      campaigns: Object.entries(insights.campaigns)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({
          name,
          value,
        })),

      // Time series data (leads per day)
      leadsOverTime: parsedData.reduce((acc, lead) => {
        if (lead.created_time) {
          const date = new Date(lead.created_time).toISOString().split("T")[0];
          acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
      }, {}),
    };
  }, [insights, parsedData]);

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    return parsedData.filter((row) => {
      return Object.entries(filters).every(([column, filterValue]) => {
        if (!filterValue) return true;
        const cellValue = row[column]?.toString().toLowerCase() || "";
        return cellValue.includes(filterValue.toLowerCase());
      });
    });
  }, [parsedData, filters]);

  const handleFilterChange = (column, value) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#00ff00",
    "#0088fe",
    "#ff0088",
  ];

  return (
    <div className="">
      <div className=" mx-auto">
        {/* Header */}
        {showTitle && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl md:text-lg font-semibold text-gray-900">
                  Lead Analytics Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  {dateRange.start && dateRange.end
                    ? `Data from ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}`
                    : "Analyzing lead data"}
                </p>
              </div>
              {/* <div className="flex space-x-3">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Export Report
                            </button>
                        </div> */}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          {/* Total Leads Card */}

          {/* {dateRange.start && (
              <p className="text-xs text-blue-500 mt-2">
                Since {dateRange.start.toLocaleDateString()}
              </p>
            )} */}

          <DashboardCard
            amount={insights.totalLeads || 0}
            label={"Total Meta Leads"}
            progress={"100"}
          />

          <DashboardCard
            amount={leadFromIg || 0}
            label={"Instagram"}
            progress={"30"}
          />

          <DashboardCard
            amount={leadFromFb || 0}
            label={"Facebook"}
            progress={"70"}
          />

          {/* Qualified Leads Card */}
          <div className="bg-white rounded-xl p-5 ">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-primary/90">
                  {insights.qualifiedLeads || 0}
                </p>
                <h3 className="text-lg font-medium text-green-600 mb-1">
                  Qualified
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  insights.qualifiedLeads > 0
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {insights.qualifiedLeads > 0
                  ? "Good progress"
                  : "No qualifications yet"}
              </span>
            </div>
          </div>

          {/* Conversion Rate Card */}

          <DashboardCard
            amount={
              insights.conversionRate === "0.0"
                ? insights.conversionRate.split(".")[0]
                : insights.conversionRate || 0
            }
            label={"Conversion Rate"}
            progress={"0"}
          />

          {/* Top Location Card */}
          <div className="rounded-xl p-5 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-primary/90">
                  {(chartData.locations && chartData.locations[0]?.name) ||
                    "N/A"}
                </p>
                <h3 className="text-lg font-medium text-amber-600 mb-1">
                  Top Location
                </h3>
              </div>
              <div className="p-3 rounded-lg bg-amber-100 text-amber-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
            {chartData.locations && chartData.locations[0]?.value && (
              <p className="text-xs text-amber-600 mt-1">
                {chartData.locations[0].value} leads (
                {Math.round(
                  (chartData.locations[0].value / insights.totalLeads) * 100
                )}
                %)
              </p>
            )}
          </div>
        </div>

        {/* Filters */}
        {/* {columns.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Filters</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {['city', 'platform', 'how_many_guests_are_you_booking_for?', 'whats_your_budget_per_night?'].map(column => (
                                columns?.includes(column) && (
                                    <div key={column}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {column.replace(/_/g, ' ').replace(/\?/g, '')}
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                            placeholder={`Filter by ${column}`}
                                            onChange={(e) => handleFilterChange(column, e.target.value)}
                                        />
                                    </div>
                                )
                            ))}
                        </div>
                        <div className="mt-3 text-sm text-gray-600">
                            Showing <span className="font-semibold">{filteredData.length}</span> of {parsedData.length} leads
                        </div>
                    </div>
                )} */}

        {/* Anomalies Alert */}
        {/* {insights.anomalies && insights.anomalies.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <h3 className="text-md font-semibold text-yellow-800 mb-2">Data Quality Issues</h3>
                        <ul className="list-disc list-inside text-yellow-700">
                            {insights.anomalies?.map((anomaly, index) => (
                                <li key={index}>{anomaly.message}</li>
                            ))}
                        </ul>
                    </div>
                )} */}

        {/* Tabs */}
        {/* <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {["overview", "sources", "geographics", "budget", "timeline"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-md ${
                      activeTab === tab
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                )
              )}
            </nav>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default AdLeadsAnalytics;

{
  /* <div className="p-6">
 
  {activeTab === "overview" && (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
     
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-md font-semibold mb-4">Lead Sources</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.leadSources}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {chartData?.leadSources?.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-md font-semibold mb-4">Top Locations</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.locations} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

   
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-md font-semibold mb-4">Guest Count Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.guestCounts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-md font-semibold mb-4">Budget Preferences</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.budgetRanges}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )}


  // {activeTab === "sources" && (
  //   <div className="grid grid-cols-1 gap-6">
  //     {/* Campaign Performance */
}
//     <div className="bg-white p-4 rounded-lg border border-gray-200">
//       <h3 className="text-md font-semibold mb-4">Campaign Performance</h3>
//       <div className="h-96">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={chartData.campaigns}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="name" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Bar dataKey="value" fill="#8884d8" name="Leads Generated" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   </div>
// )}

// {activeTab === "geographics" && (
//   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

//     <div className="bg-white p-4 rounded-lg border border-gray-200">
//       <h3 className="text-md font-semibold mb-4">Location Distribution</h3>
//       <div className="h-96">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={chartData.locations} layout="vertical">
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis type="number" />
//             <YAxis dataKey="name" type="category" width={120} />
//             <Tooltip />
//             <Bar dataKey="value" fill="#82ca9d" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>

//     <div className="bg-white p-4 rounded-lg border border-gray-200">
//       <h3 className="text-md font-semibold mb-4">Guest Count Analysis</h3>
//       <div className="h-96">
//         <ResponsiveContainer width="100%" height="100%">
//           <PieChart>
//             <Pie
//               data={chartData.guestCounts}
//               cx="50%"
//               cy="50%"
//               outerRadius={100}
//               fill="#8884d8"
//               dataKey="value"
//               label={({ name, percent }) =>
//                 `${name} ${(percent * 100).toFixed(0)}%`
//               }
//             >
//               {chartData?.guestCounts?.map((entry, index) => (
//                 <Cell
//                   key={`cell-${index}`}
//                   fill={COLORS[index % COLORS.length]}
//                 />
//               ))}
//             </Pie>
//             <Tooltip />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   </div>
// )}

// {activeTab === "budget" && (
//   <div className="grid grid-cols-1 gap-6">

//     <div className="bg-white p-4 rounded-lg border border-gray-200">
//       <h3 className="text-md font-semibold mb-4">Budget Preferences</h3>
//       <div className="h-96">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={chartData.budgetRanges}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="name" />
//             <YAxis />
//             <Tooltip />
//             <Bar dataKey="value" fill="#ffc658" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   </div>
// )}

// {activeTab === "timeline" && (
//   <div className="grid grid-cols-1 gap-6">

//     <div className="bg-white p-4 rounded-lg border border-gray-200">
//       <h3 className="text-md font-semibold mb-4">Leads Over Time</h3>
//       <div className="h-96">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart
//             data={Object.entries(chartData.leadsOverTime || {})
//               ?.map(([date, count]) => ({
//                 date,
//                 count,
//               }))
//               .sort((a, b) => new Date(a.date) - new Date(b.date))}
//           >
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="date" />
//             <YAxis />
//             <Tooltip />
//             <Area
//               type="monotone"
//               dataKey="count"
//               stroke="#8884d8"
//               fill="#8884d8"
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   </div>
// )}
// </div>; */}
