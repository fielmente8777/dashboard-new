import { Navigate, Route, Routes } from "react-router-dom";
import OnboardingForm from "../pages/Onboarding/OnboardingFrom";
import Login from "../pages/Login/Login";
import Plan from "../pages/Plans/Plan";
import Signup from "../pages/Register/Signup";
import ProtectedRoute from "../Protected/ProtecRoute";
import { dashboardRoutes } from "../routes/dashboardRoutes";
import { BASE_PATH, ROUTES } from "../routes/paths";
import RootRoute from "./RootRoute";

const Navigation = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.SIGNUP} element={<Signup />} />
      <Route path={ROUTES.ONBOARDING_FORM} element={<OnboardingForm />} />
      <Route path={ROUTES.PLANS} element={<Plan />} />

      {/* Protected Routes */}
      <Route path={ROUTES.ROOT} element={<ProtectedRoute />}>
        <Route index element={<RootRoute />} />
      </Route>

      {/* Dashboard Routes - the list lives in routes/dashboardRoutes.jsx */}
      <Route path={`${BASE_PATH}/:ndid`} element={<ProtectedRoute />}>
        {dashboardRoutes.map(({ path, element }) =>
          path === "" ? (
            <Route key="index" index element={element} />
          ) : (
            <Route key={path} path={path} element={element} />
          ),
        )}
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.ROOT} replace />} />
    </Routes>
  );
};

export default Navigation;
