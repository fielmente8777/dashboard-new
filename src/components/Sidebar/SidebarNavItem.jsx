import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { dashboardPath } from "../../routes/paths";

const rowClassName =
  "flex min-h-10 w-full items-center gap-3 rounded-lg py-2 text-left text-sm font-medium transition-colors";
const idleClassName = "text-white/70 hover:bg-white/10 hover:text-white";
const activeClassName = "bg-ternary text-white shadow-sm";

const isExternal = (link) => /^https?:\/\//.test(link);

const Icon = ({ children }) => (
  <span className="flex size-5 shrink-0 items-center justify-center text-lg">
    {children}
  </span>
);

// A single link. Full web addresses open in a new tab.
const NavLink = ({ item, className, children }) =>
  isExternal(item.link) ? (
    <a
      href={item.link}
      target="_blank"
      rel="noreferrer"
      title={item.name}
      className={className}
    >
      {children}
    </a>
  ) : (
    <Link
      to={dashboardPath(item.link)}
      target={item.target ? "_blank" : undefined}
      title={item.name}
      className={className}
    >
      {children}
    </Link>
  );

const SidebarNavItem = ({
  item,
  collapsed,
  isActive,
  isGroupOpen,
  onGroupClick,
}) => {
  const layout = collapsed ? "justify-center px-0" : "px-3";

  if (!item.subLinks) {
    return (
      <NavLink
        item={item}
        className={`${rowClassName} ${layout} ${isActive(item.link) ? activeClassName : idleClassName}`}
      >
        <Icon>{item.icon}</Icon>
        {!collapsed && <span className="flex-1">{item.name}</span>}
      </NavLink>
    );
  }

  const hasActiveChild = item.subLinks.some((subLink) =>
    isActive(subLink.link),
  );
  const isExpanded = isGroupOpen && !collapsed;

  return (
    <div>
      <button
        type="button"
        title={item.name}
        aria-expanded={isExpanded}
        onClick={onGroupClick}
        className={`${rowClassName} ${layout} ${
          hasActiveChild
            ? collapsed
              ? activeClassName
              : "text-white hover:bg-white/10"
            : idleClassName
        }`}
      >
        <Icon>{item.icon}</Icon>
        {!collapsed && (
          <>
            <span className="flex-1">{item.name}</span>
            <ChevronDown
              size={16}
              className={`shrink-0 opacity-60 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            />
          </>
        )}
      </button>

      <div
        inert={!isExpanded}
        className={`grid transition-[grid-template-rows] duration-200 ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="ml-[22px] mt-1 space-y-0.5 pl-3 shadow-[inset_1px_0_0_rgba(255,255,255,0.14)]">
            {item.subLinks.map((subLink) => (
              <NavLink
                key={subLink.link}
                item={subLink}
                className={`flex min-h-9 items-center gap-2 rounded-md px-3 py-1.5 text-sm capitalize transition-colors ${
                  isActive(subLink.link)
                    ? `${activeClassName} font-medium`
                    : "text-white/65 hover:bg-white/10 hover:text-white"
                }`}
              >
                {subLink.icon}
                <span>{subLink.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarNavItem;
