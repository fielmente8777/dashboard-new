import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { dashboardPath } from "../../routes/paths";

const rowClassName =
  "relative flex min-h-9 w-full items-center gap-3 rounded-lg py-2 text-left text-sm font-medium transition-colors";
const idleClassName = "text-white/65 hover:bg-white/[0.06] hover:text-white";
// the orange bar sits on the sidebar's left edge, next to the active row
const activeClassName =
  "bg-white/10 text-white before:absolute before:-left-3 before:inset-y-1.5 before:w-[3px] before:rounded-r-full before:bg-ternary";

const isExternal = (link) => /^https?:\/\//.test(link);

const Icon = ({ active, children }) => (
  <span
    className={`flex size-5 shrink-0 items-center justify-center text-lg ${active ? "text-ternary" : ""}`}
  >
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
    const active = isActive(item.link);

    return (
      <NavLink
        item={item}
        className={`${rowClassName} ${layout} ${active ? activeClassName : idleClassName}`}
      >
        <Icon active={active}>{item.icon}</Icon>
        {!collapsed && <span className="flex-1 truncate">{item.name}</span>}
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
              : "text-white hover:bg-white/[0.06]"
            : idleClassName
        }`}
      >
        <Icon active={hasActiveChild}>{item.icon}</Icon>
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.name}</span>
            <ChevronDown
              size={15}
              className={`shrink-0 opacity-50 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            />
          </>
        )}
      </button>

      <div
        inert={!isExpanded}
        className={`grid transition-[grid-template-rows] duration-200 ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="ml-[21px] mt-0.5 mb-1 space-y-0.5 pl-3 shadow-[inset_1px_0_0_rgba(255,255,255,0.12)]">
            {item.subLinks.map((subLink) => (
              <NavLink
                key={subLink.link}
                item={subLink}
                className={`relative flex min-h-8 items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
                  isActive(subLink.link)
                    ? // the active page is marked on the tree line
                      "bg-white/[0.08] font-medium text-white before:absolute before:-left-3 before:inset-y-1 before:w-0.5 before:rounded-full before:bg-ternary"
                    : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span className="flex size-4 shrink-0 items-center justify-center opacity-80">
                  {subLink.icon}
                </span>
                <span className="truncate">{subLink.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarNavItem;
