import { useMemo, useState } from "react";
import useDebounce from "../../../hooks/useDebounce";
import { useGetCampaignDetailsQuery } from "../../../redux/api/broadcastApi";
import { RECIPIENT_STATUS } from "../broadcastUtils";

const PAGE_SIZE = 20;

// One campaign plus a filtered, paged page of its recipients. The filter
// and search go to the server; changing either goes back to page 1.
export const useCampaignDetails = (id) => {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search.trim(), 400);

  const query = useGetCampaignDetailsQuery(
    {
      id,
      page,
      limit: PAGE_SIZE,
      status: status === "all" ? undefined : status,
      search: debouncedSearch || undefined,
    },
    { skip: !id },
  );

  // the campaign itself doesn't change with the filters: keep the last one
  // while a new page loads
  const { campaign, recipients = [], total = 0 } = query.currentData || {};
  const lastCampaign = query.data?.campaign;

  // tab counts come from the campaign totals, not the current page
  const tabs = useMemo(() => {
    const c = lastCampaign || {};
    const counts = {
      sent: c.sentCount,
      delivered: c.deliveredCount,
      read: c.readCount,
      failed: c.failedCount,
    };
    return [
      { value: "all", label: "All", count: c.totalRecipients },
      ...["sent", "delivered", "read", "failed"].map((value) => ({
          value,
          label: RECIPIENT_STATUS[value].label,
          count: counts[value],
        })),
    ];
  }, [lastCampaign]);

  return {
    campaign: campaign || lastCampaign,
    recipients,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
    page,
    setPage,
    status,
    setStatus: (value) => {
      setStatus(value);
      setPage(1);
    },
    search,
    setSearch: (value) => {
      setSearch(value);
      setPage(1);
    },
    tabs,
    loading: query.isLoading,
    tableLoading: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};
