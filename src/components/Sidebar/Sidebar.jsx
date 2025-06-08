import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SidebarData } from "../../data/SideBarData";
import { Arrow } from "../../icons/icon";
import { CiLocationOn } from "react-icons/ci";
import { MdAddBusiness } from "react-icons/md";
import AddLocationForm from "../Popup/AddLocationForm";
import handleLocalStorage from "../../utils/handleLocalStorage";
import { BASE_PATH } from "../../data/constant";
import { setHid } from "../../redux/slice/UserSlice";
import { fetchWebsiteData } from "../../redux/slice/websiteDataSlice";
import Swal from "sweetalert2";
import { accessScopeMap } from "../../pages/UserMgmt/UserMgmtPopup";
import { FaAlignRight } from "react-icons/fa";
import Logo from "../../assets/companylogo.b.png";
import { open, toggleSideBar } from "../../redux/slice/SidebarToggle";
import { IoClose } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import DataContext from "../../context/DataContext";
import { removeCookie } from "../../utils/handleCookies";

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState({});
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({});
  const {
    user: hotel,
    authUser,
    hid,
    loading,
    isAuthLoading,
  } = useSelector((state) => state.userProfile);

  const [sidebarActiveIndex, setSidebarActiveIndex] = useState(null);
  const { setAuth } = useContext(DataContext);
  const { isOpen } = useSelector((state) => state.toggle);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pathLocation = useLocation();

  // handle toggle dropdown
  const toggleMenu = (index) => {
    setOpenMenus((prev) => ({
      ...prev,
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
      console.log(error);
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

  useEffect(() => {
    if (authUser) {
      const hid = handleLocalStorage("hid");
      if (authUser?.isAdmin) {
        const currentLoaction = hotel?.Profile?.hotels[hid];
        setCurrentLocation(currentLoaction);
      } else {
        const assignedLocation = authUser?.assigned_location[0];
        const currentLoaction = hotel?.Profile?.hotels[assignedLocation?.hid];
        setCurrentLocation(currentLoaction);
      }
    }
  }, [hid, hotel, authUser]);

  const handleLogout = () => {
    localStorage.clear();
    removeCookie("token");
    setAuth(false);
    dispatch(setHid(null));
    // setTimeout(() => {
    navigate("/login");
    // }, 1000)
  };

  const maniuplateSideBarData = SidebarData?.map((item) => {
    if (item?.name === "Analytics & Reporting") {
      if (authUser?.isAdmin) {
        return {
          ...item,
          subLinks: item?.subLinks?.filter(
            (sub) => authUser?.accessScope[accessScopeMap[sub.key]]
          ),
        };
      } else {
        const assignedLocation = authUser?.assigned_location?.filter(
          (loc) => loc.hid === String(handleLocalStorage("hid"))
        )[0];

        console.log(assignedLocation);

        return {
          ...item,
          subLinks: item?.subLinks?.filter(
            (sub) => assignedLocation?.accessScope[accessScopeMap[sub.key]]
          ),
        };
      }
    }

    return {
      ...item,
    };
  });

  return (
    <div className="p-3 flex flex-col h-screen overflow-hidden shadow-md bg-white">
      <div className="flex justify-between items-center mb-4">
        {isOpen && (
          <div>
            {/* <img src={Logo} alt="logo" className="h-8 object-contain" /> */}
            <div className="w-28 h-10 -ml-2">
              <img
                src={Logo}
                alt="logo"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        )}

        <span
          className={`size-8 bg-blue-100 rounded-sm flex items-center justify-center cursor-pointer duration-500 ${!isOpen && "ml-2 rotate-180"
            }`}
          onClick={() => {
            dispatch(toggleSideBar());
          }}
        >
          <FaAlignRight />
        </span>
      </div>

      <div
        className={`${isOpen ? "w-full" : "w-0 opacity-0 hidden"
          } duration-200 text-nowrap`}
      >
        {loading ? (
          <div className="bg-gray-100 p-4 flex flex-col gap-2  animate-pulse rounded-md mb-4 ">
            <div className="bg-gray-200 animate-pulse h-2 w-24" />
            <div className="bg-gray-200 animate-pulse h-2" />
          </div>
        ) : (
          <div
            className="relative bg-[#0a3a75] border cursor-pointer rounded-md px-3 py-1 flex items-center justify-between mb-4"
            onClick={() => {
              setIsDropDownOpen(!isDropDownOpen);
            }}
          >
            <div className="w-full">
              <p className="text-[16px] capitalize text-white font-medium">
                {hotel?.Profile?.hotelName || "Eazotel"}
              </p>

              {currentLocation?.city &&
                currentLocation?.state &&
                currentLocation?.country && (
                  <p className="text-white/90 text-[15px]">
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
                    {hotel?.Profile?.hotels &&
                      Object.entries(hotel?.Profile?.hotels).map(
                        ([key, value]) => {
                          const isCurrentLocation =
                            value?.city === currentLocation?.city &&
                            value?.state === currentLocation?.state &&
                            value?.country === currentLocation?.country;

                          return (
                            <div
                              key={key + 1}
                              className={`rounded-sm hover:bg-gray-100  duration-150 p-2 ${isCurrentLocation
                                  ? "bg-gray-100 opacity-70 cursor-not-allowed"
                                  : "bg-gray-200 cursor-pointer"
                                }`}
                              onClick={(e) => {
                                if (!isCurrentLocation)
                                  handleSelectLocation(e, value, key);
                              }}
                            >
                              <h2 className="text-[16px] font-medium">
                                {hotel?.Profile?.hotelName || "Eazotel"}
                              </h2>

                              <p className="text-sm gap-1 text-gray-500 flex items-center">
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
                      )}
                  </div>
                ) : (
                  <div className="space-y-2 mt-3 w-full ">
                    {authUser?.assigned_location?.map((location, index) => {
                      if (hotel?.Profile?.hotels[location?.hid]) {
                        const value = hotel?.Profile?.hotels[location?.hid];
                        const isCurrentLocation =
                          value?.city === currentLocation?.city &&
                          value?.state === currentLocation?.state &&
                          value?.country === currentLocation?.country;

                        return (
                          <div
                            key={index + 1}
                            className={`cursor-pointer hover:bg-gray-100  duration-150 p-2 ${isCurrentLocation
                                ? "bg-gray-100 opacity-70 cursor-not-allowed"
                                : "bg-gray-200 cursor-pointer"
                              }`}
                            onClick={(e) => {
                              if (!isCurrentLocation)
                                handleSelectLocation(e, value, location?.hid);
                            }}
                          >
                            <h2 className="text-[16px] font-medium">
                              {hotel?.Profile?.hotelName || "Eazotel"}
                            </h2>

                            <p className="text-xs text-gray-500 flex items-center">
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

                {authUser?.isAdmin && (
                  <button
                    onClick={(e) => handleAddNewLocation(e)}
                    className="bg-white rounded-sm text-primary hover:bg-gray-300 duration-300 flex items-center gap-2 text-base font-semibold justify-center py-2 w-full"
                  >
                    <MdAddBusiness size={22} /> Add New Location
                  </button>
                )}
              </div>
            </div>

            <div className="-rotate-90 absolute top-5 right-2">
              <span className="-rotate-90 text-white">
                <Arrow />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-x-hidden scrollbar-hidden space-y-2">
        {isAuthLoading
          ? Array.from({ length: 10 }).map((_, index) => (
            <div className="animate-pulse h-10 bg-gray-200" />
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
                        setSidebarActiveIndex(0);
                        toggleMenu(index);
                        dispatch(open());
                      }}
                      className={`flex justify-between items-center cursor-pointer py-3 px-2 ${pathLocation?.pathname
                          ?.split("/")
                          .slice(4)
                          .join("/")
                          .toString() ===
                          item?.subLinks[sidebarActiveIndex]?.link
                          ? " text-white rounded-sm bg-primary"
                          : "text-primary"
                        }`}
                    >
                      <div className={`flex gap-2 items-center`}>
                        <span>{item?.icon}</span>

                        <p
                          className={`font-medium text-nowrap ${isOpen ? "block" : "hidden"
                            }  duration-300 overflow-hidden`}
                        >
                          {item.name}
                        </p>
                      </div>

                      {isOpen && (
                        <span
                          className={`${openMenus[index] ? "-rotate-90" : " rotate-90"
                            } ${pathLocation?.pathname
                              ?.split("/")
                              .slice(4)
                              .join("/")
                              .toString() ===
                              item?.subLinks[sidebarActiveIndex]?.link
                              ? " text-white"
                              : ""
                            } ease-linear duration-300 text text-[#575757]/70 mt-1`}
                        >
                          <Arrow />
                        </span>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`flex gap-2 items-center py-3 px-2  ${pathLocation?.pathname
                          ?.split("/")
                          .slice(4)
                          .join("/")
                          .toString() === item?.link
                          ? "bg-[#0a3a75] text-white rounded-sm"
                          : "text-primary"
                        } `}
                    >
                      <Link
                        to={item.link}
                        className={`flex gap-1 font-medium`}
                      >
                        {item?.icon}
                      </Link>

                      {isOpen && (
                        <Link
                          to={item.link}
                          className={`flex gap-1 font-medium text-nowrap`}
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
                    <div className="space-y-2 mt-2 border-2 border-gray-200 bg-gray-200/20 rounded-md p-2">
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
                                onClick={() => setSidebarActiveIndex(index)}
                                to={subLink.link}
                                key={index}
                                className={` ${subLink?.link ===
                                    pathLocation?.pathname
                                      ?.split("/")
                                      .slice(4)
                                      .join("/")
                                      .toString()
                                    ? "bg-[#DBEAFE] text-gray-700 px-2"
                                    : "hover:bg-[#0a3a75]/10"
                                  }  flex gap-1  items-center rounded-md capitalize py-2 px-3 text-[16px] font-medium text-[#575757]`}
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
                    location?.hid === String(handleLocalStorage("hid"))
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
                      className={`flex justify-between items-center cursor-pointer py-3 px-2 ${pathLocation?.pathname
                          ?.split("/")
                          .slice(4)
                          .join("/")
                          .toString() ===
                          item?.subLinks[sidebarActiveIndex]?.link
                          ? " text-white rounded-sm bg-primary"
                          : "text-primary"
                        }`}
                    >
                      <div className={`flex gap-2 items-center`}>
                        <span>{item?.icon}</span>

                        <p
                          className={`font-medium text-nowrap ${isOpen ? "block" : "hidden"
                            }  duration-300 overflow-hidden`}
                        >
                          {item.name}
                        </p>
                      </div>

                      {isOpen && (
                        <span
                          className={`${openMenus[index] ? "-rotate-90" : " rotate-90"
                            } ${pathLocation?.pathname
                              ?.split("/")
                              .slice(4)
                              .join("/")
                              .toString() ===
                              item?.subLinks[sidebarActiveIndex]?.link
                              ? " text-white"
                              : ""
                            } ease-linear duration-300 text text-[#575757]/70 mt-1`}
                        >
                          <Arrow />
                        </span>
                      )}
                    </div>
                  ) : (
                    !item?.subLinks && (
                      <div
                        className={`flex gap-2 items-center py-3 px-2  ${pathLocation?.pathname
                            ?.split("/")
                            .slice(4)
                            .join("/")
                            .toString() === item?.link
                            ? "bg-[#0a3a75] text-white rounded-sm"
                            : "text-primary"
                          } `}
                      >
                        <Link
                          to={item.link}
                          className={`flex gap-1 font-medium`}
                        >
                          {item?.icon}
                        </Link>

                        {isOpen && (
                          <Link
                            to={item.link}
                            className={`flex gap-1 font-medium text-nowrap`}
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
                                className={` ${subLink?.link ===
                                    pathLocation?.pathname
                                      ?.split("/")
                                      .slice(4)
                                      .join("/")
                                      .toString()
                                    ? "bg-[#DBEAFE] text-gray-700 px-2"
                                    : "hover:bg-[#0a3a75]/10"
                                  }  flex gap-1  items-center rounded-md capitalize py-2 px-3 text-[16px] font-medium text-[#575757]`}
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
        <AddLocationForm isOpen={isOpenForm} handleClose={handleClose} />
      </div>

      <div
        className="flex items-center gap-1 px-2 py-3 rounded-md bg-primary text-white cursor-pointer"
        onClick={handleLogout}
      >
        <FiLogOut size={20} />
        {isOpen && (
          <button
            className={`${!isOpen ? "w-0" : "w-f"
              } font-medium text-nowrap overflow-hidden`}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

// analyticsandreporting: false;
// bookingEngine: true;
// channelManager: true;
// cms: true;
// conversationaltool: false;
// eazobot: false;
// emailmarketing: false;
// enquiriesManagement: true;
// foodManager: true;
// frontDesk: true;
// gatewayManager: true;
// guestRequestManagement: true;
// humanResourceManagement: true;
// leadgenform: false;
// reservationDesk: true;
// seoManager: true;
// smsmarketing: false;
// socialMedia: true;
// themes: false;
// usermanagement: false;
// whatsappmarketing: false;
