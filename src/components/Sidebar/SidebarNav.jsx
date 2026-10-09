import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { dashboardPath } from "../../routes/paths";
import { useSidebarItems } from "./hooks/useSidebarItems";
import SidebarNavItem from "./SidebarNavItem";

const SidebarNav = ({ collapsed, onExpand }) => {
  const items = useSidebarItems();
  const loading = useSelector((state) => state.userProfile.loading);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // "/dashboard/client/123/cms/faq" -> "cms/faq"
  const currentPage = pathname.split("/").slice(4).join("/");
  const isActive = (link) =>
    link === ""
      ? currentPage === ""
      : currentPage === link || currentPage.startsWith(`${link}/`);

  const activeGroup = items.findIndex((item) =>
    item.subLinks?.some((subLink) => isActive(subLink.link)),
  );
  const [openGroup, setOpenGroup] = useState(activeGroup);

  // keep the section of the current page open (page load, links from elsewhere)
  useEffect(() => {
    if (activeGroup !== -1) setOpenGroup(activeGroup);
  }, [activeGroup]);

  const handleGroupClick = (item, index) => {
    const isOpening = collapsed || openGroup !== index;
    if (collapsed) onExpand();
    setOpenGroup(isOpening ? index : -1);

    // opening another section goes to its first page
    if (isOpening && activeGroup !== index) {
      navigate(dashboardPath(item.subLinks[0].link));
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-2 overflow-hidden">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="h-10 animate-pulse rounded-lg bg-white/10"
          />
        ))}
      </div>
    );
  }

  return (
    <nav
      aria-label="Main"
      className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hidden"
    >
      {items.map((item, index) => (
        <SidebarNavItem
          key={`${item.name}-${index}`}
          item={item}
          collapsed={collapsed}
          isActive={isActive}
          isGroupOpen={openGroup === index}
          onGroupClick={() => handleGroupClick(item, index)}
        />
      ))}
    </nav>
  );
};

export default SidebarNav;
