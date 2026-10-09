import { BedDouble } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import PageShell from "../../components/ui/PageShell";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import Tabs from "../../components/ui/Tabs";
import { useConfirm } from "../../context/ConfirmContext";
import { useApiAction } from "../../hooks/useApiAction";
import { useGetRoomsQuery } from "../../redux/api/bookingApi";
import { useDeleteRoomMutation } from "../../redux/api/bookingEngineApi";
import { selectHid } from "../../redux/slice/UserSlice";
import RoomCard from "./components/RoomCard";
import RoomForm from "./components/RoomForm";

const BookingSetup = () => {
  const hid = useSelector(selectHid);
  const { confirm } = useConfirm();
  const run = useApiAction();
  const [tab, setTab] = useState("rooms");
  const rooms = useGetRoomsQuery(hid, {
    skip: !hid,
    refetchOnMountOrArgChange: true,
  });
  const [deleteRoom] = useDeleteRoomMutation();

  const list = rooms.data || [];

  const handleDelete = async (room) => {
    const confirmed = await confirm(
      `Delete ${room.roomName}? Its prices and inventory go with it. This cannot be undone.`,
      { title: "Delete room" },
    );
    if (!confirmed) return;

    await run(deleteRoom({ hid, roomId: room.roomType }), {
      success: "Room deleted",
      error: "Could not delete the room.",
    });
  };

  return (
    <PageShell
      title="Rooms Setup"
      description="The room types guests can book on your booking engine."
      actions={
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "rooms", label: `All rooms (${list.length})` },
            { value: "add", label: "Add room" },
          ]}
        />
      }
    >
      {tab === "add" && <RoomForm hid={hid} onAdded={() => setTab("rooms")} />}

      {tab === "rooms" && rooms.isError && (
        <ErrorState
          message="Could not load the rooms."
          onRetry={rooms.refetch}
        />
      )}

      {tab === "rooms" && !rooms.isError && (
        <>
          {!rooms.isLoading && list.length === 0 ? (
            <EmptyState
              icon={BedDouble}
              title="No rooms yet"
              description="Add your first room type to start taking bookings."
            />
          ) : (
            <div className="anim-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {rooms.isLoading
                ? Array.from({ length: 4 }, (_, index) => (
                    <Skeleton key={index} className="h-80" />
                  ))
                : list.map((room) => (
                    <RoomCard
                      key={room.roomType}
                      room={room}
                      onDelete={handleDelete}
                    />
                  ))}
            </div>
          )}
        </>
      )}
    </PageShell>
  );
};

export default BookingSetup;
