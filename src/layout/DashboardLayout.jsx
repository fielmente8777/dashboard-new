import { useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import BalanceAlertDialog from "../components/BalanceAlert/BalanceAlertDialog";
import FeatureLock from "../components/SubscriptionLock/FeatureLock";
import { appForPath, hasApp } from "../config/entitlements";
import { BASE_PATH, PAGES } from "../routes/paths";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import SubscriptionLock from "../components/SubscriptionLock/SubscriptionLock";
import { useSubscriptionLock } from "../components/SubscriptionLock/useSubscriptionLock";

export default function DashboardLayout({ children }) {
  // an ended or paused subscription shows the renew screen in place of every page
  const lock = useSubscriptionLock();
  // a page whose app the plan doesn't include shows "add it to your plan" instead
  const subscription = useSelector((state) => state.subscription?.subscription);
  const { hid } = useParams();
  const { pathname } = useLocation();
  const page = pathname.replace(`${BASE_PATH}/${hid}`, "").replace(/^\/+|\/+$/g, "");
  const app = appForPath(page);
  // the way out of a lock: the plans page always opens
  const onPlans = page === PAGES.PLANS;
  const missingApp = app && !hasApp(subscription, app) ? app : null;

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />

      <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden scrollbar-hidden bg-app-bg transition-colors duration-200">
        <div>
          <Navbar />
        </div>

        <div className="flex-1 h-full overflow-y-auto overflow-x-hidden scrollbar-hidden">
          {lock.locked && !onPlans ? (
            <SubscriptionLock lock={lock} />
          ) : missingApp ? (
            <FeatureLock app={missingApp} />
          ) : (
            children
          )}
        </div>
      </div>

      {/* calling balance low / used up: once a day, only for admins and people who can call */}
      <BalanceAlertDialog />
    </div>
  );
}
