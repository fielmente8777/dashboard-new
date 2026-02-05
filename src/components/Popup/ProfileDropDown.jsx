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
      name: "Integration",
      link: "integration",
    },
    {
      name: "QR Code",
      link: "qr-code",
    },
    {
      name: "Sign Out",
      onClick: handleLogout,
    },
  ];

  return (
    <div
      ref={dropdownRef}
      className={`
    fixed right-4 top-[10%]
    min-w-180px rounded-lg border bg-white
    shadow-lg
    transition-all duration-200 ease-out
    ${
      isProfileOpen
        ? "opacity-100 translate-y-0 pointer-events-auto !z-999999]"
        : "opacity-0 -translate-y-2 pointer-events-none z-[-1]"
    }
  `}
    >
      <ul className="py-2">
        {routs.map((route, index) => (
          <li key={index}>
            {route.link ? (
              <Link
                to={route.link}
                target={route.target}
                onClick={() => setIsProfileOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {route.name}
              </Link>
            ) : (
              <button
                type="button"
                onClick={route.onClick}
                className="block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
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

// <div
//     className={`nav-profile-dropdown border  ${isProfileOpen ? "active z-999999!" : ""}`}
//     ref={dropdownRef}
//   >
//     {routs.map((route, index) => (
//       <li key={index}>
//         {route.link && (
//           <Link
//             to={route.link} // integraion
//             target={route.target}
//             onClick={() => setIsProfileOpen(false)}
//             className="block py-2 px-3 font-medium hover:bg-slate-100"
//           >
//             {route.name}
//           </Link>
//         )}
//         {!route.link && (
//           <button
//             type="button"
//             className="block py-2 px-3 font-medium hover:bg-slate-100 w-full text-left"
//             onClick={route.onClick}
//           >
//             {route.name}
//           </button>
//         )}
//       </li>
//     ))}
//   </div>
