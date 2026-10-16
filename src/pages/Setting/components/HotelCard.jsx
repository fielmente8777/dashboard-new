import { MapPin, Pencil, Trash2 } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Icon from "../../../components/ui/Icon";
import IconButton from "../../../components/ui/IconButton";

// "test on bording" -> "Test On Bording"
const titleCase = (text) => String(text || "").replace(/\b\w/g, (c) => c.toUpperCase());

// One location: the hotel's name, then where it is. `hotel.local` is the
// area name (what the location switcher shows), not the hotel's name.
const HotelCard = ({ hotel, hotelName, current, deleting, onEdit, onDelete }) => {
  const parts = [hotel.city, hotel.state, hotel.country].filter(Boolean);
  // skip the area when it only repeats the city / state ("Kolkata, West Bengal")
  const area = hotel.local && !parts.join(", ").startsWith(hotel.local) ? hotel.local : null;
  const place = [area, ...parts].filter(Boolean).join(", ");
  const label = hotel.local || hotel.city || "this location";

  return (
    <li
      className={`flex min-w-0 items-start gap-3 rounded-lg border p-3 transition ${
        current ? "border-blue-500/40! bg-blue-500/5" : "border-app-border! hover:bg-app-surface-secondary"
      } ${deleting ? "opacity-50" : ""}`}
    >
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-app-surface-secondary text-app-text-muted">
        <Icon icon={MapPin} size="sm" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-app-text" title={hotelName}>
            {titleCase(hotelName) || label}
          </span>
          {current && <Badge tone="blue">Current</Badge>}
        </p>
        <p className="truncate text-xs text-app-text-muted" title={place}>
          {place || "No address yet"}
        </p>
        {hotel.pinCode && <p className="text-xs text-app-text-faint">PIN {hotel.pinCode}</p>}
      </div>
      {onEdit && (
        <div className="flex shrink-0 gap-0.5">
          <IconButton icon={Pencil} label={`Edit ${label}`} size="sm" onClick={onEdit} disabled={deleting} />
          <IconButton
            icon={Trash2}
            label={current ? "You can't remove the location you're using" : `Remove ${label}`}
            tone="danger"
            size="sm"
            onClick={onDelete}
            disabled={deleting || current}
          />
        </div>
      )}
    </li>
  );
};

export default HotelCard;
