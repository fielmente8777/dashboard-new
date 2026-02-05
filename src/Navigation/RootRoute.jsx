import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_PATH } from "../data/constant";
import { useEffect } from "react";
import handleLocalStorage from "../utils/handleLocalStorage";

const RootRoute = () => {
  const navigate = useNavigate();
  const { hid } = useSelector((state) => state.userProfile);

  useEffect(() => {
    const HID = handleLocalStorage("hid");
    // if (HID) return navigate(`${BASE_PATH}/${HID}`);
  }, [hid]);
  return null;
};

export default RootRoute;
