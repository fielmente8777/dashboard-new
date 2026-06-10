import React, { useEffect, useState } from "react";
import { BASE_URL, NEW_BASE_URL } from "../../data/constant";
import OverviewSection from "./components/sections/OverviewSection";
import HeaderSection from "./components/sections/HeaderSection";
import PerformanceOverviewSection from "./components/sections/PerformanceOverviewSection";
import TopPosts from "./components/sections/TopPosts";

const MetaPageInsights = () => {
  const [data, setData] = useState();

  const [dateRange, setDateRange] = useState("last_28_days");
  const [customRange, setCustomRange] = useState({
    startDate: "",
    endDate: "",
  });
  const fetchMetaInsights = async () => {
    const response = await fetch(
      `${NEW_BASE_URL}/api/v1/meta/page/overview?hid=${localStorage.getItem(
        "hid",
      )}&period=${dateRange}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    const data = await response.json();
    setData(data?.result?.doc);
  };

  useEffect(() => {
    fetchMetaInsights();
  }, [dateRange]);

  console.log(dateRange);

  return (
    <main className="p-4 space-y-4">
      <HeaderSection
        dateRange={dateRange}
        setDateRange={setDateRange}
        customRange={customRange}
        setCustomRange={setCustomRange}
      />
      <OverviewSection data={data?.cards} />
      <PerformanceOverviewSection data={data?.performanceOverview} />
      <TopPosts data={data?.topPosts} />
    </main>
  );
};

export default MetaPageInsights;
