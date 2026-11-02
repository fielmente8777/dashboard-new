import { useContext, useEffect, useRef, useState } from "react";
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
import Logo from "../../assets/companylogo.b.png";
import ChangePassword from "../Popup/ChangePassword";
import ProfilePopup from "../Popup/ProfilePopup";
import { toggleSideBar } from "../../redux/slice/SidebarToggle";
import { FaAlignRight } from "react-icons/fa";
import NotificationPopup from "../Popup/NotificationPopup";
import ThemeToggle from "./ThemeToggle";
import {
  BASE_PATH,
  NOTIFICATION_WS_URL,
  ROUTES_PATH,
  WS_BASE_URL,
} from "../../data/constant";
import WebSocketClient from "../../config/websocketClient";
import GlobalSearch from "../GlobalSearch/GlobalSearch";
import {
  getNotifications,
  getNotificationUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  sendTestPush,
} from "../../services/api/notification.api";
import {
  enablePushNotifications,
  ensurePushSubscription,
  getPushPermission,
} from "../../utils/pushNotifications";

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
  const wsRef = useRef(null);
  const dispatch = useDispatch();
  const { user: hotel, authUser } = useSelector((state) => state.userProfile);
  const token = localStorage.getItem("token");
  const [isNotificationPopupOpen, setIsNotificationPopupOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (token) {
      dispatch(fetchUserProfile(token));
    }
  }, [dispatch, token]);

  // const navigate = useNavigate();

  const { homeNotifications, emergencyNotifications } = useContext(DataContext);
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

  const onNotificationPopupClose = () => {
    setIsNotificationPopupOpen(false);
  };
  const hid = localStorage.getItem("hid");
  const hotels = hotel?.Profile?.hotels || {};
  const hotelName = hotels?.[hid]?.local || "";
  const isLoadingProfile = !hotel || !hotel.Profile;

  const firstLetter =
    hotel?.Profile?.hotelName?.charAt(0)?.toLowerCase() || "a";

  useEffect(() => {
    wsRef.current = new WebSocketClient(WS_BASE_URL);

    wsRef.current.connect((serverResponse) => {
      const { data, event } = serverResponse;
      console.log(serverResponse);
      if (
        event === "NOTIFICATION" &&
        data?.ndid === localStorage.getItem("ndid")
      ) {
        setNotifications((prevNotifications) => [...prevNotifications, data]);
      }
    });

    return () => wsRef.current?.close();
  }, []);

  // ---------------- In-app notifications (new system) ----------------
  const navigate = useNavigate();
  const notificationWsRef = useRef(null);
  const [inAppNotifications, setInAppNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextCursor, setNextCursor] = useState(null);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const loadNotifications = async (cursor) => {
    setNotificationsLoading(true);
    try {
      const res = await getNotifications({ limit: 20, cursor });
      console.log("🔔 [notifications] list:", res);
      const docs = res?.result?.docs || [];
      setInAppNotifications((prev) => {
        if (!cursor) return docs;
        const seen = new Set(prev.map((n) => n.id));
        return [...prev, ...docs.filter((n) => !seen.has(n.id))];
      });
      setNextCursor(res?.result?.nextCursor || null);
    } catch (err) {
      console.error("🔔 [notifications] list failed:", err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // initial load (and reload on property switch)
  useEffect(() => {
    if (!token) return;

    loadNotifications();

    getNotificationUnreadCount()
      .then((res) => {
        console.log("🔔 [notifications] unread count:", res);
        setUnreadCount(res?.result?.total || 0);
      })
      .catch((err) =>
        console.error("🔔 [notifications] unread count failed:", err),
      );
  }, [token, hid]);

  // realtime
  useEffect(() => {
    if (!token) return;

    const client = new WebSocketClient(NOTIFICATION_WS_URL);
    notificationWsRef.current = client;

    client.connect(
      ({ event, data }) => {
        switch (event) {
          case "NOTIFICATION_SUBSCRIBED":
            console.log("🔔 [notifications] subscribed:", data);
            setUnreadCount(data?.unreadCount || 0);
            break;
          case "NOTIFICATION_NEW":
            console.log("🔔 [notifications] NEW:", data);
            if (!data?.notification) break;
            // grouped notifications reuse the same id -> replace & move to top
            setInAppNotifications((prev) => [
              data.notification,
              ...prev.filter((n) => n.id !== data.notification.id),
            ]);
            setUnreadCount(data?.unreadCount || 0);
            break;
          case "NOTIFICATION_READ": {
            // read state changed (this tab or another tab/device of the same user)
            console.log("🔔 [notifications] READ sync:", data);
            setUnreadCount(data?.unreadCount || 0);
            const ids = data?.ids;
            if (ids === "all") {
              setInAppNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true })),
              );
            }
            break;
          }
          case "NOTIFICATION_ERROR":
            console.error("🔔 [notifications] socket error:", data);
            break;
          default:
            break;
        }
      },
      // (re)subscribe on every (re)connect
      () =>
        client.send({
          event: "NOTIFICATION_SUBSCRIBE",
          data: { token, hid },
        }),
    );

    return () => client.close();
  }, [token, hid]);

  // ---------------- Browser (Chrome) push notifications ----------------
  const [pushPermission, setPushPermission] = useState(getPushPermission());

  // already allowed -> make sure this browser is registered on the backend
  useEffect(() => {
    if (!token || getPushPermission() !== "granted") return;
    ensurePushSubscription().catch((err) =>
      console.error("🔔 [push] subscription failed:", err),
    );
  }, [token]);

  const handleEnablePush = async () => {
    try {
      const permission = await enablePushNotifications();
      setPushPermission(permission);
      if (permission === "granted") {
        const res = await sendTestPush();
        console.log("🔔 [push] test push:", res);
      }
    } catch (err) {
      console.error("🔔 [push] enable failed:", err);
    }
  };

  const getNotificationPath = (n) => {
    const targetHid = n.hid || hid;
    const base = `${BASE_PATH}/${targetHid}`;

    if (n.entity?.type === "lead" && n.entity?.id) {
      return `${base}/${ROUTES_PATH.LEADS_MANAGEMENT}/all-leads/${n.entity.id}/view?hid=${targetHid}&lead=1`;
    }
    if (n.entity?.type === "whatsapp_conversation" && n.entity?.id) {
      const phone = n.actor?.phone ? `&phone=${n.actor.phone}` : "";
      return `${base}/channel/wa/chat?conversationId=${n.entity.id}${phone}`;
    }
    return null;
  };

  const handleNotificationClick = (n) => {
    if (!n.isRead) {
      setInAppNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      markNotificationRead(n.id).catch((err) =>
        console.error("🔔 [notifications] mark read failed:", err),
      );
    }

    const path = getNotificationPath(n);
    if (path) {
      setIsNotificationPopupOpen(false);
      navigate(path);
    }
  };

  const handleMarkAllRead = () => {
    setInAppNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    markAllNotificationsRead().catch((err) =>
      console.error("🔔 [notifications] mark all read failed:", err),
    );
  };

  return (
    <div className="left-0 top-0">
      <div className="py-2 z-10 bg-app-navbar sm:bg-primary dark:bg-app-navbar flex cardShadow px-4 items-center justify-between top-0 w-full transition-colors duration-200">
        <div
          onClick={() => dispatch(toggleSideBar())}
          className="size-8 bg-white/20 dark:bg-white/10 rounded-sm items-center justify-center cursor-pointer duration-500 md:hidden flex"
        >
          <FaAlignRight className="text-white" />
        </div>

        <Greeting name={isLoadingProfile ? "Loading..." : hotelName} />
        <div className="sm:hidden">
          <div className="w-28 h-10 -ml-2">
            <img
              src={Logo}
              alt="logo"
              className="h-full w-full object-contain"
            />
          </div>

          {/* <div className="flex-1 flex justify-end sm:justify-center px-2 sm:px-6">
            <GlobalSearch />
          </div> */}
        </div>

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
            <div className="flex-1 flex justify-end sm:justify-center px-2 sm:px-6">
              <GlobalSearch />
            </div>

            <ThemeToggle />
            <button
              onClick={() => setIsNotificationPopupOpen(true)}
              className="relative group transition-transform duration-200 hover:scale-110 hover:shadow-md"
            >
              <IoIosNotifications
                size={22}
                className="text-white origin-top transition-transform duration-200 group-hover:animate-ring group-hover:scale-125"
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-4.5 h-4.5 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            {/* <Link to="settings">
              <MdSettings size={22} color="white" />
            </Link> */}
            <Link to="settings" className="group">
              <MdSettings
                size={22}
                className="text-white transition-transform duration-300 group-hover:rotate-180 group-hover:scale-110"
              />
            </Link>
            <div
              onClick={() => setOpen(true)}
              className="flex gap-2 py-1.5 text-white bg-ternary justify-center items-center px-4 rounded-lg cursor-pointer shadow-md active:scale-95"
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
              backgroundColor: letterColorMap[firstLetter],
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
          <GlobalSearch />
          <ThemeToggle />
          <div
            onClick={() => setOpen(true)}
            className="bg-[#2e3b61] text-white sm:hidden p-1 rounded-md"
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
        <NotificationPopup
          isOpen={isNotificationPopupOpen}
          onClose={onNotificationPopupClose}
          data={notifications}
          notifications={inAppNotifications}
          unreadCount={unreadCount}
          hasMore={Boolean(nextCursor)}
          loading={notificationsLoading}
          onLoadMore={() => loadNotifications(nextCursor)}
          onItemClick={handleNotificationClick}
          onMarkAllRead={handleMarkAllRead}
          pushPermission={pushPermission}
          onEnablePush={handleEnablePush}
        />
      </div>
    </div>
  );
};

export default Navbar;
