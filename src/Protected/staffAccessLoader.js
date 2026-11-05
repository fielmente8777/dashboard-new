import { redirect } from "react-router-dom";
import { baseApi } from "../redux/api/baseApi";
import store from "../redux/Store";
import { setHid } from "../redux/slice/UserSlice";
import { ROUTES } from "../routes/paths";
import { clearSession, setSession } from "../utils/session";

// Where the Eazotel admin console sends a staff member who clicked "Open account":
//   /staff-access#token=...&ndid=...&hid=...
// The admin console has already checked who they are, their permission and the hotels
// they look after, and logged the opening. The token is the hotel's own, lasts one hour
// and cannot be refreshed. It travels in the # part, which the browser never sends to
// any server, and is removed from the address bar before anything else loads.
export const staffAccessLoader = () => {
  const params = new URLSearchParams(window.location.hash.slice(1));
  window.history.replaceState(null, "", window.location.pathname);

  const token = params.get("token");
  if (!token) throw redirect(ROUTES.LOGIN);

  // nothing from an account opened earlier in this browser may show in this one
  clearSession();
  store.dispatch(baseApi.util.resetApiState());
  setSession(token);

  const ndid = params.get("ndid");
  const hid = params.get("hid");
  if (ndid) localStorage.setItem("ndid", ndid);
  if (hid) {
    localStorage.setItem("hid", hid);
    store.dispatch(setHid(hid));
  }
  throw redirect(ROUTES.ROOT);
};
