import { FaHotel } from "react-icons/fa";
import HotelCard from "./HotelCard";
import { CARD, SECTION_TITLE } from "../constants/styles";

const HotelsSection = ({
  hotels,
  onEdit,
  onDelete,
  onAdd,
}) => {
  return (
    <div className={CARD}>

      <div className="flex items-center justify-between gap-3">

        <h3 className={SECTION_TITLE}>
          <FaHotel
            color="orange"
            className="text-xl sm:text-2xl shrink-0"
          />

          Hotels
        </h3>

        <button
          type="button"
          onClick={onAdd}
          className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Add Hotel
        </button>

      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Object.entries(hotels).map(([hotelId, hotel]) => (
          <HotelCard
            key={hotelId}
            hotelId={hotelId}
            hotel={hotel}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

    </div>
  );
};

export default HotelsSection;