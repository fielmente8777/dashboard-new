import { useContext, useEffect, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { IoMdHome } from "react-icons/io";
import { MdOutlineSos } from "react-icons/md";
import { RiFeedbackFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DataContext from "../../context/DataContext";
import { fetchUserProfile, setHid } from "../../redux/slice/UserSlice";
import AppsPopup from "../Popup/AppsPopup";
import { RxDashboard } from "react-icons/rx";
import Greeting from "../Greeting";
const Navbar = () => {
  const dispatch = useDispatch();
  const { user: hotel, authUser } = useSelector((state) => state.userProfile);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      dispatch(fetchUserProfile(token));
    }
  }, [dispatch, token]);

  const navigate = useNavigate();

  const { setAuth, homeNotifications, emergencyNotifications } =
    useContext(DataContext);
  const [open, setOpen] = useState(false);

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
    localStorage.clear();
    setAuth(false);
    dispatch(setHid(null));
    // setTimeout(() => {
    navigate("/login");
    // }, 1000)
  };

  return (
    <div className="sticky top-0">
      <div className="h-[8vh] z-10  bg-[#2e3b61] border-b flex cardShadow flex-col md:flex-row md:px-4 items-center justify-between top-0 w-full overflow-hidden">
        <Greeting name={hotel?.Profile?.hotelName} />

        {/* <div className="gap-5 !text-zinc-700 max-md:border-b-2 text-[18px] py-1 flex justify-center items-center font-medium">
        <GiHamburgerMenu className="text-2xl md:text-[45px] text-[#0a3a75] " />
        <img src={Logo} alt="logo" className="h-full w-full -ml-4" />
      </div> */}

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
          {/* <button onClick={handleLogout}>Logout</button> */}
          {/* <div className="flex items-center">
          <Link
            to={hotel?.Data?.websiteLink}
            target="_blank"
            className="  font-medium transition-all py-[6px] duration-150 bg-[#0a3a75] hover:bg-[#0a3a75]/90 text-white px-3 flex items-center rounded-md text-[14px]"
          >
            Visit Website
          </Link>
        </div> */}

          {/* <div className="block sm:hidden text-white rounded-md transition-all duration-150  px-2 py-[6px] bg-[#0a3a75] hover:bg-[#0a3a75]/90">
            <GiHamburgerMenu size={20} />
          </div> */}

          <div className="flex text-zinc-700 items-center">
            <div
              onClick={() => setOpen(true)}
              className="flex gap-2 py-2 text-white bg-[#0088ff]  justify-center items-center px-4 rounded-lg cursor-pointer shadow-md hover:scale-95"
            >
              <RxDashboard size={22} />{" "}
              <p className="text-md font-semibold">Marketplace</p>
            </div>
          </div>
        </div>

        <AppsPopup open={open} setOpen={setOpen} authUser={authUser} />
      </div>
    </div>
  );
};

export default Navbar;
