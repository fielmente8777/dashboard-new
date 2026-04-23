import { Navigate, Outlet, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import handleLocalStorage from "../utils/handleLocalStorage";
import { useEffect } from "react";
import { getCookie, removeCookie } from "../utils/handleCookies";
import { useSelector } from "react-redux";
import { isExpired } from "../utils/isExpired";

const PLAN = {
  _id: "6995a0a2da382ec32cc83bd7",
  ndid: "5617a084-5783-4bac-b299-bdb6e8e471bb",
  planName: "PRO",
  status: "TRIAL",
  startDate: "2026-02-18T11:21:06.472Z",
  endDate: "2026-03-04T11:21:06.472Z",
  price: 1999,
  features: {
    modules: {
      corePlatform: true,
      aiLayer: false,
      advancedMarketing: true,
      enterpriseFeatures: false,
    },
    limits: {
      teamMembers: 10,
      aiCreditsMonthly: 1000,
      maxLeadsPerMonth: 50000,
    },
    support: "priority",
    price: 1999,
  },
  createdAt: "2026-02-18T11:21:06.482Z",
  updatedAt: "2026-02-18T11:21:06.482Z",
  __v: 0,
};

const isAuthenticated = () => {
  const isToken = getCookie("token");
  if (isToken) return true;
  return false;
};

export default function ProtectedRoute() {
  const { ndid } = useParams();
  const navigate = useNavigate();

  // const { user: hotel } = useSelector((state) => state.userProfile);
  // console.log("user", hotel);

  useEffect(() => {
    const hid = handleLocalStorage("hid");
    if (hid && ndid) {
      if (ndid !== String(handleLocalStorage("hid"))) {
        localStorage.clear();
        removeCookie("token");
        navigate("/login");
        return;
      }
    }
  }, [ndid]);
  return isAuthenticated() ? (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ) : (
    <Navigate to="/login" replace />
  );
}
