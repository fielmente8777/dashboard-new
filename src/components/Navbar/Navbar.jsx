import React, { useContext, useEffect } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link, useLocation } from "react-router-dom";
import DataContext from "../../context/DataContext";
import { IoMdHome } from "react-icons/io";
import { RiFeedbackFill } from "react-icons/ri";
import { MdOutlineSos } from "react-icons/md";
import { HiOutlineUserGroup } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../../redux/slice/UserSlice";

import Logo from "../../assets/companylogo.b.png";
const Navbar = () => {
  const dispatch = useDispatch();
  const {
    user: hotel,
    loading,
    error,
  } = useSelector((state) => state.userProfile);

  const token = localStorage.getItem("token");
  useEffect(() => {
    if (token) {
      dispatch(fetchUserProfile(token));
    }
  }, [dispatch, token]);

  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth, homeNotifications, emergencyNotifications } =
    useContext(DataContext);

  const SidebarData = [
    {
      name: "Home",
      link: "/",
      icon: <IoMdHome size={24} />,
      notification: homeNotifications.length,
    },
    {
      name: "Emergency Request",
      link: "/emergency-request",
      icon: <MdOutlineSos size={26} />,
      notification: emergencyNotifications.length,
    },
    {
      name: "User Management",
      link: "/user-management",
      icon: <HiOutlineUserGroup />,
      notification: 0,
    },
    {
      name: "Feedback",
      link: "/feedback",
      icon: <RiFeedbackFill />,
      notification: 0,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("ndid");
    setAuth(false);
    // setTimeout(() => {
    navigate("/login");
    // }, 1000)
  };

  return (
    <div className="h-[8vh] bg-white border-b flex flex-col md:flex-row md:px-4 justify-between  top-0 w-full">
      <div className="!text-zinc-700 max-md:border-b-2 text-[18px] py-1 flex justify-center items-center font-medium">
        <img src={Logo} alt="logo" className="h-full w-full -ml-4" />
      </div>

      {/* <div className='grid grid-cols-4 w-full md:hidden  '>
                {SidebarData.map((item, index) => (
                    <div key={index} className='relative'>
                        <Link to={item.link}
                            className={` ${location.pathname === item.link ? "border-b-[6px]   border-[#0a3a75] text-[#0a3a75] bg-[#f5f4f9]" : "border-b-[6px] border-transparent"} py-4 flex justify-center items-center   text-xl rounded-sm capitalize text-center px-3 text-[14px] font-medium text-[#575757] transition-all duration-150`}>
                            {item.icon}

                        </Link>
                        {item?.notification > 0 ? <p className='absolute bg-[#0a3a75] top-3 right-3 h-3 w-3 animate-bounce rounded-full'></p> : ''}
                    </div>
                ))}
            </div> */}

      <div className="flex gap-5 max-md:hidden">
        <button onClick={handleLogout}>Logout</button>
        <div className="flex items-center">
          <Link
            to={hotel?.Data?.websiteLink}
            target="_blank"
            className="  font-medium transition-all py-[6px] duration-150 bg-[#0a3a75] hover:bg-[#0a3a75]/90 text-white px-3 flex items-center rounded-md text-[14px]"
          >
            Visit Website
          </Link>
        </div>

        <div className="block sm:hidden text-white rounded-md transition-all duration-150  px-2 py-[6px] bg-[#0a3a75] hover:bg-[#0a3a75]/90">
          <GiHamburgerMenu size={20} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
