import React, { useEffect, useState } from "react";
import { BASE_URL, NEW_BASE_URL } from "../../data/constant";
import OverviewSection from "./components/sections/OverviewSection";
import HeaderSection from "./components/sections/HeaderSection";

const MetaPageInsights = () => {
  const [data, setData] = useState();

  const [dateRange, setDateRange] = useState("last_28_days");
  const [customRange, setCustomRange] = useState({
    startDate: "",
    endDate: "",
  });
  const fetchMetaInsights = async () => {
    const response = await fetch(
      `${NEW_BASE_URL}/api/v1/meta/page/652691495062618/overview`,
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
  }, []);

  return (
    <main className="p-4">
      <HeaderSection
        dateRange={dateRange}
        setDateRange={setDateRange}
        customRange={customRange}
        setCustomRange={setCustomRange}
      />
      <OverviewSection data={data?.metrics} />
    </main>
  );
};

export default MetaPageInsights;
