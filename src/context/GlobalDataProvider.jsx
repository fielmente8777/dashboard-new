import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, setHid } from "../redux/slice/UserSlice";
import handleLocalStorage from "../utils/handleLocalStorage";
import {
  fetchCurrentLocationWebsiteData,
  fetchWebsiteData,
} from "../redux/slice/websiteDataSlice";

const GlobalDataProvider = () => {
  const dispatch = useDispatch();
  const token = handleLocalStorage("token");
  const hid = handleLocalStorage("hid");
  const { user: hotel } = useSelector((state) => state.userProfile);

  useEffect(() => {
    if (token) {
      dispatch(fetchUserProfile(token));
      dispatch(fetchWebsiteData(token, hid));
    }
  }, [token, hid]);

  useEffect(() => {
    if (hotel?.Data?.ndid) {
      localStorage.setItem("ndid", hotel.Data.ndid);
    }

    if (hotel?.Profile?.hotels) {
      const hotelKeys = Object.keys(hotel.Profile.hotels);
      if (hotelKeys.length > 0) {
        if (!handleLocalStorage("hid")) {
          dispatch(setHid(hotelKeys[0]));
        }
      }
    }
  }, [dispatch, hotel]);

  return null;
};

export default GlobalDataProvider;
