import { useEffect, useState } from "react";

function normalizeClarityData(raw) {
  const result = {
    sessions: 0,
    pageViews: 0,
    rageClicks: 0,
    deadClicks: 0,
    engagementTime: 0,
    avgScrollDepth: 0,
  };

  raw.forEach((metric) => {
    switch (metric.metricName) {
      case "Traffic": {
        metric.information.forEach((info) => {
          result.sessions += Number(info.totalSessionCount || 0);
          result.pageViews += Number(info.pagesPerSessionPercentage || 0);
        });
        break;
      }

      case "RageClickCount": {
        result.rageClicks += Number(metric.information[0]?.subTotal || 0);
        break;
      }

      case "DeadClickCount": {
        result.deadClicks += Number(metric.information[0]?.subTotal || 0);
        break;
      }

      case "EngagementTime": {
        result.engagementTime += Number(metric.information[0]?.totalTime || 0);
        break;
      }

      case "ScrollDepth": {
        result.avgScrollDepth = Number(
          metric.information[0]?.averageScrollDepth || 0
        );
        break;
      }
    }
  });

  return result;
}

export default function ClarityDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      "http://localhost:8000/api/v1/clarity/overview?startDate=2025-01-01&endDate=2025-01-31"
    )
      .then((res) => res.json())
      .then((res) => {
        const normalized = normalizeClarityData(res);
        setData(normalized);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading analytics...</p>;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
      }}
    >
      <Metric title="Sessions" value={data.sessions} />
      <Metric title="Page Views" value={Math.round(data.pageViews)} />
      <Metric title="Rage Clicks" value={data.rageClicks} />
      <Metric title="Dead Clicks" value={data.deadClicks} />
      <Metric title="Engagement Time (sec)" value={data.engagementTime} />
      <Metric title="Avg Scroll %" value={data.avgScrollDepth} />
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <div
      style={{
        padding: 16,
        border: "1px solid #ddd",
        borderRadius: 8,
      }}
    >
      <p style={{ color: "#777" }}>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}
