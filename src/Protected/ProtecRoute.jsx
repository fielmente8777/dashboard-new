import { Navigate, Outlet, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import handleLocalStorage from "../utils/handleLocalStorage";
import { useEffect } from "react";
import { getCookie, removeCookie } from "../utils/handleCookies";

const isAuthenticated = () => {
  const isToken = getCookie("token");
  if (isToken) return true;
  return false;
};

export default function ProtectedRoute() {
  const { ndid } = useParams();
  const navigate = useNavigate();

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
