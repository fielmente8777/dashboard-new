import { ROUTES } from "../routes/paths";
import { Navigate, Outlet } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import { useSelector } from "react-redux";
import { selectNeedsOnboarding } from "../redux/slice/UserSlice";

// The session itself is checked by protectedLoader before this renders.
export default function ProtectedRoute() {
  const needsOnboarding = useSelector(selectNeedsOnboarding);

  // A new account has no hotel yet: send it to onboarding first.
  // (Known only once the profile has loaded, so this stays in the component.)
  if (needsOnboarding) {
    return <Navigate to={ROUTES.ONBOARDING_FORM} replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
