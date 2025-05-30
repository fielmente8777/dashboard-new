import { Navigate, Outlet, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import handleLocalStorage from "../utils/handleLocalStorage";
import { useEffect } from "react";
import { getCookie } from "../utils/handleCookies";

const isAuthenticated = () => {
  const isToken = getCookie("token");
  if (isToken) return true;
  return false;
};

export default function ProtectedRoute() {
  const hid = handleLocalStorage("hid");
  const { ndid } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (hid) {
      if (ndid !== String(handleLocalStorage("hid"))) navigate("/login");
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
