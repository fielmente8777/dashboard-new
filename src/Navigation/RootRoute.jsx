import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_PATH } from "../data/constant";
import { useEffect } from "react";

const RootRoute = () => {
  const navigate = useNavigate();
  const { hid } = useSelector((state) => state.userProfile);
  if (hid) return navigate(`${BASE_PATH}/${hid}`);
  return null;
};

export default RootRoute;
