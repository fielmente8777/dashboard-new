import { useState } from "react";
import { Link } from "react-router-dom";
import { BASE_PATH } from "../../data/constant";
import axios from "axios";

export default function GoogleAdsInsights() {
  const [connected, setConnected] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState("all");

  const handleSyncAdsData=async()=>{
    try {
        const response=await axios.get("http://localhost:8000/api/v1/google-ads/sync",{
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        console.log(response);
    } catch (error) {
      console.log("Error in syncing data");
    }
  }






  const accountSummary = {
    impressions: 125430,
    clicks: 4231,
    cost: 52340,
    conversions: 312,
  };

  const campaigns = [
    {
      id: "1",
      name: "Search - Hotels",
      impressions: 45230,
      clicks: 1843,
      cost: 21450,
      conversions: 143,
      ads: [
        { name: "Hotel Ad 1", impressions: 12000, clicks: 520, cost: 6200 },
        { name: "Hotel Ad 2", impressions: 9000, clicks: 410, cost: 4800 },
      ],
    },
    {
      id: "2",
      name: "Display - Branding",
      impressions: 80100,
      clicks: 2388,
      cost: 30890,
      conversions: 169,
      ads: [
        { name: "Banner Ad 1", impressions: 35000, clicks: 900, cost: 12000 },
        { name: "Banner Ad 2", impressions: 28000, clicks: 700, cost: 8900 },
      ],
    },
  ];
  
  const activeCampaign =
    selectedCampaign === "all"
      ? null
      : campaigns.find((c) => c.id === selectedCampaign);

  // ---------------- NOT CONNECTED ----------------
  if (!connected) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="rounded-xl bg-white p-8 shadow-md text-center">
          <h2 className="text-xl font-semibold mb-2">
            Google Ads Not Connected
          </h2>
          <p className="text-gray-500 mb-6">
            Connect your Google Ads account to view insights
          </p>
          <Link
            to={`${BASE_PATH}/${localStorage.getItem("hid")}/integration`}
            // onClick={() => setConnected(true)}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Connect Google Ads
          </Link>
        </div>
      </div>
    );
  }

  // ---------------- CONNECTED ----------------
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
    <button onClick={handleSyncAdsData}>Sync Ads Data</button>
      <h1 className="text-2xl font-semibold mb-6">Google Ads Dashboard</h1>

      {/* Account Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Impressions" value={accountSummary.impressions} />
        <StatCard title="Clicks" value={accountSummary.clicks} />
        <StatCard title="Cost (₹)" value={accountSummary.cost} />
        <StatCard title="Conversions" value={accountSummary.conversions} />
      </div>

      {/* Campaign Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Select Campaign
        </label>
        <select
          className="w-64 rounded-lg border px-3 py-2"
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
        >
          <option value="all">All Campaigns</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Campaign Level */}
      {activeCampaign && (
        <>
          <h2 className="text-lg font-semibold mb-4">Campaign Insights</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Impressions" value={activeCampaign.impressions} />
            <StatCard title="Clicks" value={activeCampaign.clicks} />
            <StatCard title="Cost (₹)" value={activeCampaign.cost} />
            <StatCard title="Conversions" value={activeCampaign.conversions} />
          </div>

          {/* Ad Level Table */}
          <h2 className="text-lg font-semibold mb-4">Ad Level Insights</h2>

          <div className="overflow-x-auto rounded-lg bg-white shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-3">Ad Name</th>
                  <th className="px-4 py-3">Impressions</th>
                  <th className="px-4 py-3">Clicks</th>
                  <th className="px-4 py-3">Cost (₹)</th>
                </tr>
              </thead>
              <tbody>
                {activeCampaign.ads.map((ad, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{ad.name}</td>
                    <td className="px-4 py-3">{ad.impressions}</td>
                    <td className="px-4 py-3">{ad.clicks}</td>
                    <td className="px-4 py-3">{ad.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}
