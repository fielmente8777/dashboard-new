import { useEffect, useState } from "react"; // change according to your project
import { NEW_BASE_URL } from "../../data/constant";
import SummarySection from "./components/SummarySection/SummarySection";
import axios from "axios";
import Header from "./components/Header/Header";
import CallTrendSection from "./components/CallTrendSection/CallTrendSection";
import CallDistributionSection from "./components/CallDistributionSection/CallDistributionSection";

const CallsAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    type: "7days",
    from: "",
    to: "",
  });

  const getAnalytics = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${NEW_BASE_URL}/api/v1/call/analytics?hid=${localStorage.getItem("hid")}&from=${dateRange.from}&to=${dateRange.to}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      const data = await response.json();

      setAnalytics(data.result.doc);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAnalytics();
  }, [dateRange]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-5 p-4">
      <Header selectedRange={dateRange.type} onRangeChange={setDateRange} />
      <SummarySection summary={analytics?.summary} />
      <CallTrendSection trend={analytics.trend} />
      <CallDistributionSection
        statusDistribution={analytics.statusDistribution}
        directionDistribution={analytics.directionDistribution}
      />
    </div>
  );
};

export default CallsAnalytics;
