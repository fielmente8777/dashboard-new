import { Navigate, Outlet } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import handleLocalStorage from "../utils/handleLocalStorage";

const isAuthenticated = () => {
  const isToken = handleLocalStorage("token");

  console.log(isToken);

  if (isToken) return true;
  return false;
};

export default function ProtectedRoute() {
  return isAuthenticated() ? (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ) : (
    <Navigate to="/login" replace />
  );
}
