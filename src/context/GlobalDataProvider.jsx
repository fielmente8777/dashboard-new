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

const GlobalDataProvider = () => {
  const dispatch = useDispatch();
  const token = getCookie("token");
  const hid = handleLocalStorage("hid");
  const { user: hotel, authUser } = useSelector((state) => state.userProfile);

  useEffect(() => {
    if (token) {
      dispatch(fetchWebsiteData(token, hid));
      dispatch(fetchAuthUserProfile(token));
      dispatch(fetchUserProfile(token));
    }
  }, [token, hid]);

  useEffect(() => {
    if (hotel?.Data?.ndid) {
      localStorage.setItem("ndid", hotel.Data.ndid);
    }

    if (hotel?.Profile?.hotels) {
      const hotelKeys = Object.keys(hotel.Profile.hotels);
      if (authUser?.isAdmin) {
        if (hotelKeys.length > 0) {
          if (!handleLocalStorage("hid")) {
            dispatch(setHid(hotelKeys[0]));
          }
        }
      } else {
        dispatch(setHid(authUser?.assigned_location[0]?.hid));
      }
    }
  }, [dispatch, hotel]);

  return null;
};

export default GlobalDataProvider;
