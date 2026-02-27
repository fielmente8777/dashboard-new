import { useContext, useEffect, useState } from "react";
import { HiOutlineUserGroup } from "react-icons/hi";
import { IoIosNotifications, IoMdHome } from "react-icons/io";
import { MdOutlineSos, MdSettings, MdStore } from "react-icons/md";
import { RiFeedbackFill } from "react-icons/ri";
import { RxDashboard } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import DataContext from "../../context/DataContext";
import { fetchUserProfile, setHid } from "../../redux/slice/UserSlice";
import Greeting from "../Greeting";
import AppsPopup from "../Popup/AppsPopup";
import ChangePassword from "../Popup/ChangePassword";
import ProfilePopup from "../Popup/ProfilePopup";
import { toggleSideBar } from "../../redux/slice/SidebarToggle";
import { FaAlignRight } from "react-icons/fa";
import NotificationPopup from "../Popup/NotificationPopup";

const letterColorMap = {
  a: "#e6194b",
  b: "#3cb44b",
  c: "#ffe119",
  d: "#4363d8",
  e: "#f58231",
  f: "#911eb4",
  g: "#46f0f0",
  h: "#f032e6",
  i: "#bcf60c",
  j: "#fabebe",
  k: "#008080",
  l: "#e6beff",
  m: "#9a6324",
  n: "#fffac8",
  o: "#800000",
  p: "#aaffc3",
  q: "#808000",
  r: "#ffd8b1",
  s: "#000075",
  t: "#808080",
  u: "#59b1ad",
  v: "#000000",
  w: "#d2691e",
  x: "#ff69b4",
  y: "#00ced1",
  z: "#8a2be2",
};

const Navbar = () => {
  const dispatch = useDispatch();
  const { user: hotel, authUser } = useSelector((state) => state.userProfile);
  const token = localStorage.getItem("token");
  const [isNotificationPopupOpen,setIsNotificationPopupOpen]=useState(false)

  useEffect(() => {
    if (token) {
      dispatch(fetchUserProfile(token));
    }
  }, [dispatch, token]);

  const navigate = useNavigate();

  const { setAuth, homeNotifications, emergencyNotifications } =
    useContext(DataContext);
  const [open, setOpen] = useState(false);
  // const [isChangePasswordPopupOpen, setIsChangePasswordPopupOpen] =
  //   useState(false);
  // const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isOpenProfilePopup, setIsOpenProfilePopup } = useContext(DataContext);

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

  // const handleLogout = () => {
  //   localStorage.clear();
  //   setAuth(false);
  //   dispatch(setHid(null));
  //   // setTimeout(() => {
  //   navigate("/login");
  //   // }, 1000)
  // };

  console.log(hotel);

  const onNotificationPopupClose=()=>{
    setIsNotificationPopupOpen(false);
  }
  return (
    <div className="left-0 top-0">
      <div className="py-2 z-10  bg-[#2e3b61] flex cardShadow px-4 items-center justify-between top-0 w-full ">
        <div
          onClick={() => dispatch(toggleSideBar())}
          className={`size-8 bg-blue-100 rounded-sm  items-center justify-center cursor-pointer duration-500 md:hidden flex`}
        >
          <FaAlignRight color="#000" />
        </div>

        <Greeting
          name={
            hotel?.Profile?.hotels[localStorage?.getItem("hid")]?.local || ""
          }
        />

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

          <div className="hidden sm:flex gap-3 text-zinc-700 items-center">
            <button onClick={()=>setIsNotificationPopupOpen(true)}>
              <IoIosNotifications size={22} color="white" />
            </button>
            <Link to="settings">
              <MdSettings size={22} color="white" />
            </Link>
            <div
              onClick={() => setOpen(true)}
              className="flex gap-2 py-1.5 text-white bg-[#0088ff]  justify-center items-center px-4 rounded-lg cursor-pointer shadow-md active:scale-95"
            >
              <MdStore size={18} />{" "}
              <p className="text-sm font-semibold">EazStore</p>
            </div>
            {/* <div>
              <MdSettings
                onClick={() => setIsChangePasswordPopupOpen(true)}
                className="text-white"
                size={24}
              />
            </div> */}

            {/* <FaUser onClick={() => setIsChangePasswordPopupOpen(true)} className="text-white" size={24} /> */}
          </div>
          <button
            style={{
              backgroundColor:
                letterColorMap[
                  hotel?.Profile?.hotelName?.charAt(0).toLowerCase()
                ],
            }}
            onClick={() => setIsOpenProfilePopup(!isOpenProfilePopup)}
            className="border bg-gray-300 rounded-full h-10 w-10 flex justify-center items-center text-white"
          >
            <p className="text-2xl font-semibold">
              {hotel?.Profile?.hotelName?.charAt(0).toUpperCase()}
            </p>
          </button>
        </div>

        <div className="flex items-center gap-2.5 sm:hidden">
          <div
            onClick={() => setOpen(true)}
            className="bg-[#0088ff] text-white sm:hidden p-1 rounded-md"
          >
            <RxDashboard size={22} />{" "}
          </div>
          <button
            style={{
              backgroundColor:
                letterColorMap[
                  hotel?.Profile?.hotelName?.charAt(0).toLowerCase()
                ],
            }}
            onClick={() => setIsOpenProfilePopup(!isOpenProfilePopup)}
            className="border bg-gray-300 rounded-full h-10 w-10 flex justify-center items-center text-white"
          >
            <p className="text-2xl font-semibold">
              {hotel?.Profile?.hotelName?.charAt(0).toUpperCase()}
            </p>
          </button>
        </div>

        <AppsPopup open={open} setOpen={setOpen} authUser={authUser} />

        {/* <ProfilePopup
          isProfileOpen={isProfileOpen}
          setIsProfileOpen={setIsProfileOpen}
          Color={
            letterColorMap[hotel?.Profile?.hotelName?.charAt(0).toLowerCase()]
          }
        /> */}

        {/* <ChangePassword
          isOpen={isChangePasswordPopupOpen}
          onClose={() => setIsChangePasswordPopupOpen(false)}
        /> */}
        <NotificationPopup isOpen={isNotificationPopupOpen} onClose={onNotificationPopupClose}/>
      </div>
    </div>
  );
};

export default Navbar;
