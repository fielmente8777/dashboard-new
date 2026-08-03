import React from "react";
import MetricCard from "../cards/MetricCard";

const TITLES = {
  followers: "Followers",
  newFollowers: "New Followers",
  reach: "Reach",
  impressions: "Impressions",
  videoViews: "Video Views",
};

const OverviewSection = ({ data }) => {
  if (!data) return null;
  console.log(data);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Object.entries(data).map(([key, metric], index) => {
        return (
          <MetricCard
            key={key}
            title={TITLES[key] || key}
            value={metric.value}
            trend={metric.trend}
            growth={metric.growth}
            index={index}
          />
        );
      })}
    </div>
  );
};

export default OverviewSection;
