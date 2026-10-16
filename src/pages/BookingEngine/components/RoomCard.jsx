import { useState } from "react";
import MediaCard from "../../../components/ui/MediaCard";
import { getRoomTypeName } from "../constants";

const DESCRIPTION_PREVIEW_LENGTH = 150;

const RoomCard = ({ room, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const description = room.roomDescription || "";
  const isLong = description.length > DESCRIPTION_PREVIEW_LENGTH;

  return (
    <MediaCard
      images={room.roomImage || []}
      title={room.roomName}
      badge={room.roomTypeName || getRoomTypeName(room.roomType)}
      onDelete={() => onDelete(room)}
    >
      {room.roomSubheading && (
        <p className="font-medium text-app-text">{room.roomSubheading}</p>
      )}
      {description && (
        <p>
          {expanded || !isLong
            ? description
            : `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH)}… `}
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="font-medium text-blue-500 hover:underline"
            >
              {expanded ? " Read less" : "Read more"}
            </button>
          )}
        </p>
      )}
      <div className="mt-auto flex items-end justify-between pt-2">
        <p className="text-base font-semibold text-app-text">
          ₹{Number(room.price || 0).toLocaleString("en-IN")}
          <span className="text-xs font-normal text-app-text-muted">
            {" "}
            / night
          </span>
        </p>
        {room.noOfRooms && (
          <p className="text-xs">
            {room.noOfRooms} room{Number(room.noOfRooms) === 1 ? "" : "s"}
          </p>
        )}
      </div>
    </MediaCard>
  );
};

export default RoomCard;
