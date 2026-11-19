import { Building2, Plus } from "lucide-react";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Icon from "../../../components/ui/Icon";
import SettingsCard from "../../../components/ui/SettingsCard";
import { useTenant } from "../../../hooks/useTenant";
import useHotelManager, { EMPTY_HOTEL } from "../hooks/useHotelManager";
import HotelCard from "./HotelCard";
import HotelModal from "./HotelModal";

// The account's hotel locations. Only admins can add, edit or remove them.
const HotelsSection = ({ id, hotels, hotelName, canManage, onHotelsChange }) => {
  const { hid } = useTenant();
  const manager = useHotelManager(hotels, onHotelsChange);
  const entries = Object.entries(hotels);

  return (
    <SettingsCard
      id={id}
      icon={Building2}
      title={
        <span className="flex items-center gap-2">
          Locations <Badge>{entries.length}</Badge>
        </span>
      }
      description="Each location has its own website, bookings and leads."
      actions={
        canManage && (
          <Button size="sm" variant="secondary" icon={Plus} onClick={manager.openAdd}>
            Add location
          </Button>
        )
      }
      footer={
        !canManage && <span>Only admins can add, edit or remove locations.</span>
      }
    >
      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-app-border! px-6 py-10 text-center text-sm text-app-text-muted">
          <span className="flex size-10 items-center justify-center rounded-full bg-app-surface-secondary">
            <Icon icon={Building2} size="lg" />
          </span>
          <span className="font-medium text-app-text">No locations yet</span>
          {canManage && <span>Add your first property to start taking bookings and leads.</span>}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {entries.map(([hotelId, hotel]) => (
            <HotelCard
              key={hotelId}
              hotel={hotel}
              hotelName={hotelName}
              current={hotelId === hid}
              deleting={manager.deletingId === hotelId}
              onEdit={canManage ? () => manager.openEdit(hotelId) : undefined}
              onDelete={canManage ? () => manager.remove(hotelId) : undefined}
            />
          ))}
        </ul>
      )}

      <HotelModal
        open={Boolean(manager.editor)}
        adding={manager.editor?.hotelId === null}
        initial={manager.editor?.form ?? EMPTY_HOTEL}
        saving={manager.saving}
        onClose={manager.close}
        onSave={manager.save}
      />
    </SettingsCard>
  );
};

export default HotelsSection;
