import { useSelector } from "react-redux";
import Breadcrumb from "../components/Breadcrumb";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";

export default function DashboardLayout({ children }) {
  const { isOpen } = useSelector((state) => state.toggle);

  return (
    <div>
      <Navbar />
      <div className="flex gap-4">
        <div
          className={`${
            isOpen ? "w-[330px]" : "w-[70px]"
          } overflow-hidden transition-all duration-300 bg-white sm:overflow-hidden rounded-sm border`}
        >
          {/* <div className=" max-sm:hidden !w-[25%] bg-white sm:overflow-hidden rounded-sm mt-[3.4rem] border"> */}
          <div>
            <Sidebar />
          </div>
        </div>

        <div className="flex-1 overflow-y-scroll scrollbar-hidden pr-4 sm:overflow-y-auto rounded-sm bg-[#f8f8fb]">
          <div className="h-[92vh] py-4 overflow-auto">
            <Breadcrumb />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
