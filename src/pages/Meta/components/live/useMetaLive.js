import { useGetMetaLiveQuery, useLazyGetMetaLiveQuery } from "../../../../redux/api/metaReportApi";

// The live Meta snapshot for a property and dates, plus a Refresh that asks gian to read
// Meta again (gian ignores it when its copy is under 2 minutes old).
const useMetaLive = ({ hid, since, until, skip = false }) => {
  const args = { hid, since, until };
  const query = useGetMetaLiveQuery(args, { skip: skip || !hid || !since || !until });
  const [trigger, refreshing] = useLazyGetMetaLiveQuery();
  return {
    ...query,
    isRefreshing: refreshing.isFetching,
    refresh: () => trigger({ ...args, refresh: true }),
  };
};

export default useMetaLive;
