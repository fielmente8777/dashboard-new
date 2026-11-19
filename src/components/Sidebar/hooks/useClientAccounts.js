import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../../data/constant";
import useDebounce from "../../../hooks/useDebounce";
import { baseApi } from "../../../redux/api/baseApi";
import { setHid } from "../../../redux/slice/UserSlice";
import { ROUTES } from "../../../routes/paths";
import { getToken } from "../../../utils/session";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// Owner accounts only: the list of client accounts and switching into one.
export const useClientAccounts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOwner = useSelector(
    (state) => state.userProfile.authUser?.role === "owner",
  );

  // the account being shown: the owner's own, or the client switched into
  const accountName = useSelector(
    (state) => state.userProfile.user?.Profile?.hotelName,
  );
  const [clients, setClients] = useState([]);
  const [switchingTo, setSwitchingTo] = useState(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.toLowerCase(), 300);

  useEffect(() => {
    if (!isOwner) return;

    axios
      .get(`${BASE_URL}/admin/get-all-clients`, { headers: authHeaders() })
      .then(({ data }) => setClients(data?.data ?? []))
      .catch(() => setClients([]));
  }, [isOwner]);

  const filteredClients = useMemo(() => {
    if (!debouncedSearch) return clients;

    return clients.filter((client) => {
      const hotel = Object.values(client?.hotels || {})[0];
      return [
        client?.hotelName,
        hotel?.name,
        hotel?.city,
        hotel?.state,
        hotel?.country,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(debouncedSearch);
    });
  }, [clients, debouncedSearch]);

  const isCurrentClient = (client) =>
    Boolean(accountName) && client?.hotelName === accountName;

  const switchClient = async (client) => {
    if (switchingTo || isCurrentClient(client)) return;
    setSwitchingTo(client?.hotelName ?? null);

    const { ndid, hotels, hotelEmail } = client;
    const hid = Object.keys(hotels || {})[0];

    try {
      setSearch("");
      localStorage.removeItem("SheetId");
      localStorage.removeItem("SheetName");

      const { data } = await axios.post(
        `${BASE_URL}/admin/switch-account`,
        { Email: hotelEmail },
        { headers: authHeaders() },
      );

      if (data?.Status) {
        // the cookie keeps the owner's own sign-in (see utils/session.js)
        localStorage.setItem("token", data.Token);
        localStorage.setItem("ndid", ndid);
        if (hid) dispatch(setHid(hid));
        // nothing cached from the previous account may show in this one;
        // the route loader then loads the client's profile, plan and website
        dispatch(baseApi.util.resetApiState());
        navigate(ROUTES.ROOT);
      }
    } catch {
      // the list stays as it is; the owner can try again
    } finally {
      setSwitchingTo(null);
    }
  };

  return {
    isOwner,
    clients: filteredClients,
    isCurrentClient,
    switchingTo,
    search,
    setSearch,
    switchClient,
  };
};
