import { useSelector } from "react-redux";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import { useState } from "react";
import ProfileDropDown from "../components/Popup/ProfileDropDown";

export default function DashboardLayout({ children }) {
  const [sideBarWidth, setSidebarWidth] = useState(247);
  const [isSmooth, setIsSmooth] = useState(true);

  const { isOpen } = useSelector((state) => state.toggle);

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        style={{
          width: isOpen ? ` ${sideBarWidth}px` : "70px",
        }}
        className={`md:block hidden ${
          isSmooth ? "transition-all duration-300" : ""
        } overflow-hidden sm:overflow-hidden`}
      >
        <div>
          <Sidebar
            sideBarWidth={sideBarWidth}
            setSidebarWidth={setSidebarWidth}
            setIsSmooth={setIsSmooth}
          />
        </div>
      </div>

      <div
        style={{
          width: isOpen ? `100%` : "0px",
        }}
        className={` ${isOpen ? "block md:hidden" : "hidden"} ${
          isSmooth ? "transition-all duration-300" : ""
        } overflow-hidden bg-white sm:overflow-hidden w-full`}
      >
        <div>
          <Sidebar
            sideBarWidth={sideBarWidth}
            setSidebarWidth={setSidebarWidth}
            setIsSmooth={setIsSmooth}
            isMobile={true}
          />
        </div>
      </div>

      <div className="flex-1 h-full flex flex-col overflow-hidden scrollbar-hidden bg-[#f8f8fb]">
        <div>
          <Navbar />
        </div>

        <div className="flex-1 h-full overflow-y-auto scrollbar-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
