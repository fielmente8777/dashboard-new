import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { SidebarData } from "../../data/SideBarData";
import { Arrow } from "../../icons/icon";
import { CiLocationOn } from "react-icons/ci";
const Sidebar = () => {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const { user: hotel } = useSelector((state) => state.userProfile);

  const [currentLocation, setCurrentLocation] = useState({});

  const toggleMenu = (index) => {
    setOpenMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSelectLocation = (e, location) => {
    e.stopPropagation();
    setCurrentLocation(location);
  };

  const CountryCode = {
    india: "IN",
    unitedState: "US",
    unitedKingdom: "UK",
    dubai: "UAE",
    australia: "AUS",
  };

  useEffect(() => {
    if (hotel && hotel?.Profile?.hotels) {
      const Locations = Object.values(hotel?.Profile?.hotels);
      setCurrentLocation({
        ...Locations[0],
      });
    }
  }, [hotel]);

  console.log(hotel?.Profile);

  return (
    <div className="flex overflow-x-hidden flex-col gap-2 w-full mb-10 overflow-y-scroll scrollbar-hidden">
      {!hotel ? (
        <div className="bg-gray-100 p-6 animate-pulse rounded-md mb-4" />
      ) : (
        <div
          className="relative border cursor-pointer rounded-md px-2 py-1 flex items-center justify-between mb-4"
          onClick={() => {
            setIsDropDownOpen(!isDropDownOpen);
          }}
        >
          <div className="w-full">
            <p className="text-[14px] capitalize text-[#575757] font-medium">
              {hotel?.Profile?.hotelName || "Eazotel"}
            </p>
            <p className="text-[#575757]/70 text-[13px]">
              {currentLocation?.city}
              {", "}
              {currentLocation?.state}
              {", "}
              {currentLocation?.country}
            </p>

            <div
              className="rounded-sm w-full mx-auto duration-200 transition-all ease-in-out"
              style={{
                maxHeight: isDropDownOpen ? "300px" : "0px",
                overflow: "hidden",
              }}
            >
              <div className="space-y-2 mt-3 w-full">
                {hotel?.Profile?.hotels &&
                  Object.entries(hotel?.Profile?.hotels).map(([key, value]) => {
                    const isCurrentLocation =
                      value?.city === currentLocation?.city &&
                      value?.state === currentLocation?.state &&
                      value?.country === currentLocation?.country;

                    return (
                      <div
                        key={key}
                        className={`cursor-pointer hover:bg-gray-100  duration-150 p-2 ${
                          isCurrentLocation ? "bg-gray-100" : "bg-gray-50"
                        }`}
                        onClick={(e) => handleSelectLocation(e, value)}
                      >
                        <h2 className="text-[14px] font-medium">
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
                  })}
              </div>
            </div>
          </div>

          <div className="-rotate-90 absolute top-5 right-2">
            <span className="-rotate-90 text-[#575757]/70">
              <Arrow />
            </span>
          </div>
        </div>
      )}

      {SidebarData?.map((item, index) => (
        <div key={index} className="flex flex-col gap-1">
          {item?.subLinks ? (
            <div
              onClick={() => toggleMenu(index)}
              className="flex justify-between items-center cursor-pointer"
            >
              <p className=" text-[14px] font-medium text-[#575757]/70 ">
                {item.name}
              </p>
              <span
                className={`${
                  openMenus[index] ? "-rotate-90" : " rotate-90"
                } py-2 ease-linear duration-300 text text-[#575757]/70 mr-1 `}
              >
                <Arrow />
              </span>
            </div>
          ) : (
            <Link
              to={item.link}
              className={`${
                location.pathname === item.link
                  ? "bg-[#0a3a75] text-white px-2 rounded-md"
                  : ""
              }  text-[14px] py-2 font-medium text-[#575757]/70 `}
            >
              {item.name}
            </Link>
          )}

          {openMenus[index] && item?.subLinks && <hr className="border-b" />}

          {openMenus[index] && (
            <div className="space-y-2">
              {item?.subLinks &&
                item.subLinks.map((subLink, index) => (
                  <div className="flex flex-col transition-all duration-100 transform scale-95 opacity-0 animate-fadeIn">
                    <Link
                      to={subLink.link}
                      key={index}
                      className={` ${
                        location.pathname === subLink.link
                          ? "bg-[#0a3a75] text-white px-2"
                          : "hover:bg-[#0a3a75]/10"
                      }  flex gap-1 items-center rounded-md capitalize py-2 px-3 text-[14px] font-medium text-[#575757] transition-all duration-100`}
                    >
                      {subLink.icon} {subLink.name}
                    </Link>
                  </div>
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
