import { useMemo } from "react";
import { useSelector } from "react-redux";
import { SidebarData } from "../../../data/SideBarData";
import { accessScopeMap } from "../../../pages/UserMgmt/userAccess";
import { selectHid } from "../../../redux/slice/UserSlice";

// The sidebar entries the signed-in user is allowed to see.
// Admins see every entry (sub-links follow the subscription's app access);
// team members only see what is enabled for them at the selected location.
export const useSidebarItems = () => {
  const authUser = useSelector((state) => state.userProfile.authUser);
  const subscription = useSelector((state) => state.subscription?.subscription);
  const hid = useSelector(selectHid);

  return useMemo(() => {
    const isAdmin = Boolean(authUser?.isAdmin);
    const locationScope = authUser?.assigned_location?.find(
      (location) => location?.hid === String(hid),
    )?.accessScope;

    const canSeeItem = (item) => {
      if (isAdmin || !item.key || !locationScope) return true;
      return Boolean(locationScope[accessScopeMap[item.key]]);
    };

    const canSeeSubLink = (subLink) => {
      if (!subLink.key) return true;
      if (isAdmin) {
        const appAccess = subscription?.appAccess;
        return !appAccess || Boolean(appAccess[accessScopeMap[subLink.key]]);
      }
      return Boolean(locationScope?.[accessScopeMap[subLink.key]]);
    };

    return SidebarData.filter(canSeeItem)
      .map((item) =>
        item.subLinks
          ? { ...item, subLinks: item.subLinks.filter(canSeeSubLink) }
          : item,
      )
      .filter((item) => !item.subLinks || item.subLinks.length > 0);
  }, [authUser, subscription, hid]);
};
