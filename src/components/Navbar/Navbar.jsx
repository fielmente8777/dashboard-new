import { Bell, Menu, Store } from "lucide-react";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useMediaQuery from "../../hooks/useMediaQuery";
import { selectUnreadCount } from "../../redux/slice/notificationsSlice";
import { open as openSidebar } from "../../redux/slice/SidebarToggle";
import { selectCurrentLocation } from "../../redux/slice/UserSlice";
import GlobalSearch from "../GlobalSearch/GlobalSearch";
import Greeting from "../Greeting";
import { PAGES, dashboardPath } from "../../routes/paths";
import NotificationPanel from "../Notifications/NotificationPanel";
import AppsPopup from "../Popup/AppsPopup";
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
  const unreadCount = useSelector(selectUnreadCount);
  const [isAppsOpen, setIsAppsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const closeNotifications = useCallback(() => setIsNotificationsOpen(false), []);

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

        <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-1.5">
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
            className={iconButtonClassName}
          >
            <Icon icon={Bell} size="lg" />
            {unreadCount > 0 && (
              <span className="anim-pop absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ternary px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-app-surface">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            aria-label="EazStore"
            title="EazStore"
            onClick={() => setIsAppsOpen(true)}
            className="ml-1 flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-ternary px-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98] lg:px-3"
          >
            <Icon icon={Store} size="md" />
            <span className="hidden lg:inline">EazStore</span>
          </button>

          <div className="mx-1.5 hidden h-7 w-px bg-app-border sm:block" />

          <UserMenu />
        </div>
      </header>

      <AppsPopup open={isAppsOpen} setOpen={setIsAppsOpen} />
      <NotificationPanel open={isNotificationsOpen} onClose={closeNotifications} />
    </>
  );
};

export default Navbar;
