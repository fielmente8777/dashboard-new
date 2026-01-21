import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BASE_PATH } from "../../data/constant";
import axios from "axios";
import DataContext from "../../context/DataContext";

export default function GoogleAdsInsights() {
  const {
    integrationStatus,
    checkIntegrationStatus,
    isLoadingIntegrationStatus,
  } = useContext(DataContext);
  const [loading, setLoading] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState("all");
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const handleSyncAdsData = async () => {
    setLoadingSync(true);
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/google-ads/sync",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      // assuming response.data.accounts is the array
      const accountsData = response?.data?.result?.clientAccounts || [];
      setAccounts(accountsData);

      // auto-select first account
      if (accountsData.length > 0) {
        setSelectedAccount(accountsData[0].accountId);
      }
    } catch (error) {
      console.log("Error in syncing data", error);
    } finally {
      setLoadingSync(false);
    }
  };

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

  useEffect(() => {
    checkIntegrationStatus();
  }, []);

  if (isLoadingIntegrationStatus) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div className="h-8 w-64 rounded bg-gray-200 animate-pulse" />
          <div className="h-9 w-36 rounded bg-gray-200 animate-pulse" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-white shadow">
              <div className="p-4 space-y-3">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="rounded-xl bg-white shadow p-4">
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-4" />
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex justify-between py-3 border-t">
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------- NOT CONNECTED ----------------
  if (!integrationStatus.googleAdsInsight) {
    return (
      <div className=" flex items-center justify-center py-12">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 shadow-lg border border-gray-100 text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <svg
              className="h-7 w-7 text-blue-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M3 12h18M12 3v18" />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-semibold text-gray-900">
            Connect Google Ads
          </h2>

          {/* Description */}
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Connect your Google Ads account to start tracking campaigns,
            performance metrics, and conversion insights — all in one place.
          </p>

          {/* CTA */}
          <Link
            to={`${BASE_PATH}/${localStorage.getItem("hid")}/integration`}
            className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Connect Google Ads
          </Link>

          {/* Helper text */}
          <p className="mt-4 text-xs text-gray-400">
            Secure OAuth connection • No data shared without permission
          </p>
        </div>
      </div>
    );
  }

  // ---------------- CONNECTED ----------------
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Select Google Ads Account
          </label>

          <select
            className="w-72 rounded-lg border px-3 py-2 text-black"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            <option value="">Select an account</option>

            {accounts?.map((account) => (
              <option key={account.accountId} value={account.accountId}>
                {account?.customer_client?.descriptive_name}
              </option>
            ))}
          </select>
        </div>
        <button
          disabled={loadingSync}
          onClick={handleSyncAdsData}
          className="bg-primary text-white px-3 py-1.5 rounded-sm disabled:opacity-80"
        >
          {loadingSync ? "Synching..." : " Sync Ads Data"}
        </button>
      </div>
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
