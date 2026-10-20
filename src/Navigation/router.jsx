import { createBrowserRouter, redirect } from "react-router-dom";
import ProtectedRoute from "../Protected/ProtecRoute";
import { protectedLoader, sessionLoader } from "../Protected/protectedLoader";
import { dashboardRoutes } from "../routes/dashboardRoutes";
import { BASE_PATH, PAGES, ROUTES, dashboardPath } from "../routes/paths";
import RootLayout, { RootFallback, RouteError } from "./RootLayout";

const lazyDefault = (load) => async () => ({ Component: (await load()).default });

const router = createBrowserRouter([
  {
    Component: RootLayout,
    HydrateFallback: RootFallback,
    ErrorBoundary: RouteError,
    loader: sessionLoader,
    // after signing in the next page change starts the load
    shouldRevalidate: () => true,
    children: [
      // Public routes
      { path: ROUTES.LOGIN, lazy: lazyDefault(() => import("../pages/Login/Login")) },
      { path: ROUTES.SIGNUP, lazy: lazyDefault(() => import("../pages/Register/Signup")) },
      {
        path: ROUTES.RESET_PASSWORD,
        lazy: lazyDefault(() => import("../pages/Login/ResetPassword")),
      },
      {
        path: ROUTES.ONBOARDING_FORM,
        lazy: lazyDefault(() => import("../pages/Onboarding/OnboardingForm")),
      },
      { path: ROUTES.PLANS, lazy: lazyDefault(() => import("../pages/Plans/Plan")) },

      // Protected routes - "/" only forwards to the selected hotel (protectedLoader)
      {
        path: ROUTES.ROOT,
        Component: ProtectedRoute,
        loader: protectedLoader,
        shouldRevalidate: () => true,
        children: [{ index: true, Component: () => null }],
      },

      // Dashboard routes - the list lives in routes/dashboardRoutes.jsx
      {
        path: `${BASE_PATH}/:hid`,
        Component: ProtectedRoute,
        loader: protectedLoader,
        // check the session on every page change, not only when :hid changes
        shouldRevalidate: () => true,
        ErrorBoundary: RouteError,
        children: dashboardRoutes.map(({ path, lazy }) =>
          path === "" ? { index: true, lazy } : { path, lazy },
        ),
      },

      // where gian sends the user back after connecting Gmail (?gmail=...)
      {
        path: "/integrations",
        loader: ({ request }) =>
          redirect(
            dashboardPath(PAGES.INTEGRATION, { query: new URL(request.url).search.slice(1) }),
          ),
      },

      { path: "*", loader: () => redirect(ROUTES.ROOT) },
    ],
  },
]);

export default router;
