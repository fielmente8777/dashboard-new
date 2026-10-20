import { redirect } from "react-router-dom";
import store from "../redux/Store";
import { loadSession, loadWebsiteData } from "../redux/session";
import { selectNeedsOnboarding, setHid } from "../redux/slice/UserSlice";
import { PAGES, ROUTES, dashboardPath } from "../routes/paths";
import handleLocalStorage from "../utils/handleLocalStorage";
import { getCookie, removeCookie } from "../utils/handleCookies";
import { getAccountToken } from "../utils/session";
import { isExpired } from "../utils/isExpired";
import { resolveHid } from "../utils/resolveLocation";

// the plan is checked when a hotel is (re)selected, not on every page change,
// so paying on the plans page lets the user straight back in
let planCheckedFor = null;

// Runs before a protected page renders: a signed-out user never sees it, and
// the page opens with the account and the selected hotel already known.
export const protectedLoader = async ({ request, params }) => {
  const token = getCookie("token");
  if (!token) throw redirect(ROUTES.LOGIN);

  // The URL belongs to another hotel than the one this session selected.
  const storedHid = handleLocalStorage("hid");
  if (storedHid && params.hid && params.hid !== String(storedHid)) {
    localStorage.clear();
    removeCookie("token");
    throw redirect(ROUTES.LOGIN);
  }

  // waits only the first time; afterwards the answers come from the cache
  await store.dispatch(loadSession());
  const state = store.getState();
  const { user, authUser, hid } = state.userProfile;

  // A new account has no hotel yet: send it to onboarding first.
  if (selectNeedsOnboarding(state)) throw redirect(ROUTES.ONBOARDING_FORM);

  if (user?.Data?.ndid) localStorage.setItem("ndid", user.Data.ndid);

  // keep the location selected last time, or fall back to the default one
  const nextHid =
    user?.Profile?.hotels && authUser
      ? resolveHid({
          hotels: user.Profile.hotels,
          authUser,
          storedHid: localStorage.getItem("hid"),
        })
      : null;
  if (nextHid && nextHid !== hid) store.dispatch(setHid(nextHid));
  const currentHid = nextHid ?? hid;

  // per account: an owner switching into a client checks that client's plan
  const planKey = `${getAccountToken()}:${currentHid}`;
  if (planKey !== planCheckedFor) {
    planCheckedFor = planKey;
    const endDate = user?.SubscriptionDetails?.endDate;
    if (endDate && isExpired(endDate)) throw redirect(ROUTES.PLANS);
  }

  store.dispatch(loadWebsiteData(currentHid));

  // "/" has no page of its own, and another location's url is not this
  // session's: open the selected location's dashboard
  const atRoot = new URL(request.url).pathname === ROUTES.ROOT;
  if (currentHid && (atRoot || (params.hid && params.hid !== currentHid))) {
    throw redirect(dashboardPath(PAGES.HOME, { hid: currentHid }));
  }
  return null;
};

// Every route: start loading the account in the background as soon as there
// is a token (the public pages, e.g. onboarding and plans, read it too).
export const sessionLoader = () => {
  store.dispatch(loadSession());
  return null;
};
