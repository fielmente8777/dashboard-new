import { Navigate, Route, Routes } from "react-router-dom";
import { BASE_PATH } from "../data/constant";
import { SidebarData } from "../data/SideBarData";
import DynamicPage from "../pages/DynamicPage/DynamicPage";
import Dashboard from "../pages/Home/Dashboard";
import Login from "../pages/Login/Login";
import ProtectedRoute from "../Protected/ProtecRoute";
import RootRoute from "./RootRoute";
import Whatsapp from "../components/Contacts/WhtasApp";

const Navigation = () => {
  const dashboardRootPath = "/dashboard/client";

  return (
    <Routes>
      {/* Public */}
      {/* navigate to dashboard client  */}
      <Route path="/" element={<ProtectedRoute />} replace>
        <Route index element={<RootRoute />} />
      </Route>
      {/* Route for auth */}
      <Route path="/login" element={<Login />} />
      {/* Route for /dashboard/client */}
      <Route path={`${dashboardRootPath}/:ndid/*`} element={<ProtectedRoute />}>
        <Route index element={<Dashboard />} />

        {SidebarData?.map((data, index) => {
          if (!data?.subLinks)
            return (
              <Route key={index} path={data?.link} element={<DynamicPage />} />
            );

          return data?.subLinks?.map((subLinks) => {
            return (
              <Route
                key={index}
                path={subLinks?.link}
                element={<DynamicPage />}
              />
            );
          });
        })}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default Navigation;
