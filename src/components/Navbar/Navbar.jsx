import { Bell, Menu, Settings, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { LOGO_URL } from "../../config/assets";
import { open as openSidebar } from "../../redux/slice/SidebarToggle";
import {
  fetchUserProfile,
  selectCurrentLocation,
} from "../../redux/slice/UserSlice";
import { PAGES, dashboardPath } from "../../routes/paths";
import { getToken } from "../../utils/session";
import GlobalSearch from "../GlobalSearch/GlobalSearch";
import Greeting from "../Greeting";
import AppsPopup from "../Popup/AppsPopup";
import NotificationPopup from "../Popup/NotificationPopup";
import { useNotifications } from "./hooks/useNotifications";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import Icon from "../ui/Icon";

const iconButtonClassName =
  "relative flex size-9 shrink-0 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white";

const Navbar = () => {
  const dispatch = useDispatch();
  const hotel = useSelector((state) => state.userProfile.user);
  const currentLocation = useSelector(selectCurrentLocation);
  const { notifications, unreadCount, markAllSeen } = useNotifications();
  const [isAppsOpen, setIsAppsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const token = getToken();

  useEffect(() => {
    if (token) dispatch(fetchUserProfile(token));
  }, [dispatch, token]);

  const toggleNotifications = (isOpen) => {
    markAllSeen();
    setIsNotificationsOpen(isOpen);
  };

  // undefined while the profile is loading, so the greeting shows a placeholder
  const greetingName = hotel?.Profile
    ? currentLocation?.local || hotel.Profile.hotelName || ""
    : undefined;

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10! bg-primary px-3 transition-colors duration-200 sm:gap-3 sm:px-4 dark:bg-app-navbar">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => dispatch(openSidebar())}
          className={`${iconButtonClassName} md:hidden`}
        >
          <Icon icon={Menu} size="xl" />
        </button>

        <img
          src={LOGO_URL}
          alt="Eazotel"
          className="h-7 w-auto shrink-0 object-contain md:hidden"
        />

        <Greeting name={greetingName} />

        <div className="ml-auto flex min-w-0 items-center justify-end gap-1 sm:flex-1 sm:gap-2">
          <div className="min-w-0 sm:max-w-md sm:flex-1">
            <GlobalSearch />
          </div>

          <ThemeToggle />

          <button
            type="button"
            aria-label={
              unreadCount > 0
                ? `Notifications, ${unreadCount} new`
                : "Notifications"
            }
            onClick={() => toggleNotifications(true)}
            className={`${iconButtonClassName} max-sm:hidden`}
          >
            <Icon icon={Bell} size="xl" />
            {unreadCount > 0 && (
              <span className="anim-pop absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ternary px-1 text-[10px] font-semibold leading-none text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <Link
            to={dashboardPath(PAGES.SETTINGS)}
            aria-label="Settings"
            title="Settings"
            className={`${iconButtonClassName} max-sm:hidden`}
          >
            <Icon icon={Settings} size="xl" />
          </Link>

          <button
            type="button"
            aria-label="EazStore"
            onClick={() => setIsAppsOpen(true)}
            className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-ternary px-2.5 text-sm font-semibold text-white transition hover:bg-ternary/90 active:scale-95 lg:px-3.5"
          >
            <Icon icon={Store} size="lg" />
            <span className="hidden lg:inline">EazStore</span>
          </button>

          <div className="mx-1 hidden h-6 w-px bg-white/15 sm:block" />

          <UserMenu />
        </div>
      </header>

      <AppsPopup open={isAppsOpen} setOpen={setIsAppsOpen} />
      <NotificationPopup
        isOpen={isNotificationsOpen}
        onClose={() => toggleNotifications(false)}
        data={notifications}
      />
    </>
  );
};

export default Navbar;
