import axios from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DataContext from "../../../context/DataContext";
import { BASE_URL } from "../../../data/constant";
import useDebounce from "../../../hooks/useDebounce";
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
  const { setLeads } = useContext(DataContext);
  const isOwner = useSelector(
    (state) => state.userProfile.authUser?.role === "owner",
  );

  const [clients, setClients] = useState([]);
  const [currentClient, setCurrentClient] = useState(null);
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

  const switchClient = async (client) => {
    if (currentClient?.hotelName === client?.hotelName) return;
    setCurrentClient(client);

    const { ndid, hotels, hotelEmail } = client;
    const hid = Object.keys(hotels || {})[0];

    try {
      setLeads([]);
      setSearch("");
      localStorage.removeItem("SheetId");
      localStorage.removeItem("SheetName");

      const { data } = await axios.post(
        `${BASE_URL}/admin/switch-account`,
        { Email: hotelEmail },
        { headers: authHeaders() },
      );

      if (data?.Status) {
        localStorage.setItem("token", data.Token);
        localStorage.setItem("ndid", ndid);
        dispatch(setHid(hid));
      }
    } catch {
      // the list stays as it is; the owner can try again
    }

    setTimeout(() => navigate(ROUTES.ROOT), 1000);
  };

  return {
    isOwner,
    clients: filteredClients,
    currentClient,
    search,
    setSearch,
    switchClient,
  };
};
