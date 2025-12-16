import { useEffect, useState } from "react";

export default function ClarityDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  //   useEffect(() => {
  //     fetch(
  //       "http://localhost:8080/api/v1/clarity/overview?startDate=2025-01-01&endDate=2025-01-31"
  //     )
  //       .then((res) => res.json())
  //       .then((res) => {
  //         setData(res);
  //         setLoading(false);
  //       });
  //   }, []);

  //   if (loading) return <p>Loading analytics...</p>;

  return (
    <div>
      <iframe
        src="https://clarity.microsoft.com/projects/view/umdoefugc5"
        // src="www.google.com"
        width="100%"
        height="900"
      />
    </div>
    // <div
    //   style={{
    //     display: "grid",
    //     gridTemplateColumns: "repeat(4, 1fr)",
    //     gap: 16,
    //   }}
    // >
    //   <Metric title="Sessions" value={data.sessions} />
    //   <Metric title="Page Views" value={data.pageViews} />
    //   <Metric title="Rage Clicks" value={data.rageClicks} />
    //   <Metric title="Dead Clicks" value={data.deadClicks} />
    // </div>
  );
}

function Metric({ title, value }) {
  return (
    <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
      <p style={{ color: "#777" }}>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}
