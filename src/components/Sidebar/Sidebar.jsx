import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { LOGO_URL } from "../../config/assets";
import { useToast } from "../../context/ToastContext";
import useMediaQuery, {
  DESKTOP_QUERY,
  MOBILE_QUERY,
} from "../../hooks/useMediaQuery";
import { close, open, toggleSideBar } from "../../redux/slice/SidebarToggle";
import AddLocationForm from "../Popup/AddLocationForm";
import LocationSwitcher from "./LocationSwitcher";
import SidebarNav from "./SidebarNav";

// Phone: a drawer that slides over the page.
// Tablet: an icon rail; expanding it slides the full sidebar over the page.
// Desktop: part of the layout, either full width or collapsed to the rail.
const Sidebar = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { showToast } = useToast();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { isOpen } = useSelector((state) => state.toggle);
  const hotel = useSelector((state) => state.userProfile.user);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);

  const collapsed = !isOpen && !isMobile;
  // below desktop size the open sidebar floats over the page
  const isOverlay = !isDesktop;

  // a floating sidebar closes after every navigation
  useEffect(() => {
    if (isOverlay) dispatch(close());
  }, [pathname, isOverlay, dispatch]);

  useEffect(() => {
    if (!isOverlay || !isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") dispatch(close());
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOverlay, isOpen, dispatch]);

  const handleAddLocation = () => {
    // multilocation is only blocked when the plan explicitly disables it
    if (hotel?.Profile?.multilocation === false) {
      showToast({
        message: "You can't add new location. Please upgrade your plan.",
        type: "warning",
      });
      return;
    }

    if (isOverlay) dispatch(close());
    setIsAddLocationOpen(true);
  };

  return (
    <>
      {isOverlay && isOpen && (
        <div
          aria-hidden="true"
          onClick={() => dispatch(close())}
          className="fixed inset-0 z-[9980] bg-black/50"
        />
      )}

      {/* keeps room for the icon rail on tablets, where the sidebar is fixed */}
      <div aria-hidden="true" className="hidden w-[72px] shrink-0 md:block lg:hidden" />

      <aside
        inert={isMobile && !isOpen}
        className={`fixed inset-y-0 left-0 flex w-72 max-w-[85vw] shrink-0 flex-col bg-primary p-3 text-white transition-[translate,width] duration-300 md:max-w-none md:translate-x-0 lg:static lg:z-auto lg:shadow-none dark:bg-[#0a1020] ${
          isOpen
            ? "z-[9990] translate-x-0 shadow-xl md:w-64"
            : "z-30 -translate-x-full md:w-[72px]"
        }`}
      >
        <div
          className={`mb-3 flex h-10 shrink-0 items-center ${collapsed ? "justify-center" : "justify-between"}`}
        >
          {!collapsed && (
            <img src={LOGO_URL} alt="Eazotel" className="h-7 w-auto object-contain" />
          )}

          <button
            type="button"
            onClick={() => dispatch(toggleSideBar())}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="flex size-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            {isMobile ? (
              <X size={20} />
            ) : isOpen ? (
              <PanelLeftClose size={20} />
            ) : (
              <PanelLeftOpen size={20} />
            )}
          </button>
        </div>

        <LocationSwitcher
          collapsed={collapsed}
          onExpand={() => dispatch(open())}
          onAddLocation={handleAddLocation}
        />

        <SidebarNav collapsed={collapsed} onExpand={() => dispatch(open())} />
      </aside>

      <AddLocationForm
        isOpen={isAddLocationOpen}
        handleClose={() => setIsAddLocationOpen(false)}
      />
    </>
  );
};

export default Sidebar;
