import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />

      <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden scrollbar-hidden bg-app-bg transition-colors duration-200">
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
