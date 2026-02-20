import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import { BASE_PATH, NEW_BASE_URL } from "../../data/constant";
import DataContext from "../../context/DataContext";
import DailyInsightsChart from "../../components/Charts/GoogleAds/DailyInsightChart";

export default function GoogleAdsInsights() {
  const {
    integrationStatus,
    checkIntegrationStatus,
    isLoadingIntegrationStatus,
    is24HoursCompleted,
  } = useContext(DataContext);

  /* -------------------- LOADING STATES -------------------- */
  const [loadingSync, setLoadingSync] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingAdGroups, setLoadingAdGroups] = useState(false);
  const [loadingAds, setLoadingAds] = useState(false);
  const [loadingAdDetails, setLoadingAdDetails] = useState(false);

  /* -------------------- DATA STATES -------------------- */
  const [accounts, setAccounts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [adGroups, setAdGroups] = useState([]);
  const [ads, setAds] = useState([]);
  const [selectedAdData, setSelectedAdData] = useState([]);

  /* -------------------- SELECTED VALUES -------------------- */
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [selectedAdGroup, setSelectedAdGroup] = useState("");
  const [selectedAd, setSelectedAd] = useState("");

  /* -------------------- SYNC -------------------- */
  const handleSyncAdsData = async () => {
    setLoadingSync(true);

    try {
      const response = await axios.get(
        `${NEW_BASE_URL}/api/v1/google-ads/sync`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const accountsData = response?.data?.result?.clientAccounts || [];
      setAccounts(accountsData);
      checkIntegrationStatus();

      if (accountsData.length > 0) {
        handleChangeAccount(accountsData[0].clientCustomerId);
      }
    } catch (error) {
      const data = error?.response?.data;
      const isNotAdsAccount =
        data?.error?.errors?.[0]?.error_code?.authentication_error ===
        "NOT_ADS_USER";

      Swal.fire(
        "Error",
        isNotAdsAccount
          ? "You must have a Google Ads Account to sync data."
          : error.message,
        "error",
      );
    } finally {
      setLoadingSync(false);
    }
  };

  /* -------------------- HANDLERS -------------------- */
  const handleChangeAccount = async (accountId) => {
    setSelectedAccount(accountId);

    // reset children
    setCampaigns([]);
    setAdGroups([]);
    setAds([]);
    setSelectedCampaign("");
    setSelectedAdGroup("");
    setSelectedAd("");
    setSelectedAdData([]);

    await getCampaigns(accountId);
  };

  const handleChangeCampaign = async (campaignId) => {
    setSelectedCampaign(campaignId);

    setAdGroups([]);
    setAds([]);
    setSelectedAdGroup("");
    setSelectedAd("");
    setSelectedAdData([]);

    await getAdGroups(campaignId);
  };

  const handleChangeAdGroup = async (adGroupId) => {
    setSelectedAdGroup(adGroupId);

    setAds([]);
    setSelectedAd("");
    setSelectedAdData([]);

    await getAds(adGroupId);
  };

  const handleChangeAd = async (adId) => {
    setSelectedAd(adId);
    await getAdDetails(adId);
  };

  /* -------------------- API CALLS -------------------- */
  const getAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const response = await axios.get(
        `${NEW_BASE_URL}/api/v1/google-ads/accounts`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = response?.data?.result?.accounts || [];
      setAccounts(data);

      if (data.length > 0) {
        handleChangeAccount(data[0].clientCustomerId);
      }
    } finally {
      setLoadingAccounts(false);
    }
  };

  const getCampaigns = async (accountId) => {
    setLoadingCampaigns(true);
    try {
      const response = await axios.get(
        `${NEW_BASE_URL}/api/v1/google-ads/campaigns/${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = response?.data?.result?.campaigns || [];
      setCampaigns(data);

      if (data.length > 0) {
        handleChangeCampaign(data[0].campaignId);
      }
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const getAdGroups = async (campaignId) => {
    setLoadingAdGroups(true);
    try {
      const response = await axios.get(
        `${NEW_BASE_URL}/api/v1/google-ads/adgroups/${campaignId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = response?.data?.result?.adGroups || [];
      setAdGroups(data);

      if (data.length > 0) {
        handleChangeAdGroup(data[0].adGroupId);
      }
    } finally {
      setLoadingAdGroups(false);
    }
  };

  const getAds = async (adGroupId) => {
    setLoadingAds(true);
    try {
      const response = await axios.get(
        `${NEW_BASE_URL}/api/v1/google-ads/ads/${adGroupId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = response?.data?.result?.ads || [];
      setAds(data);

      if (data.length > 0) {
        handleChangeAd(data[0].adId);
      }
    } finally {
      setLoadingAds(false);
    }
  };

  const getAdDetails = async (adId) => {
    setLoadingAdDetails(true);
    try {
      const response = await axios.get(
        `${NEW_BASE_URL}/api/v1/google-ads/ad-details/${adId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setSelectedAdData(response?.data?.result?.adDetails || []);
    } finally {
      setLoadingAdDetails(false);
    }
  };

  /* -------------------- INIT -------------------- */
  useEffect(() => {
    checkIntegrationStatus();
    getAccounts();
  }, []);

  if (isLoadingIntegrationStatus) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 animate-pulse">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div className="h-7 w-56 rounded bg-gray-200" />
          <div className="h-9 w-32 rounded bg-gray-200" />
        </div>

        {/* Dropdowns */}
        <div className="flex gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-64">
              <div className="h-4 w-24 mb-2 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="h-80 rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (!integrationStatus?.googleAdsInsight?.status) {
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

  /* -------------------- UI -------------------- */
  return (
    <div className="p-6 bg-gray-50">
      {!integrationStatus?.googleAdsInsight?.lastSyncTime && (
        <div className="flex items-center justify-center py-16">
          <div className="max-w-md w-full rounded-2xl bg-white p-8 shadow-lg border border-gray-100 text-center">
            {/* Icon */}
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <svg
                className="h-7 w-7 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 4v16m8-8H4" />
              </svg>
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-semibold text-gray-900">
              Sync Google Ads Data
            </h2>

            {/* Description */}
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Your Google Ads account is connected successfully. To start
              viewing campaigns, ad groups, and insights, sync your data for the
              first time.
            </p>

            {/* CTA */}
            <button
              onClick={handleSyncAdsData}
              disabled={loadingSync}
              className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-70"
            >
              {loadingSync ? "Syncing..." : "Sync Ads Data"}
            </button>

            {/* Helper */}
            <p className="mt-4 text-xs text-gray-400">
              First sync may take a few moments depending on account size
            </p>
          </div>
        </div>
      )}

      {integrationStatus?.googleAdsInsight?.lastSyncTime && (
        <div>
          {is24HoursCompleted && (
            <div className="flex justify-end">
              {is24HoursCompleted && (
                <button
                  onClick={handleSyncAdsData}
                  disabled={loadingSync}
                  className="mt-8 inline-flex w-fit items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary/90 disabled:opacity-70"
                >
                  {loadingSync ? "Syncing..." : "Sync Ads Data"}
                </button>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-6">
            <Select
              label="Account"
              value={selectedAccount}
              loading={loadingAccounts}
              disabled={loadingAccounts}
              onChange={handleChangeAccount}
              options={accounts.map((a) => ({
                value: a.clientCustomerId,
                label: a.accountName,
              }))}
            />

            <Select
              label="Campaign"
              value={selectedCampaign}
              loading={loadingCampaigns}
              disabled={!selectedAccount || loadingCampaigns}
              onChange={handleChangeCampaign}
              options={campaigns.map((c) => ({
                value: c.campaignId,
                label: c.name,
              }))}
            />

            <Select
              label="Ad Group"
              value={selectedAdGroup}
              loading={loadingAdGroups}
              disabled={!selectedCampaign || loadingAdGroups}
              onChange={handleChangeAdGroup}
              options={adGroups.map((g) => ({
                value: g.adGroupId,
                label: g.name,
              }))}
            />

            <Select
              label="Ads"
              value={selectedAd}
              loading={loadingAds}
              disabled={!selectedAdGroup || loadingAds}
              onChange={handleChangeAd}
              options={ads.map((a) => ({
                value: a.adId,
                label: a.finalUrls?.[0],
              }))}
            />
          </div>

          <div className="mt-16">
            {loadingAdDetails ? (
              /* -------- LOADING STATE -------- */
              <div className="h-80 rounded-xl bg-white p-6 shadow animate-pulse">
                {/* Chart header */}
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full" />
                </div>

                {/* Chart area */}
                <div className="flex items-end gap-3 h-44">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gray-200 rounded"
                      style={{ height: `${30 + i * 10}%` }}
                    />
                  ))}
                </div>
              </div>
            ) : selectedAdData && selectedAdData.length > 0 ? (
              /* -------- DATA AVAILABLE -------- */
              <div className="mb-6 rounded-xl bg-white p-5 ">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Performance Overview
                    </h2>
                    <p className="text-sm text-gray-500">
                      Last 30 days ad performance insights
                    </p>
                  </div>

                  {/* Date badge */}
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                    Last 30 Days
                  </span>
                </div>

                {selectedAdData && selectedAdData.length > 0 && (
                  <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                      label="Impressions"
                      value={selectedAdData.reduce(
                        (sum, d) => sum + (d.impressions || 0),
                        0,
                      )}
                    />
                    <StatCard
                      label="Clicks"
                      value={selectedAdData.reduce(
                        (sum, d) => sum + (d.clicks || 0),
                        0,
                      )}
                    />
                    <StatCard
                      label="Conversions"
                      value={selectedAdData.reduce(
                        (sum, d) => sum + (d.conversions || 0),
                        0,
                      )}
                    />
                    <StatCard
                      label="Cost"
                      value={`₹${selectedAdData
                        .reduce((sum, d) => sum + (d.cost || 0), 0)
                        .toFixed(2)}`}
                    />
                  </div>
                )}

                {/* Chart */}
                <DailyInsightsChart data={selectedAdData} />
              </div>
            ) : (
              /* -------- EMPTY STATE -------- */
              <div className="flex items-center justify-center h-64 rounded-xl bg-white">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 17v-2a4 4 0 014-4h2M7 7h.01M3 3l18 18" />
                    </svg>
                  </div>

                  <p className="text-sm font-medium text-gray-700">
                    No ads data available
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    No insights found for the selected ad.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- REUSABLE SELECT -------------------- */
function Select({ label, value, onChange, options, loading, disabled }) {
  const hasOptions = options && options.length > 0;

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>

      <select
        className="w-64 border rounded px-3 py-2 text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
        value={value}
        disabled={disabled || loading || !hasOptions}
        onChange={(e) => onChange(e.target.value)}
      >
        {loading && <option value="">Loading...</option>}

        {!loading && !hasOptions && <option value="">No data available</option>}

        {!loading &&
          hasOptions &&
          options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label || "N/A"}
            </option>
          ))}
      </select>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border bg-gray-50 p-4">
      <p className="text-sm text-gray-700 font-medium">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

// import { useContext, useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { BASE_PATH } from "../../data/constant";
// import axios from "axios";
// import DataContext from "../../context/DataContext";
// import DailyInsightsChart from "../../components/Charts/GoogleAds/DailyInsightChart";
// import Swal from "sweetalert2";

// export default function GoogleAdsInsights() {
//   const {
//     integrationStatus,
//     checkIntegrationStatus,
//     isLoadingIntegrationStatus,
//     is24HoursCompleted,
//   } = useContext(DataContext);
//   // const [loading, setLoading] = useState(false);
//   const [loadingSync, setLoadingSync] = useState(false);
//   const [selectedCampaign, setSelectedCampaign] = useState("all");
//   const [accounts, setAccounts] = useState([]);
//   const [campaigns, setCampaigns] = useState([]);
//   const [adGroups, setAdGroups] = useState([]);
//   const [ads, setAds] = useState([]);
//   const [selectedAdData, setSelectedAdData] = useState([]);

//   const [selectedAccount, setSelectedAccount] = useState("");
//   const handleSyncAdsData = async () => {
//     setLoadingSync(true);
//     try {
//       const response = await axios.get(
//         "http://localhost:8000/api/v1/google-ads/sync",
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         },
//       );

//       // assuming response.data.accounts is the array
//       const accountsData = response?.data?.result?.clientAccounts || [];
//       setAccounts(accountsData);

//       // auto-select first account
//       if (accountsData.length > 0) {
//         setSelectedAccount(accountsData[0].accountId);
//       }
//     } catch (error) {
//       const { data } = error.response;

//       const isNotAdsAccount =
//         data?.error?.errors[0]?.error_code?.authentication_error ===
//         "NOT_ADS_USER";
//       if (isNotAdsAccount) {
//         Swal.fire({
//           icon: "error",
//           title: "Oops...",
//           text: "You need to be a Google Ads user to sync data.",
//         });
//       } else {
//         Swal.fire("Error", error.message, "error");
//       }
//     } finally {
//       setLoadingSync(false);
//     }
//   };

//   const activeCampaign =
//     selectedCampaign === "all"
//       ? null
//       : campaigns.find((c) => c.id === selectedCampaign);

//   const handleChangeAccount = (value) => {
//     setSelectedAccount(value);
//     getCampaigns(value);
//   };

//   const handleChangeCampaign = (value) => {
//     setSelectedCampaign(value);
//     getAdsGrouped(value);
//   };

//   const handleChangeAdGroup = (value) => {
//     getAds(value);
//   };

//   const handleChangeAd = (value) => {
//     getAdsDetails(value);
//   };

//   const getAdsDetails = async (id) => {
//     try {
//       const response = await axios.get(
//         `http://localhost:8000/api/v1/google-ads/ad-details/${id}`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         },
//       );

//       const adDetails = response?.data?.result?.adDetails || [];
//       setSelectedAdData(adDetails);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const getAds = async (id) => {
//     try {
//       const response = await axios.get(
//         `http://localhost:8000/api/v1/google-ads/ads/${id}`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         },
//       );

//       const ads = response?.data?.result?.ads || [];
//       setAds(ads);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const getAdsGrouped = async (id) => {
//     try {
//       const response = await axios.get(
//         `http://localhost:8000/api/v1/google-ads/adgroups/${id}`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         },
//       );

//       const adGroups = response?.data?.result?.adGroups || [];
//       setAdGroups(adGroups);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const getCampaigns = async (accountId) => {
//     try {
//       const response = await axios.get(
//         `http://localhost:8000/api/v1/google-ads/campaigns/${accountId}`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         },
//       );

//       const campaigns = response?.data?.result?.campaigns || [];

//       getAdsGrouped(campaigns[0].campaignId);
//       setCampaigns(campaigns);
//     } catch (error) {
//       console.log("Error in syncing data", error);
//     }
//   };

//   const getAccounts = async () => {
//     try {
//       const response = await axios.get(
//         "http://localhost:8000/api/v1/google-ads/accounts",
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         },
//       );

//       const accounts = response?.data?.result?.accounts || [];
//       setAccounts(accounts);
//       if (accounts.length > 0) {
//         getCampaigns(accounts[0].clientCustomerId);
//         setSelectedAccount(accounts[0].clientCustomerId);
//       }
//     } catch (error) {
//       console.log("Error in syncing data", error);
//     }
//   };

//   useEffect(() => {
//     checkIntegrationStatus();
//     getAccounts();
//   }, []);

//   if (isLoadingIntegrationStatus) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6">
//         {/* Header */}
//         <div className="mb-6 flex justify-between items-center">
//           <div className="h-8 w-64 rounded bg-gray-200 animate-pulse" />
//           <div className="h-9 w-36 rounded bg-gray-200 animate-pulse" />
//         </div>

//         {/* Stat cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           {[1, 2, 3, 4].map((i) => (
//             <div key={i} className="h-24 rounded-xl bg-white shadow">
//               <div className="p-4 space-y-3">
//                 <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
//                 <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Table skeleton */}
//         <div className="rounded-xl bg-white shadow p-4">
//           <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-4" />
//           {[1, 2, 3, 4, 5].map((row) => (
//             <div key={row} className="flex justify-between py-3 border-t">
//               <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
//               <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
//               <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
//               <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   // ---------------- NOT CONNECTED ----------------
//   if (!integrationStatus?.googleAdsInsight?.status) {
//     return (
//       <div className=" flex items-center justify-center py-12">
//         <div className="max-w-md w-full rounded-2xl bg-white p-8 shadow-lg border border-gray-100 text-center">
//           {/* Icon */}
//           <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
//             <svg
//               className="h-7 w-7 text-blue-600"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               viewBox="0 0 24 24"
//             >
//               <path d="M3 12h18M12 3v18" />
//             </svg>
//           </div>

//           {/* Heading */}
//           <h2 className="text-2xl font-semibold text-gray-900">
//             Connect Google Ads
//           </h2>

//           {/* Description */}
//           <p className="mt-3 text-sm text-gray-600 leading-relaxed">
//             Connect your Google Ads account to start tracking campaigns,
//             performance metrics, and conversion insights — all in one place.
//           </p>

//           {/* CTA */}
//           <Link
//             to={`${BASE_PATH}/${localStorage.getItem("hid")}/integration`}
//             className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//           >
//             Connect Google Ads
//           </Link>

//           {/* Helper text */}
//           <p className="mt-4 text-xs text-gray-400">
//             Secure OAuth connection • No data shared without permission
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // ---------------- CONNECTED ----------------
//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="flex justify-between items-center">
//         <div className="flex items-center gap-2">
//           <div className="mb-6">
//             <label className="block text-sm font-medium mb-2">
//               Select Google Ads Account
//             </label>

//             <select
//               className="w-72 rounded-lg border px-3 py-2 text-black"
//               value={selectedAccount}
//               onChange={(e) => handleChangeAccount(e.target.value)}
//             >
//               <option value="">Select an account</option>

//               {accounts?.map((account) => (
//                 <option
//                   key={account.accountId}
//                   value={account.clientCustomerId}
//                 >
//                   {account?.accountName}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="mb-6">
//             <label className="block text-sm font-medium mb-2">
//               Select Campaign
//             </label>
//             <select
//               className="w-64 rounded-lg border px-3 py-2"
//               value={selectedCampaign}
//               onChange={(e) => handleChangeCampaign(e.target.value)}
//             >
//               <option value="all">All Campaigns</option>
//               {campaigns.map((c) => (
//                 <option key={c.id} value={c.campaignId}>
//                   {c.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="mb-6">
//             <label className="block text-sm font-medium mb-2">
//               Select Ads Group
//             </label>
//             <select
//               className="w-64 rounded-lg border px-3 py-2"
//               value={selectedCampaign}
//               onChange={(e) => handleChangeAdGroup(e.target.value)}
//             >
//               <option value="all">All Ads Group</option>
//               {adGroups?.map((c) => (
//                 <option key={c.id} value={c.adGroupId}>
//                   {c.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="mb-6">
//             <label className="block text-sm font-medium mb-2">Select Ads</label>
//             <select
//               className="w-64 rounded-lg border px-3 py-2"
//               value={selectedCampaign}
//               onChange={(e) => handleChangeAd(e.target.value)}
//             >
//               <option value="all">All Ads</option>
//               {ads?.map((c) => (
//                 <option key={c.id} value={c.adId}>
//                   {c?.finalUrls[0]}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//         {!integrationStatus?.googleAdsInsight?.lastSyncTime ? (
//           <button
//             disabled={loadingSync}
//             onClick={handleSyncAdsData}
//             className="bg-primary text-white px-3 py-1.5 rounded-sm disabled:opacity-80"
//           >
//             {loadingSync ? "Synching..." : " Sync Ads Data"}
//           </button>
//         ) : (
//           is24HoursCompleted(
//             <button
//               disabled={loadingSync}
//               onClick={handleSyncAdsData}
//               className="bg-primary text-white px-3 py-1.5 rounded-sm disabled:opacity-80"
//             >
//               {loadingSync ? "Synching..." : " Sync Ads Data"}
//             </button>,
//           )
//         )}
//       </div>
//       <h1 className="text-2xl font-semibold mb-6">Google Ads Dashboard</h1>

//       {selectedAdData && <DailyInsightsChart data={selectedAdData} />}

//       {/* Account Summary */}
//       {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <StatCard title="Impressions" value={accountSummary.impressions} />
//         <StatCard title="Clicks" value={accountSummary.clicks} />
//         <StatCard title="Cost (₹)" value={accountSummary.cost} />
//         <StatCard title="Conversions" value={accountSummary.conversions} />
//       </div> */}

//       {/* Campaign Selector */}
//       <div className="mb-6">
//         <label className="block text-sm font-medium mb-2">
//           Select Campaign
//         </label>
//         <select
//           className="w-64 rounded-lg border px-3 py-2"
//           value={selectedCampaign}
//           onChange={(e) => setSelectedCampaign(e.target.value)}
//         >
//           <option value="all">All Campaigns</option>
//           {campaigns.map((c) => (
//             <option key={c.id} value={c.id}>
//               {c.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Campaign Level */}
//       {activeCampaign && (
//         <>
//           <h2 className="text-lg font-semibold mb-4">Campaign Insights</h2>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//             <StatCard title="Impressions" value={activeCampaign.impressions} />
//             <StatCard title="Clicks" value={activeCampaign.clicks} />
//             <StatCard title="Cost (₹)" value={activeCampaign.cost} />
//             <StatCard title="Conversions" value={activeCampaign.conversions} />
//           </div>

//           {/* Ad Level Table */}
//           <h2 className="text-lg font-semibold mb-4">Ad Level Insights</h2>

//           <div className="overflow-x-auto rounded-lg bg-white shadow">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-100 text-left">
//                 <tr>
//                   <th className="px-4 py-3">Ad Name</th>
//                   <th className="px-4 py-3">Impressions</th>
//                   <th className="px-4 py-3">Clicks</th>
//                   <th className="px-4 py-3">Cost (₹)</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {activeCampaign.ads.map((ad, idx) => (
//                   <tr key={idx} className="border-t hover:bg-gray-50">
//                     <td className="px-4 py-3">{ad.name}</td>
//                     <td className="px-4 py-3">{ad.impressions}</td>
//                     <td className="px-4 py-3">{ad.clicks}</td>
//                     <td className="px-4 py-3">{ad.cost}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// function StatCard({ title, value }) {
//   return (
//     <div className="rounded-xl bg-white p-4 shadow">
//       <p className="text-sm text-gray-500">{title}</p>
//       <p className="text-2xl font-semibold mt-1">{value}</p>
//     </div>
//   );
// }
