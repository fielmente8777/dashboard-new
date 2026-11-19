import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectHid } from "../../redux/slice/UserSlice";
import { presetRange } from "../../utils/datePresets";

// Window events that other dashboard widgets (Search Console, the home
// page) also listen to, so the names must stay as they are.
const DATE_EVENT = "dashboard_date_changed";
const PROPERTY_EVENT = "dashboard_property_changed";

// The date range is shared by every analytics widget on the page. It lives
// outside React so a widget that mounts later starts on the range already
// picked instead of its own default. Shape: { start, end, preset, label }
// with "YYYY-MM-DD" dates (Google Analytics accepts them as they are).
let currentRange = presetRange("last7");

export const setAnalyticsRange = (range) => {
  currentRange = range;
  window.dispatchEvent(new CustomEvent(DATE_EVENT, { detail: range }));
};

// Tells the listeners outside this folder which range is showing.
export const announceAnalyticsRange = () => setAnalyticsRange(currentRange);

export const announcePropertyChange = (propertyId) => {
  localStorage.setItem("activePropertyId", propertyId);
  window.dispatchEvent(
    new CustomEvent(PROPERTY_EVENT, { detail: { property_id: propertyId } }),
  );
};

export const useAnalyticsRange = () => {
  const [range, setRange] = useState(currentRange);

  useEffect(() => {
    const onChange = (e) => setRange(e.detail);
    window.addEventListener(DATE_EVENT, onChange);
    return () => window.removeEventListener(DATE_EVENT, onChange);
  }, []);

  return range;
};

// Runs one of the analyticsApi report queries for the selected hotel and the
// shared date range:  const report = useAnalyticsReport(useGetTopPagesQuery);
export const useAnalyticsReport = (useReportQuery) => {
  const hid = useSelector(selectHid);
  const { start, end } = useAnalyticsRange();

  return useReportQuery({ hid, range: { start, end } }, { skip: !hid });
};
