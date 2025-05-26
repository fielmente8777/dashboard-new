import { useEffect, useState } from "react";
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
  } = useSelector((state) => state.userProfile);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pathLocation = useLocation();

  console.log(pathLocation?.pathname?.split("/")?.slice(4)?.join("/"));

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
    if (hid && hotel) {
      if (authUser?.isAdmin) {
        const currentLoaction = hotel?.Profile?.hotels[hid];
        setCurrentLocation(currentLoaction);
      } else {
        const assignedLocation = authUser?.assigned_location[0];
        const currentLoaction = hotel?.Profile?.hotels[assignedLocation?.hid];
        setCurrentLocation(currentLoaction);
      }
    }
  }, [hid, hotel]);

  return (
    <div className="flex overflow-x-hidden flex-col gap-2 w-full mb-10 overflow-y-scroll scrollbar-hidden ">
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
            <p className="text-white/90 text-[15px]">
              {currentLocation?.city}
              {", "}
              {currentLocation?.state}
              {", "}
              {currentLocation?.country}
            </p>

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
                            className={`cursor-pointer rounded-sm hover:bg-gray-100  duration-150 p-2 ${isCurrentLocation ? "bg-[#ebf0f7]" : "bg-gray-50"
                              }`}
                            onClick={(e) => handleSelectLocation(e, value, key)}
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
                          className={`cursor-pointer hover:bg-gray-100  duration-150 p-2 ${isCurrentLocation ? "bg-[#ebf0f7]" : "bg-gray-50"
                            }`}
                          onClick={(e) =>
                            handleSelectLocation(e, value, location?.hid)
                          }
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

      {SidebarData?.map((item, index) => {
        if (authUser?.isAdmin) {
          const key = item?.key;
          if (key && !authUser?.accessScope[accessScopeMap[key]]) return null;
          return (
            <div key={index} className="flex flex-col gap-1">
              {item?.subLinks ? (
                <div
                  onClick={() => toggleMenu(index)}
                  className="flex justify-between items-center cursor-pointer"
                >
                  <p className=" text-[16px] font-medium text-[#575757]/70 ">
                    {item.name}

                  </p>
                  <span
                    className={`${openMenus[index] ? "-rotate-90" : " rotate-90"
                      } py-2 ease-linear duration-300 text text-[#575757]/70 mr-1 `}
                  >
                    <Arrow />
                  </span>
                </div>
              ) : (
                <Link
                  to={item.link}
                  className={`${pathLocation.pathname === item.link
                    ? "bg-[#0a3a75] text-white px-2 rounded-md"
                    : ""
                    }  text-[16px] py-2 font-medium text-[#575757]/70 `}
                >
                  {item.name}
                </Link>
              )}

              {openMenus[index] && item?.subLinks && (
                <hr className="border-b" />
              )}

              {openMenus[index] && (
                <div className="space-y-2">
                  {item?.subLinks &&
                    item.subLinks.map((subLink, index) => {
                      console.log(item?.link);
                      return (
                        <div className="flex flex-col">
                          <Link
                            to={subLink.link}
                            key={index}
                            className={` ${subLink?.link ===
                              pathLocation?.pathname
                                ?.split("/")
                                .slice(4)
                                .join("/")
                                .toString()
                              ? "bg-[#0a3a75] text-white px-2"
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
              (location) => location?.hid === String(handleLocalStorage("hid"))
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
              {item?.subLinks ? (
                <div
                  onClick={() => toggleMenu(index)}
                  className="flex justify-between items-center cursor-pointer"
                >
                  <p className=" text-[16px] font-medium text-[#575757]/70 ">
                    {item.name}
                  </p>
                  <span
                    className={`${openMenus[index] ? "-rotate-90" : " rotate-90"
                      } py-2 ease-linear duration-300 text text-[#575757]/70 mr-1 `}
                  >
                    <Arrow />
                  </span>
                </div>
              ) : (
                <Link
                  to={item.link}
                  className={`${pathLocation.pathname === item.link
                    ? "bg-[#0a3a75] text-black px-2 rounded-md"
                    : ""
                    }  text-[16px] py-2 font-medium text-[#575757]/70 `}
                >
                  {item.name}
                  {/* {item.link} */}
                </Link>
              )}

              {openMenus[index] && item?.subLinks && (
                <hr className="border-b" />
              )}

              {openMenus[index] && (
                <div className="space-y-2">
                  {item?.subLinks &&
                    item.subLinks.map((subLink, index) => (
                      <div className="flex flex-col">
                        <Link
                          to={subLink.link}
                          key={index}
                          className={` ${subLink?.link ===
                            pathLocation?.pathname
                              ?.split("/")
                              .slice(4)
                              .join("/")
                            ? "bg-[#0a3a75] text-white px-2"
                            : "hover:bg-[#0a3a75]/10"
                            }  flex  gap-1 items-center rounded-md capitalize py-2 px-3 text-[16px] font-medium text-[#575757] transition-all duration-100`}
                        >
                          {subLink.icon} {subLink.name}
                        </Link>
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        }
      })}

      <AddLocationForm isOpen={isOpenForm} handleClose={handleClose} />
    </div>
  );
};

export default Sidebar;
