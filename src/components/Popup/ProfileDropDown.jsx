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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsProfileOpen]);

  const handleLogout = () => {
    localStorage.clear();
    removeCookie("token");
    setAuth(false);
    dispatch(setHid(null));
    navigate("/login");
  };

  const routs = [
    {
      name: "Profile",
      link: "profile",
    },
    {
      name: "User Management",
      link: "user-management/all-users",
    },
    {
      name: "Account & Billing",
      target: "_blank",
      link: "https://accounts.eazotel.com/portal/eazoteltechnologiespvtltd/signin",
    },
    {
      name: "Sign Out",
      onClick: handleLogout,
    },
  ];

  return (
    <div
      className={`nav-profile-dropdown ${isProfileOpen ? "active" : ""}`}
      ref={dropdownRef}
    >
      {routs.map((route, index) => (
        <li key={index}>
          {route.link && (
            <Link
              to={route.link}
              target={route.target}
              onClick={() => setIsProfileOpen(false)}
              className="block py-2 px-3 font-medium hover:bg-slate-100"
            >
              {route.name}
            </Link>
          )}
          {!route.link && (
            <button
              type="button"
              className="block py-2 px-3 font-medium hover:bg-slate-100 w-full text-left"
              onClick={route.onClick}
            >
              {route.name}
            </button>
          )}
        </li>
      ))}
    </div>
  );
};

export default ProfileDropDown;
