import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { getAllClientEnquires } from "../../services/api";

const leadsData = [
    { id: 1, name: "Abhijeet", status: "Closed", email: "abhijeet@example.com", phone: "+9163456789", query: "Booking Inquiry", dateAdded: "2024-03-28T14:34:00" },
    { id: 2, name: "Test", status: "Not Converted", email: "test@example.com", phone: "+9178945612", query: "Pricing Details", dateAdded: "2024-03-21T10:16:00" },
    { id: 3, name: "UserX", status: "Follow Ups", email: "userx@example.com", phone: "+9187654321", query: "Feature Request", dateAdded: "2024-02-15T12:00:00" },
    { id: 4, name: "UserX", status: "Uncontacted", email: "userx@example.com", phone: "+9187654321", query: "Feature Request", dateAdded: "2024-02-15T12:00:00" },
];

const LeadAnalytics = () => {
    const [filteredLeads, setFilteredLeads] = useState(leadsData);
    const [activeFilter, setActiveFilter] = useState("All Enquires");

    const [enquires, setEnquires] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    const fetchEnquires = async (token) => {
        setLoading(true);
        try {
            const response = await getAllClientEnquires(token);
            setEnquires(response);
        } catch (error) {
            console.error("Error fetching enquires:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquires(localStorage.getItem("token"));
    }, [])

    const filterLeads = (status) => {
        if (status === "All Enquires") {
            setFilteredLeads(leadsData);
        } else {
            setFilteredLeads(leadsData.filter(lead => lead.status === status));
        }
        setActiveFilter(status);
    };

    const getLeadsByDateRange = (days) => {
        const today = new Date();
        return leadsData.filter(lead => {
            const leadDate = new Date(lead.dateAdded);
            return (today - leadDate) / (1000 * 60 * 60 * 24) <= days;
        }).length;
    };

    const analyticsData = [
        { label: "Total Enquires", count: enquires.length },
        // { label: "Last 7 Days", count: enquires.length - 3 },
        // { label: "Last 30 Days", count: enquires.length - 1 },
        // { label: "Last 7 Days", count: getLeadsByDateRange(7) },
        // { label: "Last 30 Days", count: getLeadsByDateRange(30) },
        // { label: "Last 6 Months", count: getLeadsByDateRange(180) },
        // { label: "Last 1 Year", count: getLeadsByDateRange(365) },
    ];

    const statusDistribution = [
        { name: "Closed", value: leadsData.filter(l => l.status === "Closed").length },
        { name: "Follow Ups", value: leadsData.filter(l => l.status === "Follow Ups").length },
        { name: "Not Converted", value: leadsData.filter(l => l.status === "Not Converted").length },
        { name: "Uncontacted", value: leadsData.filter(l => l.status === "Uncontacted").length },
    ];

    const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

    return (
        <div className="bg-white p-4">
            <h2 className="text-sm font-semibold text-[#575757]">Enquires Analytics</h2>
            {/* <div className="flex space-x-4 mb-4">
                {["All Leads", "Uncontacted", "Follow Ups", "Converted", "Not Converted"].map(status => (
                    <button key={status}
                        className={`px-4 py-2 rounded ${activeFilter === status ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                        onClick={() => filterLeads(status)}>
                        {status}
                    </button>
                ))}
            </div> */}

            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 mt-4">
                {analyticsData.map((data) => (

                    <div key={data.label} className="bg-zinc-100 text-[#575757] px-4 pt-10 pb-12 rounded-md  text-center">

                        <h3 className="text-4xl font-bold">{data.count}</h3>
                        <p className=" text-[14px] font-medium mt-2">{data.label}</p>

                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white">
                    <h2 className="text-sm font-medium mb-2 text-[#575757]">Enquires Over Time</h2>
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
                    <h2 className="text-sm font-medium mb-2 text-[#575757]">Enquires Status Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={statusDistribution} dataKey="value" nameKey="name" outerRadius={100} label>
                                {statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
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
