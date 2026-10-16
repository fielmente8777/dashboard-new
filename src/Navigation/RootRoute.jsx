import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectHid } from "../redux/slice/UserSlice";
import { PAGES, dashboardPath } from "../routes/paths";

// "/" has no page of its own: forward to the dashboard of the selected hotel
// as soon as one is known.
const RootRoute = () => {
  const navigate = useNavigate();
  const hid = useSelector(selectHid);

  useEffect(() => {
    if (hid) navigate(dashboardPath(PAGES.HOME, { hid }), { replace: true });
  }, [hid, navigate]);

  return null;
};

export default RootRoute;
