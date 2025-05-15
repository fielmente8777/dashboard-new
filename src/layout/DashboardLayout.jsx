import Breadcrumb from "../components/Breadcrumb";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div>
      <Navbar />

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-10 lg:grid-cols-10  xl:grid-cols-10 gap-4">
        <div className="w-full max-sm:hidden col-span-3 lg:col-span-3 xl:col-span-2 bg-white sm:overflow-hidden rounded-sm border">
          {/* <div className=" max-sm:hidden !w-[25%] bg-white sm:overflow-hidden rounded-sm mt-[3.4rem] border"> */}
          <div className="h-[92vh] p-4 overflow-y-scroll scrollbar-hidden">
            <Sidebar />
          </div>
        </div>

        <div className="sm:col-span-2 md:col-span-7 lg:col-span-7 xl:col-span-8 overflow-y-scroll scrollbar-hidden pr-4 sm:overflow-y-auto rounded-sm bg-[#f8f8fb]">
          <div className="h-[92vh] py-4 overflow-auto">
            <Breadcrumb />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
