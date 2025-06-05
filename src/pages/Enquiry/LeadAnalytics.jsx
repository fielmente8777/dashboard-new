import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getAllClientEnquires } from "../../services/api/clientEnquire.api";
import handleLocalStorage from "../../utils/handleLocalStorage";

const LeadAnalytics = () => {
  const [filteredLeads, setFilteredLeads] = useState();
  const [activeFilter, setActiveFilter] = useState("All Enquires");

  const [enquires, setEnquires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const fetchEnquires = async (token) => {
    setLoading(true);
    const hid = handleLocalStorage("hid");
    try {
      const response = await getAllClientEnquires({
        token,
        hid,
      });
      setEnquires(response);
    } catch (error) {
      console.error("Error fetching enquires:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquires(localStorage.getItem("token"));
  }, []);

  // const filterLeads = (status) => {
  //     console.log(status)
  //     const response = status === "All Enquiries" ? enquires : enquires.filter(enquiry => enquiry.status === status)
  //     console.log(response)
  //     setFilteredLeads(response)
  //     setActiveFilter(status);
  // };

  const getLeadsByDateRange = (days) => {
    const today = new Date();
    return enquires?.filter((lead) => {
      const leadDate = new Date(lead.Created_at);
      return (today - leadDate) / (1000 * 60 * 60 * 24) <= days;
    }).length;
  };

  const analyticsData = [
    { label: "Total Enquiries", count: enquires?.length },
    { label: "Last 7 Days", count: getLeadsByDateRange(7) },
    { label: "Last 30 Days", count: getLeadsByDateRange(30) },
    { label: "Last 6 Months", count: getLeadsByDateRange(180) },
    { label: "Last 1 Year", count: getLeadsByDateRange(365) },
  ];

  const statusDistribution = [
    {
      name: "Open",
      value: enquires?.filter((enquiry) => enquiry.status === "Open").length,
    },
    {
      name: "Converted",
      value: enquires?.filter((enquiry) => enquiry.status === "Converted")
        .length,
    },
    {
      name: "Contacted",
      value: enquires?.filter((enquiry) => enquiry.status === "Contacted")
        .length,
    },
  ];

  const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  console.log(enquires);

  return (
    <div className="bg-white p-4">
      <h2 className="text-sm font-semibold text-[#575757]">
        Enquiries Analytics
      </h2>
      {/* <div className="flex space-x-4 mb-4">
                {["All Enquiries", "Open", "Contacted", "Converted"].map(status => (
                    <button key={status}
                        className={`px-4 py-2 rounded ${activeFilter === status ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                        onClick={() => filterLeads(status)}>
                        {status}
                    </button>
                ))}
            </div> */}
      {!loading ? (
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 mt-4">
          {analyticsData.map((data) => (
            <div
              key={data.label}
              className="bg-zinc-100 text-[#575757] px-4 pt-10 pb-12 rounded-md  text-center"
            >
              <h3 className="text-4xl font-bold">{data.count}</h3>
              <p className=" text-[14px] font-medium mt-2">{data.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 mt-4">
          {[1, 2, 3, 4, 5].map((data) => (
            <div
              key={data.label}
              className="bg-zinc-100 h-[10rem] animate-pulse text-[#575757] px-4 pt-10 pb-12 rounded-md  text-center"
            ></div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white">
          <h2 className="text-sm font-medium mb-2 text-[#575757]">
            Enquiries Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white">
          <h2 className="text-sm font-medium mb-2 text-[#575757]">
            Enquiries Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {statusDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default LeadAnalytics;
