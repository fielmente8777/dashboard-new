import React, { useContext, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import DataContext from "../../context/DataContext";
import { removeCookie } from "../../utils/handleCookies";
import { setHid } from "../../redux/slice/UserSlice";

const ProfileDropDown = ({ isProfileOpen, setIsProfileOpen }) => {
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setAuth } = useContext(DataContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsProfileOpen]);

  const handleLogout = () => {
    localStorage.clear();
    removeCookie("token");
    setAuth(false);
    dispatch(setHid(null));
    navigate("/login");
  };

  const routs = [
    { name: "Profile", link: "profile" },
    { name: "User Management", link: "user-management/all-users" },
    {
      name: "Account & Billing",
      target: "_blank",
      link: "https://accounts.eazotel.com/portal/eazoteltechnologiespvtltd/signin",
    },
    { name: "Integration", link: "integration" },
    { name: "QR Code", link: "qr-code" },
    { name: "Sign Out", onClick: handleLogout },
  ];

  return (
    <div
      ref={dropdownRef}
      className={`
        absolute top-[110%] right-4 min-w-[180px]
        bg-white rounded-lg shadow-xl py-2
        transition-all duration-300 ease-in-out
        z-50
        ${
          isProfileOpen
            ? "opacity-100 translate-y-0 pointer-events-auto visible"
            : "opacity-0 -translate-y-2 pointer-events-none invisible"
        }
      `}
    >
      <ul>
        {routs.map((route, index) => (
          <li key={index} className="list-none">
            {route.link ? (
              <Link
                to={route.link}
                target={route.target}
                onClick={() => setIsProfileOpen(false)}
                className="block px-3 py-2 font-medium hover:bg-slate-100"
              >
                {route.name}
              </Link>
            ) : (
              <button
                type="button"
                onClick={route.onClick}
                className="block w-full text-left px-3 py-2 font-medium hover:bg-slate-100"
              >
                {route.name}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileDropDown;
