import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectHid } from "../redux/slice/UserSlice";

// The hotel location (hid) and account (ndid) the Node APIs are scoped to.
// Either is null until the profile has loaded: skip queries until
// hasTenant(tenant) is true.
export const hasTenant = (tenant) => Boolean(tenant.hid && tenant.ndid);

export const useTenant = () => {
  const hid = useSelector(selectHid);
  const ndid =
    useSelector((state) => state.userProfile.user?.Data?.ndid) ||
    localStorage.getItem("ndid");

  return useMemo(
    () => ({ hid: hid ? String(hid) : null, ndid: ndid || null }),
    [hid, ndid],
  );
};
