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
    <div>
      <div className="flex overflow-hidden h-screen">
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

        {/* <div
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
        </div> */}

        <div className="flex-1 flex  flex-col overflow-y-scroll scrollbar-hidden sm:overflow-y-auto bg-[#f8f8fb]">
          <Navbar />

          <div className="overflow-auto flex-1 scrollbar-hidden">
            {/* <Breadcrumb /> */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
