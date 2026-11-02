import { Bell, Menu, Store } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useMediaQuery from "../../hooks/useMediaQuery";
import { useBellRing } from "../Notifications/notificationAlert";
import { useUnreadNotificationTotal } from "../Notifications/useNotificationFeed";
import { open as openSidebar } from "../../redux/slice/SidebarToggle";
import { selectCurrentLocation } from "../../redux/slice/UserSlice";
import GlobalSearch from "../GlobalSearch/GlobalSearch";
import Greeting from "../Greeting";
import { PAGES, dashboardPath } from "../../routes/paths";
import NotificationPanel from "../Notifications/NotificationPanel";
import AppsPopup from "../Popup/AppsPopup";
import { onOpenEazStore } from "../Popup/eazStore";
import { useNotifications } from "./hooks/useNotifications";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import Icon from "../ui/Icon";

export const iconButtonClassName =
  "relative flex size-9 shrink-0 items-center justify-center rounded-lg text-app-text-muted transition-colors hover:bg-app-surface-secondary hover:text-app-text";

const Navbar = () => {
  const dispatch = useDispatch();
  const hotel = useSelector((state) => state.userProfile.user);
  const currentLocation = useSelector(selectCurrentLocation);
  const navigate = useNavigate();
  // phones get the full Notifications page instead of the slide-over panel
  const isPhone = useMediaQuery("(max-width: 639px)");
  useNotifications();
  // server notifications plus the website-visitor ones kept in this browser
  const unreadCount = useUnreadNotificationTotal();
  // changes on every new notification: rings the bell and pops the badge
  const ring = useBellRing();
  const [isAppsOpen, setIsAppsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const closeNotifications = useCallback(() => setIsNotificationsOpen(false), []);

  // the account menu and the sidebar open EazStore on phones
  useEffect(() => onOpenEazStore(() => setIsAppsOpen(true)), []);

  const openNotifications = () => {
    if (isPhone) navigate(dashboardPath(PAGES.NOTIFICATIONS));
    else setIsNotificationsOpen(true);
  };

  // undefined while the profile is loading, so the greeting shows a placeholder
  const greetingName = hotel?.Profile
    ? currentLocation?.local || hotel.Profile.hotelName || ""
    : undefined;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-app-border! bg-app-surface px-3 transition-colors duration-200 sm:gap-3 sm:px-5">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => dispatch(openSidebar())}
          className={`${iconButtonClassName} -ml-1 md:hidden`}
        >
          <Icon icon={Menu} size="xl" />
        </button>

        <div className="min-w-0 flex-1">
          <Greeting name={greetingName} />
        </div>

        {/* Phones keep search, notifications and the account menu here;
            EazStore and the theme move into the account menu and sidebar,
            so the hotel name has room. */}
        <div className="flex shrink-0 items-center justify-end gap-0.5 sm:gap-1.5">
          <div className="sm:w-56 lg:w-72">
            <GlobalSearch />
          </div>

          <ThemeToggle className="max-sm:hidden" />

          <button
            type="button"
            aria-label={
              unreadCount > 0
                ? `Notifications, ${unreadCount} new`
                : "Notifications"
            }
            title="Notifications"
            onClick={openNotifications}
            className={`${iconButtonClassName} bell-button ${ring ? "text-app-text" : ""}`}
          >
            {/* the key restarts the swing when another one arrives mid-ring */}
            <span key={ring} className={`bell-icon flex ${ring ? "bell-ring" : ""}`}>
              <Icon icon={Bell} size="lg" />
            </span>
            {ring > 0 && <span className="bell-pulse pointer-events-none absolute inset-1 rounded-full" aria-hidden="true" />}
            {unreadCount > 0 && (
              <span
                key={`badge-${ring}`}
                className="anim-pop absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ternary px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-app-surface">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            aria-label="EazStore"
            title="EazStore"
            onClick={() => setIsAppsOpen(true)}
            className="ml-1 flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-ternary px-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98] max-sm:hidden lg:px-3"
          >
            <Icon icon={Store} size="md" />
            <span className="hidden lg:inline">EazStore</span>
          </button>

          <div className="mx-1.5 hidden h-7 w-px bg-app-border sm:block" />

          <div className="ml-1 sm:ml-0">
            <UserMenu />
          </div>
        </div>
      </header>

      <AppsPopup open={isAppsOpen} setOpen={setIsAppsOpen} />
      <NotificationPanel open={isNotificationsOpen} onClose={closeNotifications} />
    </>
  );
};

export default Navbar;
