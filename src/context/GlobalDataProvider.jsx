import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAuthUserProfile,
  fetchUserProfile,
  setHid,
} from "../redux/slice/UserSlice";
import { fetchWebsiteData } from "../redux/slice/websiteDataSlice";
import handleLocalStorage from "../utils/handleLocalStorage";
import { getCookie } from "../utils/handleCookies";
import { useNavigate } from "react-router-dom";
import {
  PAGES,
  ROUTES,
  dashboardPath,
  isInsideDashboard,
} from "../routes/paths";
import { isExpired } from "../utils/isExpired";
import { fetchSubscriptionData } from "../redux/slice/subscriptionDataSlice";
import { resolveHid } from "../utils/resolveLocation";

const GlobalDataProvider = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = getCookie("token");
  const HID = handleLocalStorage("hid");
  const {
    user: hotel,
    hid,
    authUser,
  } = useSelector((state) => state.userProfile);

  // console.log("aaya");

  useEffect(() => {
    if (token) {
      dispatch(fetchWebsiteData(token, HID));
      dispatch(fetchUserProfile(token));
      dispatch(fetchAuthUserProfile(token));
      dispatch(fetchSubscriptionData(token));
      // if (hid) navigate(`${BASE_PATH}/${handleLocalStorage("hid")}`);
    }
  }, [token]);

  useEffect(() => {
    if (hotel?.Data?.ndid) {
      localStorage.setItem("ndid", hotel.Data.ndid);
    }

    // Wait for both the hotel profile and the signed-in user, then keep the
    // location selected last time (or fall back to the default one).
    if (hotel?.Profile?.hotels && authUser) {
      const nextHid = resolveHid({
        hotels: hotel.Profile.hotels,
        authUser,
        storedHid: localStorage.getItem("hid"),
      });
      if (nextHid) dispatch(setHid(nextHid));
    }
  }, [hotel, authUser, dispatch]);

  useEffect(() => {
    if (hotel?.SubscriptionDetails?.endDate) {
      const isExpire = isExpired(hotel?.SubscriptionDetails?.endDate);
      if (isExpire) {
        return navigate(ROUTES.PLANS);
      }
    }
    // Already on a page of this hotel (refresh, deep link, or a location switch
    // that navigated in the same click): stay there. The address bar is read
    // directly because the router has not re-rendered yet at this point.
    const currentHid = handleLocalStorage("hid");
    if (hid && !isInsideDashboard(window.location.pathname, currentHid)) {
      navigate(dashboardPath(PAGES.HOME, { hid: currentHid }));
    }
  }, [hid]);

  return null;
};

export default GlobalDataProvider;
