import { useState } from "react";
import { useConfirm } from "../../../context/ConfirmContext";
import { useApiAction } from "../../../hooks/useApiAction";
import {
  useCreateHotelMutation,
  useDeleteHotelMutation,
  useUpdateHotelMutation,
} from "../../../redux/api/profileApi";

export const EMPTY_HOTEL = { local: "", city: "", state: "", country: "", pinCode: "" };

const clean = (form) =>
  Object.fromEntries(Object.entries(form).map(([key, value]) => [key, String(value ?? "").trim()]));

// gian expects the client to pick the new hotel's id. Follow the account's
// existing ids: the next number when they are numeric, otherwise a timestamp.
const nextHotelId = (hotels) => {
  const ids = Object.keys(hotels);
  if (ids.length && ids.every((id) => /^\d+$/.test(id))) {
    return String(Math.max(...ids.map(Number)) + 1);
  }
  return String(Date.now());
};

// Add / edit / delete hotel locations. `editor` is null when the dialog is
// closed, { hotelId: null } when adding, { hotelId } when editing.
const useHotelManager = (hotels, onHotelsChange) => {
  const run = useApiAction();
  const { confirm } = useConfirm();
  const [createHotel, createState] = useCreateHotelMutation();
  const [updateHotel, updateState] = useUpdateHotelMutation();
  const [deleteHotel] = useDeleteHotelMutation();

  const [editor, setEditor] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const openAdd = () => setEditor({ hotelId: null, form: EMPTY_HOTEL });
  const openEdit = (hotelId) =>
    setEditor({ hotelId, form: { ...EMPTY_HOTEL, ...hotels[hotelId] } });
  const close = () => setEditor(null);

  const save = async (form) => {
    const body = clean(form);
    const adding = editor.hotelId === null;
    const hotelId = adding ? nextHotelId(hotels) : editor.hotelId;

    const response = await run(
      adding ? createHotel({ hotelId, ...body }) : updateHotel({ hotelId, ...body }),
      {
        success: adding ? "Location added" : "Location updated",
        error: adding ? "Could not add the location." : "Could not update the location.",
      },
    );
    if (!response) return;

    onHotelsChange(
      response.result?.hotels ?? {
        ...hotels,
        [hotelId]: { ...hotels[hotelId], ...body },
      },
    );
    close();
  };

  const remove = async (hotelId) => {
    const name = hotels[hotelId]?.local || "this location";
    const confirmed = await confirm(
      `${name} will be removed from your account. Bookings and leads already recorded for it are not deleted.`,
      { title: "Remove location?", confirmText: "Remove" },
    );
    if (!confirmed) return;

    setDeletingId(hotelId);
    const response = await run(deleteHotel(hotelId), {
      success: "Location removed",
      error: "Could not remove the location.",
    });
    setDeletingId(null);
    if (!response) return;

    const rest = { ...hotels };
    delete rest[hotelId];
    onHotelsChange(rest);
  };

  return {
    editor,
    saving: createState.isLoading || updateState.isLoading,
    deletingId,
    openAdd,
    openEdit,
    close,
    save,
    remove,
  };
};

export default useHotelManager;
