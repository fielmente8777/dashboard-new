// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { getCampaignDetails } from "../../services/api/whatsApp";
// import CampaignHeader from "./components/broadCastingDetails/CampaignHeader";
// import StatsGrid from "./components/broadCastingDetails/StatsGrid";
// import DeliveryFunnel from "./components/broadCastingDetails/DeliveryFunnel";
// import RecipientsTable from "./components/broadCastingDetails/RecipientsTable";
// import usePagination from "../../hooks/usePagination";

// const LIMIT = 5;

// const BroadcastDetails = () => {
//   const { id } = useParams();

//   const [campaign, setCampaign] = useState(null);
//   const [recipients, setRecipients] = useState([]);

//   // Query params — changing any of these triggers a fresh API call
//   const [filter, setFilter] = useState("all");
//   const [search, setSearch] = useState("");

//   const [pageLoading, setPageLoading] = useState(true); // first load
//   const [tableLoading, setTableLoading] = useState(false); // tab / search / page changes

//   const {
//     page,
//     total,
//     totalPages,
//     setPage,
//     setTotal,
//     // goToPage,
//     nextPage,
//     prevPage,
//     // changeLimit,
//   } = usePagination({ initialLimit: LIMIT });

//   // ── Fetch campaign meta once ─────────────────────────────────────────────
//   useEffect(() => {
//     fetchCampaign();
//   }, []);

//   const fetchCampaign = async () => {
//     setPageLoading(true);
//     try {
//       const res = await getCampaignDetails(id, { page: 1, limit: LIMIT });
//       if (res?.success) {
//         setCampaign(res.result.doc.campaign);
//         setRecipients(res.result.doc.recipients);
//         setTotal(res.result.doc.pagination.total ?? 0);
//       }
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setPageLoading(false);
//     }
//   };

//   // ── Fetch recipients when query params change ────────────────────────────
//   useEffect(() => {
//     // Skip on initial mount — fetchCampaign already loads page 1
//     if (pageLoading) return;
//     fetchRecipients();
//   }, [page, filter, search]);

//   const fetchRecipients = async () => {
//     setTableLoading(true);
//     try {
//       const params = {
//         page,
//         limit: LIMIT,
//         ...(filter !== "all" && { status: filter }),
//         ...(search && { search }),
//       };
//       const res = await getCampaignDetails(id, params);
//       if (res?.success) {
//         setRecipients(res.result.doc.recipients);
//         setTotal(res.result.doc.pagination.total ?? 0);
//       }
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setTableLoading(false);
//     }
//   };

//   // ── Handler: reset page to 1 whenever filter or search changes ───────────
//   const handleFilterChange = (newFilter) => {
//     setFilter(newFilter);
//     setPage(1);
//   };

//   const handleSearchChange = (newSearch) => {
//     setSearch(newSearch);
//     setPage(1);
//   };

//   // ── Loading state (first load only) ─────────────────────────────────────
//   if (pageLoading) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center">
//         <div className="flex flex-col items-center gap-4">
//           <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
//           <p className="text-gray-400 text-sm">Loading campaign data…</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 font-sans">
//       <CampaignHeader campaign={campaign} onRefresh={fetchCampaign} />

//       <div className="px-8 py-6 max-w-7xl mx-auto space-y-6">
//         <StatsGrid campaign={campaign} />

//         <DeliveryFunnel campaign={campaign} />

//         <RecipientsTable
//           recipients={recipients}
//           total={total}
//           totalPages={totalPages}
//           page={page}
//           filter={filter}
//           search={search}
//           loading={tableLoading}
//           onFilterChange={handleFilterChange}
//           onSearchChange={handleSearchChange}
//           onPageChange={setPage}
//           onNextPage={nextPage}
//           onPrevPage={prevPage}
//         />
//       </div>
//     </div>
//   );
// };

// export default BroadcastDetails;




import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  getCampaignDetails,
  resendFailedCampaignRecipient,
} from "../../services/api/whatsApp";

import CampaignHeader from "./components/broadCastingDetails/CampaignHeader";
import StatsGrid from "./components/broadCastingDetails/StatsGrid";
import DeliveryFunnel from "./components/broadCastingDetails/DeliveryFunnel";
import RecipientsTable from "./components/broadCastingDetails/RecipientsTable";
import usePagination from "../../hooks/usePagination";

const LIMIT = 5;

const BroadcastDetails = () => {
  const { id } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [pageLoading, setPageLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [resendingId, setResendingId] = useState(null);

  const {
    page,
    total,
    totalPages,
    setPage,
    setTotal,
    nextPage,
    prevPage,
  } = usePagination({ initialLimit: LIMIT });

  // Fetch campaign information and first page of recipients.
  const fetchCampaign = useCallback(async () => {
    if (!id) return;

    setPageLoading(true);

    try {
      const res = await getCampaignDetails(id, {
        page: 1,
        limit: LIMIT,
      });

      if (res?.success) {
        const doc = res?.result?.doc;

        setCampaign(doc?.campaign ?? null);
        setRecipients(doc?.recipients ?? []);
        setTotal(doc?.pagination?.total ?? 0);
        setPage(1);
      }
    } catch (error) {
      console.error("Failed to fetch campaign:", error);
    } finally {
      setPageLoading(false);
    }
  }, [id, setPage, setTotal]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  // Fetch recipients whenever the filter, search, or page changes.
  const fetchRecipients = useCallback(async () => {
    if (!id) return;

    setTableLoading(true);

    try {
      const params = {
        page,
        limit: LIMIT,
        ...(filter !== "all" && { status: filter }),
        ...(search.trim() && { search: search.trim() }),
      };

      const res = await getCampaignDetails(id, params);

      if (res?.success) {
        const doc = res?.result?.doc;

        setRecipients(doc?.recipients ?? []);
        setTotal(doc?.pagination?.total ?? 0);
      }
    } catch (error) {
      console.error("Failed to fetch recipients:", error);
    } finally {
      setTableLoading(false);
    }
  }, [id, page, filter, search, setTotal]);

  useEffect(() => {
    if (pageLoading) return;

    fetchRecipients();
  }, [pageLoading, fetchRecipients]);

  // Resend only failed recipients.
  const handleResend = async (recipient) => {
    if (
      !recipient?._id ||
      recipient.status?.toLowerCase() !== "failed" ||
      resendingId
    ) {
      return;
    }

    try {
      setResendingId(recipient._id);

      await resendFailedCampaignRecipient({
        campaignId: id,
        recipientId: recipient._id,
      });

      // Refresh campaign statistics and current recipient page.
      const campaignRes = await getCampaignDetails(id, {
        page: 1,
        limit: LIMIT,
      });

      if (campaignRes?.success) {
        setCampaign(campaignRes.result.doc?.campaign ?? null);
      }

      await fetchRecipients();
    } catch (error) {
      console.error("Failed to resend recipient:", error);
      window.alert(error.message || "Unable to resend message.");
    } finally {
      setResendingId(null);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
    setPage(1);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">
            Loading campaign data…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <CampaignHeader
        campaign={campaign}
        onRefresh={fetchCampaign}
      />

      <div className="px-8 py-6 max-w-7xl mx-auto space-y-6">
        <StatsGrid campaign={campaign} />

        <DeliveryFunnel campaign={campaign} />

        <RecipientsTable
          recipients={recipients}
          total={total}
          totalPages={totalPages}
          page={page}
          filter={filter}
          search={search}
          loading={tableLoading}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          onPageChange={setPage}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          onResend={handleResend}
          resendingId={resendingId}
        />
      </div>
    </div>
  );
};

export default BroadcastDetails;
