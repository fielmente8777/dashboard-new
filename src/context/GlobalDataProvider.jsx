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
import { BASE_PATH } from "../data/constant";

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

  useEffect(() => {
    if (token) {
      dispatch(fetchAuthUserProfile(token));
      dispatch(fetchUserProfile(token));
      dispatch(fetchWebsiteData(token, HID));
      if (hid) navigate(`${BASE_PATH}/${handleLocalStorage("hid")}`);
    }
  }, [token]);

  useEffect(() => {
    if (hotel?.Data?.ndid) {
      localStorage.setItem("ndid", hotel.Data.ndid);
    }

    if (hotel?.Profile?.hotels) {
      const hotelKeys = Object.keys(hotel.Profile.hotels);
      if (authUser?.isAdmin) {
        if (hotelKeys.length > 0) {
          dispatch(setHid(hotelKeys[0]));
        }
      } else {
        dispatch(setHid(authUser?.assigned_location[0]?.hid));
      }
    }
  }, [hotel]);

  useEffect(() => {
    if (hid) navigate(`${BASE_PATH}/${handleLocalStorage("hid")}`);
  }, [hid]);

  return null;
};

export default GlobalDataProvider;
