import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  selectAvailableLocations,
  selectCurrentLocation,
  selectHid,
  setHid,
} from "../redux/slice/UserSlice";
import { fetchWebsiteData } from "../redux/slice/websiteDataSlice";
import { dashboardPath } from "../routes/paths";
import { getToken } from "../utils/session";

// Everything a component needs to show and change the selected hotel location.
// The selection lives in the Redux store (userProfile.hid) and is saved in
// localStorage, so it is still selected the next time the browser is opened.
export const useLocationSwitcher = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const hid = useSelector(selectHid);
  const locations = useSelector(selectAvailableLocations);
  const currentLocation = useSelector(selectCurrentLocation);

  const switchLocation = (nextHid) => {
    if (!nextHid || String(nextHid) === String(hid)) return;

    dispatch(setHid(String(nextHid)));
    dispatch(fetchWebsiteData(getToken(), nextHid));

    // stay on the same page, in the newly selected hotel
    const page = pathname.split("/").filter(Boolean).slice(3).join("/");
    navigate(dashboardPath(page, { hid: nextHid }));
  };

  return { hid, locations, currentLocation, switchLocation };
};
