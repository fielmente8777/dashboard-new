import { ChevronRight, Search, SearchX } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardPath } from "../../routes/paths";
import Drawer from "../ui/Drawer";
import { inputClassName } from "../ui/Field";
import Icon from "../ui/Icon";
import { EmptyState } from "../ui/States";
import { SERVICE_GROUPS } from "./eazStoreServices";

// The EazStore: every service Eazotel offers, searchable, in a side drawer.
const AppsPopup = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const close = useCallback(() => setOpen(false), [setOpen]);

  // every visit starts with the full list
  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  // the groups with only the services that match the search
  const groups = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return SERVICE_GROUPS;

    return SERVICE_GROUPS.map((group) => ({
      ...group,
      services: group.services.filter((service) =>
        `${service.name} ${service.description}`.toLowerCase().includes(term),
      ),
    })).filter((group) => group.services.length > 0);
  }, [search]);

  const openService = (service) => {
    close();
    navigate(dashboardPath(service.page));
  };

  return (
    <Drawer
      open={open}
      onClose={close}
      title="EazStore"
      description="Services and tools to grow your property."
      header={
        <div className="relative">
          <Icon
            icon={Search}
            tone="muted"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            autoFocus
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services"
            aria-label="Search services"
            className={`${inputClassName} pl-9`}
          />
        </div>
      }
    >
      {groups.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="No service found"
          description={`Nothing matches "${search.trim()}". Try another word.`}
        />
      )}

      <div className="space-y-6">
        {groups.map((group) => (
          <section key={group.title}>
            <h3 className="text-sm font-semibold text-app-text">
              {group.title}
              <span className="ml-2 font-normal text-app-text-muted">
                {group.services.length}
              </span>
            </h3>
            <p className="mb-3 mt-0.5 text-xs text-app-text-muted">
              {group.description}
            </p>

            <ul className="anim-stagger grid grid-cols-1 gap-2 sm:grid-cols-2">
              {group.services.map((service) => (
                <li key={service.name}>
                  <button
                    type="button"
                    onClick={() => openService(service)}
                    className="anim-lift group flex w-full items-center gap-3 rounded-xl border border-app-border! bg-app-surface p-3 text-left hover:border-blue-500!"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                      <Icon icon={service.icon} size="xl" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-app-text">
                        {service.name}
                      </span>
                      <span className="block truncate text-xs text-app-text-muted">
                        {service.description}
                      </span>
                    </span>
                    <Icon
                      icon={ChevronRight}
                      tone="faint"
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Drawer>
  );
};

export default AppsPopup;
