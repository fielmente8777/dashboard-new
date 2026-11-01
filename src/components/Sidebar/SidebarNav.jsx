import { Settings } from "lucide-react";
import { createElement, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { PAGES, dashboardPath } from "../../routes/paths";
import { useSidebarItems } from "./hooks/useSidebarItems";
import SidebarNavItem from "./SidebarNavItem";

// pinned below the scrolling menu
const settingsItem = {
  name: "Settings",
  link: PAGES.SETTINGS,
  icon: createElement(Settings, { size: 18, strokeWidth: 1.75 }),
};

const SectionHeading = ({ collapsed, children }) =>
  collapsed ? (
    <div aria-hidden="true" className="mx-3 my-3 h-px bg-white/10" />
  ) : (
    <p className="px-3 pb-1.5 pt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/40">
      {children}
    </p>
  );

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

    // opening another section goes to its first page inside the dashboard
    const firstPage = item.subLinks.find(
      (subLink) => !/^https?:\/\//.test(subLink.link),
    );
    if (isOpening && activeGroup !== index && firstPage) {
      navigate(dashboardPath(firstPage.link));
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-2 overflow-hidden px-3 pt-2">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="h-9 animate-pulse rounded-lg bg-white/[0.06]"
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <nav
        aria-label="Main"
        className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-3 pb-3 scrollbar-hidden"
      >
        {items.map((item, index) => (
          <div key={`${item.name}-${index}`}>
            {item.section && item.section !== items[index - 1]?.section && (
              <SectionHeading collapsed={collapsed}>{item.section}</SectionHeading>
            )}
            <SidebarNavItem
              item={item}
              collapsed={collapsed}
              isActive={isActive}
              isGroupOpen={openGroup === index}
              onGroupClick={() => handleGroupClick(item, index)}
            />
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10! px-3 py-3">
        <SidebarNavItem item={settingsItem} collapsed={collapsed} isActive={isActive} />
      </div>
    </>
  );
};

export default SidebarNav;
