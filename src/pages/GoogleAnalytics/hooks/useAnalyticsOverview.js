import { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  announceAnalyticsRange,
  announcePropertyChange,
  useAnalyticsRange,
} from "../../../components/Analytics/analyticsRange";
import { useApiAction } from "../../../hooks/useApiAction";
import {
  useGetAnalyticsOverviewQuery,
  useGetAnalyticsPropertiesQuery,
  useSaveAnalyticsPropertyMutation,
} from "../../../redux/api/analyticsApi";
import { selectHid } from "../../../redux/slice/UserSlice";
import { previousRange } from "../analyticsUtils";

// Only this account manages more than one Google Analytics property.
const PROPERTY_SWITCHER_EMAIL = "abhijeet@eazotel.com";

// The overview report for the picked range and for the period just before
// it (for the "vs previous period" changes), plus the property switcher.
export const useAnalyticsOverview = () => {
  const run = useApiAction();
  const hid = useSelector(selectHid);
  const hotelEmail = useSelector((state) => state.userProfile.user?.Profile?.hotelEmail);
  const range = useAnalyticsRange();

  const current = useGetAnalyticsOverviewQuery(
    { hid, range: { start: range.start, end: range.end } },
    { skip: !hid },
  );
  const previous = useGetAnalyticsOverviewQuery(
    { hid, range: previousRange(range) },
    { skip: !hid || !range.start },
  );

  const { chartData = [], activePropertyId, email, error } = current.data || {};

  const canSwitchProperty = hotelEmail === PROPERTY_SWITCHER_EMAIL;
  const properties = useGetAnalyticsPropertiesQuery(email, {
    skip: !email || !canSwitchProperty,
  });
  const [saveProperty, { isLoading: switching }] = useSaveAnalyticsPropertyMutation();

  // widgets outside this page start on their own default range
  useEffect(announceAnalyticsRange, []);

  // the Search Console widgets read the active property from localStorage
  useEffect(() => {
    if (activePropertyId && activePropertyId !== localStorage.getItem("activePropertyId")) {
      announcePropertyChange(activePropertyId);
    }
  }, [activePropertyId]);

  const switchProperty = async (propertyId) => {
    const saved = await run(
      saveProperty({ hid, email, property_id: propertyId }),
      { error: "Failed to switch property." },
    );
    if (saved) announcePropertyChange(propertyId);
  };

  return {
    range,
    rows: chartData,
    previousRows: previous.data?.chartData || [],
    email,
    activePropertyId,
    properties: properties.data || [],
    isLoading: current.isLoading || current.isUninitialized,
    isFetching: current.isFetching || switching,
    notConnected: current.isError || Boolean(error),
    error,
    // a query that never started (no hotel yet) can't be refetched
    refetch: () => {
      if (!current.isUninitialized) current.refetch();
      if (!previous.isUninitialized) previous.refetch();
    },
    switchProperty,
    switching,
  };
};
