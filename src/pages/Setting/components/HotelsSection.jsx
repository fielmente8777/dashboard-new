import { Building2, Plus } from "lucide-react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Icon from "../../../components/ui/Icon";
import { useTenant } from "../../../hooks/useTenant";
import useHotelManager, { EMPTY_HOTEL } from "../hooks/useHotelManager";
import HotelCard from "./HotelCard";
import HotelModal from "./HotelModal";

// The account's hotel locations. Only admins can add, edit or remove them.
const HotelsSection = ({ hotels, canManage, onHotelsChange }) => {
  const { hid } = useTenant();
  const manager = useHotelManager(hotels, onHotelsChange);
  const entries = Object.entries(hotels);

  return (
    <Card
      title={`Locations · ${entries.length}`}
      description="Each location has its own website, bookings and leads."
      actions={
        canManage && (
          <Button size="sm" variant="secondary" icon={Plus} onClick={manager.openAdd}>
            Add location
          </Button>
        )
      }
    >
      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-app-border! p-6 text-center text-sm text-app-text-muted">
          <Icon icon={Building2} size="lg" />
          No locations yet.
        </div>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {entries.map(([hotelId, hotel]) => (
            <HotelCard
              key={hotelId}
              hotel={hotel}
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
    </Card>
  );
};

export default HotelsSection;
