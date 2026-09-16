import { BsPencil } from "react-icons/bs";
import TrashBin from "../../../components/Icon/TrashBin";

const HotelCard = ({
  hotelId,
  hotel,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="relative min-w-0 rounded-lg bg-gray-100 dark:bg-app-surface p-3 pr-20 transition-colors hover:bg-gray-200/70 dark:hover:bg-app-surface/70">
      <p className="font-medium text-gray-800 dark:text-app-text truncate">
        {hotel.local}
      </p>

      <p className="text-sm text-gray-600 dark:text-app-text-faint break-words">
        {hotel.city}, {hotel.state}, {hotel.country}
      </p>

      <p className="text-xs text-gray-500 dark:text-app-text-faint">
        Pin: {hotel.pinCode}
      </p>

      <div className="absolute right-2 top-2 flex items-center gap-1 z-10">
        <button
          type="button"
          aria-label={`Edit ${hotel.local}`}
          onClick={() => onEdit(hotelId, hotel)}
          className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-app-text-faint hover:bg-white dark:hover:bg-app-surface-secondary"
        >
          <BsPencil className="text-sm" />
        </button>

        <button
          type="button"
          aria-label={`Delete ${hotel.local}`}
          onClick={() => onDelete(hotelId)}
          className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-app-surface-secondary"
        >
          <TrashBin />
        </button>
      </div>
    </div>
  );
};

export default HotelCard;