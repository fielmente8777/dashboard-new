import { use, useContext, useEffect, useMemo, useState } from "react";
import { CiLocationOn } from "react-icons/ci";
import { FaAlignRight } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { MdAddBusiness } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Logo from "../../../public/logo.png";
import DataContext from "../../context/DataContext";
import { BASE_PATH, BASE_URL } from "../../data/constant";
import { SidebarData } from "../../data/SideBarData";
import { Arrow } from "../../icons/icon";
import { accessScopeMap } from "../../pages/UserMgmt/UserMgmtPopup";
import { close, open, toggleSideBar } from "../../redux/slice/SidebarToggle";
import {
  fetchAuthUserProfile,
  fetchUserProfile,
  setHid,
} from "../../redux/slice/UserSlice";
import { fetchWebsiteData } from "../../redux/slice/websiteDataSlice";
import { removeCookie } from "../../utils/handleCookies";
import handleLocalStorage from "../../utils/handleLocalStorage";
import AddLocationForm from "../Popup/AddLocationForm";
import axios from "axios";

// const token = "";

const allProfiles = [
  {
    id: "2",
    name: "Soul Stories",
    ndid: "4f14df46-bcfa-43da-8d99-0c6c414445ba",
    hid: "71711659",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJFbWFpbCI6InNvdWxzdG9yaWVzczAxQGdtYWlsLmNvbSIsImV4cCI6MTc2Mjg2MDI5MS40MzQ2ODh9.BfVEgIg24SvQIubFCt6oMrTmSPWI5eJ6I5Ap1_A_GsU",
  },
  {
    id: "1",
    name: "Test Multi",
    ndid: "5617a084-5783-4bac-b299-bdb6e8e471bb",
    hid: "11974255",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJFbWFpbCI6ImFiaGlqZWV0QGVhem90ZWwuY29tIiwiR29vZ2xlX0lkIjoiMTExOTUwMTk5NDc2MzQyMTIyODY2IiwiZXhwIjoxNzYyODU4Nzk1Ljg0ODg1NH0.FkeJxgM6n28gNn8xA-C5rGO75iKcMddpBT5gk9uYHVc",
  },

  {
    id: "3",
    name: "Avr",
    ndid: "5617a084-5783-4bac-b299-bdb6e8e471bd",
    hid: "11974258",
  },
];

const Sidebar = ({ sideBarWidth, setSidebarWidth, setIsSmooth, isMobile }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { Leads, setLeads, setLeadsList } = useContext(DataContext);
  const [openMenus, setOpenMenus] = useState({});
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({});
  const [currentProfile, setCurrentProfile] = useState(null);
  const {
    user: hotel,
    authUser,
    hid,
    loading,
    isAuthLoading,
  } = useSelector((state) => state.userProfile);

  const [sidebarActiveIndex, setSidebarActiveIndex] = useState(null);
  const [allClients, setAllClients] = useState([]);
  const { setAuth } = useContext(DataContext);
  const { isOpen } = useSelector((state) => state.toggle);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pathLocation = useLocation();

  // handle toggle dropdown
  const toggleMenu = (index) => {
    // setOpenMenus((prev) => ({
    //   ...prev,
    //   [index]: !prev[index],
    // }));
    setOpenMenus((prev) => ({
      [index]: !prev[index],
    }));
  };

  // handle select location
  const handleSelectLocation = (e, location, hid) => {
    e.stopPropagation();
    try {
      dispatch(setHid(hid));
      dispatch(fetchWebsiteData(handleLocalStorage("token"), hid));

      const navigatePath = pathLocation?.pathname
        ?.split("/")
        .filter(Boolean)
        .slice(3)
        .join("/");

      let timerInterval = null;
      Swal.fire({
        title: `Switching Location ${location?.state}, ${location?.country}`,
        html: `Redirecting to Location ${location?.city} <b></b>`,
        timer: 1200,
        timerProgressBar: true,

        didOpen: () => {
          Swal.showLoading();
          const timer = Swal.getPopup().querySelector("b");
          timerInterval = setInterval(() => {
            timer.textContent = `${Swal.getTimerLeft()}`;
          }, 1000);
        },
        willClose: () => {
          clearInterval(timerInterval);
        },
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
          // navigate("/");
        }
      });

      navigate(`${BASE_PATH}/${hid}/${navigatePath}`);
      setIsDropDownOpen(false);
    } catch (error) {
      console.error("Error selecting location", error?.message);
    }
  };

  const handleClose = () => {
    setIsOpenForm(false);
  };

  const handleAddNewLocation = (e) => {
    e.stopPropagation();

    if (hotel?.Profile?.multilocation) {
      setIsOpenForm(true);
      return;
    }

    if (hotel?.Profile?.multilocation === undefined) {
      setIsOpenForm(true);
      return;
    }

    if (!hotel?.Profile?.multilocation) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: `You can't add new location. Please upgrade your plan.`,
      });
      return;
    }
  };

  const handleResize = (event) => {
    setIsSmooth(false);
    const startX = event.clientX;
    const moveHandler = (e) => {
      const diffX = e.clientX - startX;
      const newWidth = sideBarWidth + diffX;

      if (newWidth < 180) {
        setSidebarWidth(340);
        dispatch(close());
      }

      if (newWidth >= 70 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const upHandler = () => {
      setIsSmooth(true);
      document.removeEventListener("mousemove", moveHandler);
      document.removeEventListener("mouseup", upHandler);
    };

    document.addEventListener("mousemove", moveHandler);
    document.addEventListener("mouseup", upHandler);
  };

  useEffect(() => {
    if (authUser && hotel) {
      const hid = handleLocalStorage("hid");
      // console.log(hid);
      if (authUser?.isAdmin && hid && hotel) {
        if (
          hotel.Profile &&
          Object.keys(hotel?.Profile?.hotels ?? {}).length > 0
        ) {
          const currentLoaction = hotel?.Profile?.hotels[hid];
          setCurrentLocation(currentLoaction);
        }
      } else {
        if (
          hotel.Profile &&
          Object.keys(hotel?.Profile?.hotels ?? {}).length > 0
        ) {
          const assignedLocation =
            authUser?.assignedLocation &&
            authUser?.assigned_location[
              Object.keys(hotel?.Profile?.hotels?.length)
            ];
          const currentLoaction = hotel?.Profile?.hotels[assignedLocation?.hid];
          setCurrentLocation(currentLoaction);
        }
      }
    }
  }, [hotel, authUser, hid]);

  const fetchAllClients = async () => {
    // if (!authUser?.isAdmin && authUser?.role !== "owner") return;
    try {
      const { data } = await axios.get(`${BASE_URL}/admin/get-all-clients`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${handleLocalStorage("token")}`,
        },
      });
      setAllClients(data?.data);
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    fetchAllClients();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.toLowerCase());
    }, 300); // debounce delay (300ms)
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredClients = useMemo(() => {
    if (!debouncedSearch) return allClients;
    return allClients.filter((profile) => {
      const hotel = Object.values(profile?.hotels || {})[0];
      const valuesToSearch = [
        profile?.hotelName,
        hotel?.name,
        hotel?.city,
        hotel?.state,
        hotel?.country,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return valuesToSearch.includes(debouncedSearch);
    });
  }, [allClients, debouncedSearch]);

  // const handleLogout = () => {
  //   localStorage.clear();
  //   removeCookie("token");
  //   setAuth(false);
  //   dispatch(setHid(null));
  //   // setTimeout(() => {
  //   navigate("/login");
  //   // }, 1000)
  // };

  // const handleLogout = () => {
  //   localStorage.clear();
  //   removeCookie("token");
  //   setAuth(false);
  //   dispatch(setHid(null));
  //   // setTimeout(() => {
  //   navigate("/login");
  //   // }, 1000)
  // };

  const handleProfileSwitch = async (profile) => {
    const { ndid, hotels, hotelEmail } = profile;
    const hid = Object.keys(hotels)[0];
    setCurrentProfile(profile);

    if (currentProfile?.hotelName === profile?.hotelName) {
      return;
    }

    try {
      setLeads([]);
      setDebouncedSearch("");
      localStorage.removeItem("SheetId");
      localStorage.removeItem("SheetName");
      const { data } = await axios.post(
        `${BASE_URL}/admin/switch-account`,
        {
          Email: hotelEmail,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${handleLocalStorage("token")}`,
          },
        },
      );

      if (data?.Status) {
        const authToken = data?.Token;

        localStorage.setItem("token", authToken);
        localStorage.setItem("hid", hid);
        localStorage.setItem("ndid", ndid);

        // dispatch(setHid(hid));
        // dispatch(fetchWebsiteData(authToken, hid));
        // dispatch(fetchUserProfile(authToken));
        // dispatch(fetchAuthUserProfile(authToken));
      }
    } catch (error) {
      // console.log(error);
    }

    // let authToken = token;

    // console.log(hid);

    setTimeout(() => {
      // dispatch(setHid(hid));
      // dispatch(fetchWebsiteData(authToken, hid));
      // dispatch(fetchUserProfile(authToken));
      // dispatch(fetchAuthUserProfile(authToken));

      // localStorage.setItem("token", authToken);
      // localStorage.setItem("hid", hid);
      // localStorage.setItem("ndid", ndid);
      navigate("/");
    }, 1000);
  };

  const maniuplateSideBarData = SidebarData?.map((item) => {
    if (item?.name === "Analytics & Reporting") {
      if (authUser?.isAdmin) {
        return {
          ...item,
          subLinks: item?.subLinks?.filter(
            (sub) => authUser?.accessScope[accessScopeMap[sub.key]],
          ),
        };
      } else {
        const assignedLocation = authUser?.assigned_location?.filter(
          (loc) => loc.hid === String(handleLocalStorage("hid")),
        )[0];

        return {
          ...item,
          subLinks: item?.subLinks?.filter(
            (sub) => assignedLocation?.accessScope[accessScopeMap[sub.key]],
          ),
        };
      }
    }

    return {
      ...item,
    };
  });

  // console.log(authUser);
  // console.log(hotel);
  // console.log(currentLocation);
  return (
    <div
      className="p-3 w-full text-white! flex flex-col h-screen overflow-hidden shadow-md bg-[#152547] md:relative fixed left-0 z-99999"
      style={{
        left: isMobile ? (isOpen ? "0px" : "0%") : null,
      }}
    >
      <div className="flex justify-between items-center mb-4 ">
        {isOpen && (
          <div>
            <div className="h-7 -ml-2 ">
              <img
                src={Logo}
                alt="logo"
                className="h-full w-full object-contain"
              />
            </div>
            {/* <h1 className="font-bold text-xl uppercase text-white tracking-wider">
              Eazotel
            </h1> */}
          </div>
        )}

        <span
          className={`size-8  rounded-sm flex items-center justify-center cursor-pointer duration-500 ${
            !isOpen && "ml-2 rotate-180"
          }`}
          onClick={() => {
            dispatch(toggleSideBar());
          }}
        >
          <FaAlignRight />
        </span>
      </div>

      {/* dropdown mutli location */}
      <div
        className={`${
          isOpen ? "w-full" : "w-0 opacity-0 hidden"
        } duration-200 text-wrap`}
      >
        {loading ? (
          <div className="bg-[#1b4599] p-2 flex flex-col gap-2  animate-pulse rounded-md mb-4 ">
            <div className="bg-[#1b4599] animate-pulse h-2 w-24" />
            <div className="bg-gray-200 animate-pulse h-2" />
          </div>
        ) : (
          <div
            className="relative bg-[#1b4599] text-white! cursor-pointer rounded-md px-3 py-1 flex items-center justify-between mb-4"
            onClick={() => {
              setIsDropDownOpen(!isDropDownOpen);
            }}
          >
            <div className="w-full">
              <p className="text-sm capitalize  font-medium">
                {/* {hotel?.Profile?.hotelName || "Eazotel"} */}
                {currentLocation?.local}
              </p>

              {currentLocation?.city &&
                currentLocation?.state &&
                currentLocation?.country && (
                  <p className="text-white/90 text-xs">
                    {currentLocation?.city}
                    {", "}
                    {currentLocation?.state}
                    {", "}
                    {currentLocation?.country}
                  </p>
                )}

              <div
                className="rounded-sm w-full mx-auto duration-200 transition-all ease-in-out space-y-2 pb-2 hide-scrollbar"
                style={{
                  maxHeight: isDropDownOpen ? "300px" : "0px",
                  overflow: isDropDownOpen ? "auto" : "hidden",
                }}
              >
                {authUser?.isAdmin ? (
                  <div className="space-y-2 mt-3 w-full">
                    {authUser?.isAdmin && authUser?.role === "owner" && (
                      <div>
                        <input
                          type="text"
                          placeholder="search"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className=" px-2 py-1 outline-none border rounded-sm w-full focus:border-2 focus:border-green-400"
                        />
                      </div>
                    )}
                    {authUser?.role === "owner" && (
                      <div className="space-y-2">
                        {filteredClients?.map((profile) => {
                          const hotel = Object.values(profile?.hotels)[0];
                          return (
                            <div
                              className={`${
                                currentProfile?.hotelName === profile?.hotelName
                                  ? "bg-[#1b4599] opacity-80"
                                  : "bg-[#1b4599] hover:bg-[#1b4599]/80"
                              }  cursor-pointer rounded-sm hover:bg-gray-100  duration-150 p-2`}
                              onClick={() => {
                                handleProfileSwitch(profile);
                              }}
                            >
                              <h2>{profile?.hotelName}</h2>
                              <p className="text-xs text-gray-500 flex items-center">
                                <CiLocationOn />
                                <span>
                                  {hotel?.city}
                                  {hotel.city && ", "}
                                  {hotel?.state}
                                  {hotel.state && ", "}
                                  {hotel?.country}
                                </span>
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {hotel?.Profile?.hotels &&
                      Object.entries(hotel?.Profile?.hotels).map(
                        ([key, value]) => {
                          const isCurrentLocation =
                            value?.city === currentLocation?.city &&
                            value?.state === currentLocation?.state &&
                            value?.country === currentLocation?.country &&
                            value?.local === currentLocation?.local &&
                            value?.pinCode === currentLocation?.pinCode;

                          return (
                            <div
                              key={key + 1}
                              className={`rounded-sm text-white duration-150 p-2 ${
                                isCurrentLocation
                                  ? "bg-[#1b4599]/80 text-white opacity-70 cursor-not-allowed"
                                  : "bg-[#1b4599]/80 cursor-pointer"
                              }`}
                              onClick={(e) => {
                                if (!isCurrentLocation)
                                  handleSelectLocation(e, value, key);
                              }}
                            >
                              <h2 className="text-sm font-medium">
                                {/* {hotel?.Profile?.hotelName || "Eazotel"} */}
                                {value?.local}
                              </h2>

                              <p className="text-xs gap-1 text-[#c2ccd6] flex items-center">
                                <CiLocationOn />
                                <span>
                                  {value?.city}
                                  {", "}
                                  {value.state}
                                  {", "}
                                  {value?.country}
                                </span>
                              </p>
                            </div>
                          );
                        },
                      )}
                  </div>
                ) : (
                  <div className="space-y-2 mt-3 w-full ">
                    {authUser?.assigned_location?.map((location, index) => {
                      if (hotel?.Profile?.hotels[location?.hid]) {
                        const value = hotel?.Profile?.hotels[location?.hid];
                        // console.log(value);
                        const isCurrentLocation =
                          value?.city === currentLocation?.city &&
                          value?.state === currentLocation?.state &&
                          value?.country === currentLocation?.country;

                        return (
                          <div
                            key={index + 1}
                            className={`cursor-pointer hover:bg-gray-100  duration-150 p-2 ${
                              isCurrentLocation
                                ? "bg-gray-100 opacity-70 cursor-not-allowed"
                                : "bg-gray-200 cursor-pointer"
                            }`}
                            onClick={(e) => {
                              if (!isCurrentLocation)
                                handleSelectLocation(e, value, location?.hid);
                            }}
                          >
                            <h2 className="text-[16px] font-medium">
                              {/* {hotel?.Profile?.hotelName || "Eazotel"} */}
                              {value?.local}
                            </h2>

                            <p className="text-xs text-[#c2ccd6] flex items-center">
                              <CiLocationOn />
                              <span>
                                {value?.city}
                                {", "}
                                {value.state}
                                {", "}
                                {value?.country}
                              </span>
                            </p>
                          </div>
                        );
                      }
                    })}
                  </div>
                )}

                {authUser?.isAdmin && authUser?.role !== "owner" && (
                  <button
                    onClick={(e) => handleAddNewLocation(e)}
                    className="bg-white text-sm rounded-sm text-primary hover:bg-gray-300 duration-300 flex items-center gap-2 font-semibold justify-center py-2 w-full"
                  >
                    <MdAddBusiness size={18} /> Add New Location
                  </button>
                )}
              </div>
            </div>

            <div
              className={`${
                isDropDownOpen ? "rotate-90 " : "-rotate-90"
              } absolute top-5 right-2`}
            >
              <span className="text-white">
                <Arrow />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* navLinks and subLinks dropdown*/}
      <div className="flex-1 overflow-x-hidden scrollbar-hidden space-y-2">
        {loading
          ? Array.from({ length: 10 }).map((_, index) => (
              <div className="animate-pulse h-10 bg-[#0a3a75]/20" />
            ))
          : maniuplateSideBarData?.map((item, index) => {
              if (authUser?.isAdmin) {
                const key = item.key;

                if (key && !authUser?.accessScope[accessScopeMap[key]])
                  return null;
                return (
                  <div key={index} className="flex flex-col">
                    {item?.subLinks ? (
                      <div
                        onClick={() => {
                          navigate(item?.subLinks[0]?.link);
                          setSidebarActiveIndex(null);
                          toggleMenu(index);
                          dispatch(open());
                          // if(isMobile){
                          //   dispatch(close());
                          // }
                        }}
                        className={`flex justify-between items-center cursor-pointer py-3 px-2 ${
                          pathLocation?.pathname
                            ?.split("/")
                            .slice(4)
                            .join("/")
                            .toString() ===
                          item?.subLinks[sidebarActiveIndex]?.link
                            ? " text-[#c2ccd6] rounded-sm text-sm"
                            : "text-[#c2ccd6]"
                        }`}
                      >
                        <div className={`flex gap-2 items-center`}>
                          <span className="text-xm">{item?.icon}</span>

                          <p
                            className={`text-sm text-[#c2ccd6] text-wrap ${
                              isOpen ? "block" : "hidden"
                            }  duration-300 overflow-hidden`}
                          >
                            {item.name}
                          </p>
                        </div>

                        {isOpen && (
                          <span
                            className={`${
                              openMenus[index] ? "rotate-90" : " -rotate-90"
                            } ${
                              pathLocation?.pathname
                                ?.split("/")
                                .slice(4)
                                .join("/")
                                .toString() ===
                              item?.subLinks[sidebarActiveIndex]?.link
                                ? " text-[#c2ccd6]"
                                : ""
                            } ease-linear duration-300 text-[#c2ccd6] mt-1`}
                          >
                            <Arrow className="text-xs" />
                          </span>
                        )}
                      </div>
                    ) : (
                      <div
                        className={`flex gap-2 items-center py-3 px-2  ${
                          pathLocation?.pathname
                            ?.split("/")
                            .slice(4)
                            .join("/")
                            .toString() === item?.link
                            ? "text-[#c2ccd6] rounded-sm"
                            : "text-[#c2ccd6]"
                        } `}
                      >
                        <Link
                          to={item.link}
                          target={item?.target ? "_blank" : "_self"}
                          className={`flex gap-1 font-medium`}
                        >
                          {item?.icon}
                        </Link>

                        {isOpen && (
                          <Link
                            to={item.link}
                            target={item?.target ? "_blank" : "_self"}
                            className={`flex gap-1 text-sm text-[#c2ccd6] text-wrap`}
                          >
                            {item.name}
                          </Link>
                        )}
                      </div>
                    )}

                    {openMenus[index] && item?.subLinks && (
                      <hr className="border-b" />
                    )}

                    {isOpen && openMenus[index] && (
                      <div className=" mt-2  rounded-md p-2">
                        {item?.subLinks &&
                          item.subLinks.map((subLink, index) => {
                            if (
                              subLink?.key &&
                              !authUser?.accessScope[
                                accessScopeMap[subLink?.key]
                              ]
                            )
                              return null;
                            return (
                              <div className="flex flex-col">
                                <Link
                                  onClick={() => {
                                    setSidebarActiveIndex(index);
                                    if (isMobile) {
                                      dispatch(close());
                                    }
                                  }}
                                  to={subLink.link}
                                  key={index}
                                  className={` ${
                                    subLink?.link ===
                                    pathLocation?.pathname
                                      ?.split("/")
                                      .slice(4)
                                      .join("/")
                                      .toString()
                                      ? " bg-[#1b4599] text-white px-2"
                                      : "hover:bg-[#1b4599]/10"
                                  }  flex gap-1 px-4  items-center rounded-md capitalize py-2 text-sm text-[#c2ccd6]`}
                                >
                                  {subLink.icon} {subLink.name}
                                  {/* {hid}{subLink.link} */}
                                </Link>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              } else {
                const currentLocationAccessScope =
                  authUser?.assigned_location?.filter(
                    (location) =>
                      location?.hid === String(handleLocalStorage("hid")),
                  )[0];

                const key = item?.key;
                if (
                  key &&
                  currentLocationAccessScope &&
                  !currentLocationAccessScope?.accessScope[accessScopeMap[key]]
                )
                  return null;

                return (
                  <div key={index} className="flex flex-col gap-1">
                    {item?.subLinks && item?.subLinks.length > 0 ? (
                      <div
                        onClick={() => {
                          navigate(item?.subLinks[0]?.link);
                          setSidebarActiveIndex(0);
                          toggleMenu(index);
                          dispatch(open());
                        }}
                        className={`flex justify-between items-center cursor-pointer py-2 px-2 ${
                          pathLocation?.pathname
                            ?.split("/")
                            .slice(4)
                            .join("/")
                            .toString() ===
                          item?.subLinks[sidebarActiveIndex]?.link
                            ? " text-[#c2ccd6] rounded-sm bg-primary"
                            : "text-[#c2ccd6]"
                        }`}
                      >
                        <div className={`flex gap-2 items-center`}>
                          <span>{item?.icon}</span>

                          <p
                            className={` text-sm text-[#c2ccd6] text-wrap ${
                              isOpen ? "block" : "hidden"
                            }  duration-300 overflow-hidden`}
                          >
                            {item.name}
                          </p>
                        </div>

                        {isOpen && (
                          <span
                            className={`${
                              openMenus[index] ? "-rotate-90" : " rotate-90"
                            } ${
                              pathLocation?.pathname
                                ?.split("/")
                                .slice(4)
                                .join("/")
                                .toString() ===
                              item?.subLinks[sidebarActiveIndex]?.link
                                ? " text-white"
                                : ""
                            } ease-linear duration-300 text-sm text-[#c2ccd6]`}
                          >
                            <Arrow />
                          </span>
                        )}
                      </div>
                    ) : (
                      !item?.subLinks && (
                        <div
                          className={`flex gap-2 items-center py-3 px-2  ${
                            pathLocation?.pathname
                              ?.split("/")
                              .slice(4)
                              .join("/")
                              .toString() === item?.link
                              ? "bg-[#1b4599] text-[#c2ccd6] rounded-sm"
                              : "text-[#c2ccd6]"
                          } `}
                        >
                          <Link to={item.link} className={`flex gap-1`}>
                            {item?.icon}
                          </Link>

                          {isOpen && (
                            <Link
                              to={item.link}
                              className={`flex gap-1 text-sm  text-[#c2ccd6] text-wrap`}
                            >
                              {item.name}
                            </Link>
                          )}
                        </div>
                      )
                    )}

                    {openMenus[index] && item?.subLinks && (
                      <hr className="border-b" />
                    )}

                    {isOpen && openMenus[index] && (
                      <div className="space-y-2 mt-2">
                        {item?.subLinks &&
                          item?.subLinks?.length > 0 &&
                          item.subLinks.map((subLink, index) => {
                            if (
                              subLink?.key &&
                              !currentLocationAccessScope?.accessScope[
                                accessScopeMap[subLink?.key]
                              ]
                            )
                              return null;
                            return (
                              <div className="flex flex-col">
                                <Link
                                  onClick={() => setSidebarActiveIndex(index)}
                                  to={subLink.link}
                                  key={index}
                                  className={` ${
                                    subLink?.link ===
                                    pathLocation?.pathname
                                      ?.split("/")
                                      .slice(4)
                                      .join("/")
                                      .toString()
                                      ? "bg-[#DBEAFE] text-[#c2ccd6] px-2"
                                      : "hover:bg-[#1b4599]/10"
                                  }  flex gap-1  items-center rounded-md capitalize py-2 px-3 text-sm text-[#c2ccd6]`}
                                >
                                  {subLink.icon} {subLink.name}
                                  {/* {hid}{subLink.link} */}
                                </Link>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              }
            })}

        {/* add location form  */}
        <AddLocationForm isOpen={isOpenForm} handleClose={handleClose} />
      </div>

      <div
        className=" absolute right-0 top-0 bg-transparent cursor-e-resize"
        onMouseDown={handleResize}
      />

      {/* <div className="md:hidden block cursor-pointer" onClick={handleLogout}>
        <IoIosLogOut size={32} />
      </div> */}
    </div>
  );
};

export default Sidebar;