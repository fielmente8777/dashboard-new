import { Check, ChevronDown, MapPin, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useToast } from "../../context/ToastContext";
import { useLocationSwitcher } from "../../hooks/useLocationSwitcher";
import { useClientAccounts } from "./hooks/useClientAccounts";

const formatAddress = (location) =>
  [location?.city, location?.state, location?.country]
    .filter(Boolean)
    .join(", ");

const optionClassName =
  "flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left transition-colors";

const LocationSwitcher = ({ collapsed, onExpand, onAddLocation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();
  const { authUser, loading } = useSelector((state) => state.userProfile);
  const { hid, locations, currentLocation, switchLocation } =
    useLocationSwitcher();
  const { isOwner, clients, currentClient, search, setSearch, switchClient } =
    useClientAccounts();

  const canAddLocation = authUser?.isAdmin && !isOwner;
  const title =
    currentLocation?.local || currentClient?.hotelName || "Select location";

  const handleSelect = (location) => {
    switchLocation(location.hid);
    setIsOpen(false);
    showToast({ message: `Switched to ${location.local}`, type: "success" });
  };

  if (loading) {
    return <div className="mb-3 h-14 animate-pulse rounded-xl bg-white/10" />;
  }

  // icon rail: one button that opens the full sidebar with the list showing
  if (collapsed) {
    return (
      <button
        type="button"
        title={title}
        aria-label={`Location: ${title}`}
        onClick={() => {
          onExpand();
          setIsOpen(true);
        }}
        className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <MapPin size={18} />
      </button>
    );
  }

  return (
    <div className="mb-3 rounded-xl bg-white/10">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-ternary text-white">
          <MapPin size={18} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold capitalize text-white">
            {title}
          </span>
          {formatAddress(currentLocation) && (
            <span className="block truncate text-xs text-white/60">
              {formatAddress(currentLocation)}
            </span>
          )}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-white/60 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="space-y-1 px-2 pb-2">
          <div className="mb-2 h-px bg-white/10" />

          {isOwner && (
            <div className="relative mb-1">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search accounts"
                aria-label="Search accounts"
                className="h-9 w-full rounded-lg bg-white/10 pl-8 pr-3 text-sm text-white outline-none placeholder:text-white/40 focus:ring-1 focus:ring-ternary"
              />
            </div>
          )}

          <div className="max-h-64 space-y-1 overflow-y-auto scrollbar-hidden">
            {isOwner &&
              clients.map((client) => {
                const hotel = Object.values(client?.hotels || {})[0];
                const isCurrent =
                  currentClient?.hotelName === client?.hotelName;

                return (
                  <button
                    key={client?.ndid || client?.hotelName}
                    type="button"
                    onClick={() => switchClient(client)}
                    className={`${optionClassName} ${isCurrent ? "bg-white/10" : "hover:bg-white/10"}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">
                        {client?.hotelName}
                      </span>
                      <span className="block truncate text-xs text-white/60">
                        {formatAddress(hotel)}
                      </span>
                    </span>
                    {isCurrent && (
                      <Check size={16} className="mt-0.5 text-ternary" />
                    )}
                  </button>
                );
              })}

            {locations.map((location) => {
              const isCurrent = String(location.hid) === String(hid);

              return (
                <button
                  key={location.hid}
                  type="button"
                  disabled={isCurrent}
                  onClick={() => handleSelect(location)}
                  className={`${optionClassName} ${isCurrent ? "cursor-default bg-white/10" : "hover:bg-white/10"}`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium capitalize text-white">
                      {location.local}
                    </span>
                    <span className="block truncate text-xs text-white/60">
                      {formatAddress(location)}
                    </span>
                  </span>
                  {isCurrent && (
                    <Check size={16} className="mt-0.5 text-ternary" />
                  )}
                </button>
              );
            })}
          </div>

          {canAddLocation && (
            <button
              type="button"
              onClick={onAddLocation}
              className="mt-1 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-semibold text-primary transition-colors hover:bg-white/90"
            >
              <Plus size={16} /> Add New Location
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSwitcher;
