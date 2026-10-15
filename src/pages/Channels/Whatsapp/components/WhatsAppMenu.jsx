import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import Icon from "../../../../components/ui/Icon";

const COLLAPSED_KEY = "whatsappMenuCollapsed";

const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
};

// The WhatsApp section menu. From tablets up it is a side bar that folds down
// to icons (the choice is remembered); on phones it is a scrolling row.
// groups: [{ title?, items: [{ id, label, icon }] }]
const WhatsAppMenu = ({ groups, active, onSelect }) => {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const toggle = () => {
    setCollapsed((prev) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, prev ? "0" : "1");
      } catch {
        // stays as it is for this visit
      }
      return !prev;
    });
  };

  return (
    <nav
      aria-label="WhatsApp settings"
      className={`flex shrink-0 gap-1 overflow-x-auto border-b border-app-border! bg-app-surface px-3 py-2 scrollbar-hidden transition-[width] duration-200 md:flex-col md:gap-0 md:overflow-x-hidden md:overflow-y-auto md:border-b-0 md:border-r md:px-2 md:py-3 ${
        collapsed ? "md:w-16" : "md:w-60"
      }`}
    >
      {groups.map((group, index) => (
        <div
          key={group.title || index}
          className={`flex shrink-0 gap-1 md:flex-col ${index > 0 ? "md:mt-3 md:border-t md:border-app-border! md:pt-3" : ""}`}
        >
          {group.title && !collapsed && (
            <p className="hidden px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-app-text-faint md:block">
              {group.title}
            </p>
          )}
          {group.items.map(({ id, label, icon }) => {
            const current = active === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelect(id)}
                aria-current={current ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  collapsed ? "md:justify-center md:px-0" : ""
                } ${
                  current
                    ? "bg-primary font-medium text-white dark:bg-blue-600"
                    : "text-app-text-muted hover:bg-app-surface-secondary hover:text-app-text"
                }`}
              >
                <Icon icon={icon} className="shrink-0" />
                <span className={collapsed ? "md:sr-only" : ""}>{label}</span>
              </button>
            );
          })}
        </div>
      ))}

      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Expand menu" : "Collapse menu"}
        title={collapsed ? "Expand menu" : "Collapse menu"}
        className={`mt-auto hidden items-center gap-2.5 rounded-lg py-2 text-sm text-app-text-muted transition-colors hover:bg-app-surface-secondary hover:text-app-text md:flex ${
          collapsed ? "justify-center" : "px-3"
        }`}
      >
        {collapsed ? (
          <Icon icon={PanelLeftOpen} className="shrink-0" />
        ) : (
          <>
            <Icon icon={PanelLeftClose} className="shrink-0" />
            Collapse
          </>
        )}
      </button>
    </nav>
  );
};

export default WhatsAppMenu;
