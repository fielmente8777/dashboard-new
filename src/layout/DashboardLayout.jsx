import BalanceAlertDialog from "../components/BalanceAlert/BalanceAlertDialog";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import SubscriptionLock from "../components/SubscriptionLock/SubscriptionLock";
import { useSubscriptionLock } from "../components/SubscriptionLock/useSubscriptionLock";

export default function DashboardLayout({ children }) {
  // an ended or paused subscription shows the renew screen in place of every page
  const lock = useSubscriptionLock();

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />

      <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden scrollbar-hidden bg-app-bg transition-colors duration-200">
        <div>
          <Navbar />
        </div>

        <div className="flex-1 h-full overflow-y-auto overflow-x-hidden scrollbar-hidden">
          {lock.locked ? <SubscriptionLock lock={lock} /> : children}
        </div>
      </div>

      {/* calling balance low / used up: once a day, only for admins and people who can call */}
      <BalanceAlertDialog />
    </div>
  );
}
