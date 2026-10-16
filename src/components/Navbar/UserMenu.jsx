import { CreditCard, LogOut, QrCode } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import DataContext from "../../context/DataContext";
import { setHid } from "../../redux/slice/UserSlice";
import { PAGES, ROUTES, dashboardPath } from "../../routes/paths";
import { clearSession } from "../../utils/session";
import Icon from "../ui/Icon";
import { BILLING_PORTAL_URL } from "../../config/env";

const itemClassName =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-app-text transition-colors hover:bg-app-surface-secondary";

// The avatar in the navbar and the account menu it opens.
const UserMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const { user: hotel, authUser } = useSelector((state) => state.userProfile);
  const { setAuth, setSelectedConversation } = useContext(DataContext);

  const name = authUser?.userName || hotel?.Profile?.hotelName || "";
  const initial = name.charAt(0).toUpperCase();

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e) => {
      if (!menuRef.current?.contains(e.target)) setIsOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    clearSession();
    setAuth(false);
    dispatch(setHid(null));
    setSelectedConversation(null);
    navigate(ROUTES.LOGIN);
  };

  return (
    <div ref={menuRef}>
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex size-9 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white ring-1 transition hover:bg-white/25 ${isOpen ? "ring-ternary" : "ring-white/25"}`}
      >
        {initial}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="anim-menu fixed right-3 top-[3.75rem] z-[9970] w-64 max-w-[calc(100vw-1.5rem)] rounded-xl border border-app-border! bg-app-surface p-1.5 text-app-text shadow-xl sm:right-4"
        >
          <div className="flex items-center gap-3 px-3 py-2.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {initial}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold capitalize">
                {name}
              </span>
              {authUser?.emailId && (
                <span className="block truncate text-xs text-app-text-muted">
                  {authUser.emailId}
                </span>
              )}
            </span>
          </div>

          <div className="my-1 h-px bg-app-border" />

          <a
            role="menuitem"
            href={BILLING_PORTAL_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => setIsOpen(false)}
            className={itemClassName}
          >
            <Icon icon={CreditCard} className="text-app-text-muted" />
            Account &amp; Billing
          </a>
          <Link
            role="menuitem"
            to={dashboardPath(PAGES.QR_CODE)}
            onClick={() => setIsOpen(false)}
            className={itemClassName}
          >
            <Icon icon={QrCode} className="text-app-text-muted" />
            QR Code
          </Link>

          <div className="my-1 h-px bg-app-border" />

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className={`${itemClassName} text-red-500`}
          >
            <Icon icon={LogOut} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
