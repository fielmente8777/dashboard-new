import { Navigate, Route, Routes } from "react-router-dom";
import { SidebarData } from "../data/SideBarData";
import DynamicPage from "../pages/DynamicPage/DynamicPage";
import Dashboard from "../pages/Home/Dashboard";
import Login from "../pages/Login/Login";
import ProtectedRoute from "../Protected/ProtecRoute";
import { BASE_PATH } from "../data/constant";

const Navigation = () => {
  const dashboardRootPath = "/dashboard/client";
  return (
    <Routes>
      {/* Public */}

      {/* navigate to dashboard client  */}
      <Route path="/" element={<Navigate to={BASE_PATH} replace />} />

      {/* Route for auth */}
      <Route path="/login" element={<Login />} />

      {/* Route for /dashboard/client */}
      <Route path={dashboardRootPath} element={<ProtectedRoute />}>
        <Route path="" element={<Dashboard />} />

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
