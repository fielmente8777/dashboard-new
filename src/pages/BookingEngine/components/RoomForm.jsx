import { Plus } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { Field, Input, Select, Textarea } from "../../../components/ui/Field";
import ImageListPicker from "../../../components/ui/ImageListPicker";
import { useApiAction } from "../../../hooks/useApiAction";
import { useImageUpload } from "../../../hooks/useImageUpload";
import { useAddRoomMutation } from "../../../redux/api/bookingEngineApi";
import { FACILITIES, ROOM_TYPES, getRoomTypeId } from "../constants";

const ROOM_TYPE_OPTIONS = ROOM_TYPES.map((type) => ({
  value: type,
  label: type,
}));

const EMPTY_FORM = {
  roomType: ROOM_TYPES[0],
  roomName: "",
  roomSubheading: "",
  roomDescription: "",
  child: "0",
  adult: "2",
  noOfRooms: "1",
  price: "",
};

// Adds a room type to the hotel. `onAdded` runs once it is saved.
const RoomForm = ({ hid, onAdded }) => {
  const run = useApiAction();
  const { uploadAll } = useImageUpload();
  const [addRoom] = useAddRoomMutation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [facilities, setFacilities] = useState([]);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const setField = (name) => (e) =>
    setForm({ ...form, [name]: e.target.value });

  const toggleFacility = (facility) =>
    setFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((item) => item !== facility)
        : [...prev, facility],
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const roomImage = await uploadAll(images);
    const added =
      roomImage &&
      (await run(
        addRoom({
          hId: String(hid),
          roomType: String(getRoomTypeId(form.roomType)),
          roomName: form.roomName.trim(),
          roomSubheading: form.roomSubheading.trim(),
          roomDescription: form.roomDescription.trim(),
          child: form.child,
          adult: form.adult,
          noOfRooms: form.noOfRooms,
          price: form.price,
          roomImage,
          roomFacilities: facilities,
          isWeekendFormat: "false",
          changedPrice: { weekend: form.price, weekday: form.price },
        }),
        {
          success: "Room added",
          error:
            "Could not add the room. A room of this type may already exist.",
        },
      ));

    setSaving(false);
    if (added) onAdded();
  };

  return (
    <Card title="Add room">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Room type">
            <Select
              value={form.roomType}
              onChange={setField("roomType")}
              options={ROOM_TYPE_OPTIONS}
            />
          </Field>
          <Field label="Room name">
            <Input
              required
              value={form.roomName}
              onChange={setField("roomName")}
              placeholder="e.g. Sea View Deluxe"
            />
          </Field>
          <Field label="Subheading" className="lg:col-span-2">
            <Input
              value={form.roomSubheading}
              onChange={setField("roomSubheading")}
              placeholder="A short line shown under the name"
            />
          </Field>
          <Field label="Price per night (₹)">
            <Input
              required
              type="number"
              min="0"
              value={form.price}
              onChange={setField("price")}
              placeholder="0"
            />
          </Field>
          <Field label="Adults">
            <Input
              required
              type="number"
              min="1"
              value={form.adult}
              onChange={setField("adult")}
            />
          </Field>
          <Field label="Children">
            <Input
              type="number"
              min="0"
              value={form.child}
              onChange={setField("child")}
            />
          </Field>
          <Field label="Number of rooms">
            <Input
              required
              type="number"
              min="1"
              value={form.noOfRooms}
              onChange={setField("noOfRooms")}
            />
          </Field>
        </div>

        <Field label="Description">
          <Textarea
            required
            rows={5}
            value={form.roomDescription}
            onChange={setField("roomDescription")}
            placeholder="Describe the room"
          />
        </Field>

        <Field label={`Facilities (${facilities.length} selected)`} as="div">
          <div className="flex flex-wrap gap-2">
            {FACILITIES.map((facility) => {
              const selected = facilities.includes(facility);

              return (
                <button
                  key={facility}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleFacility(facility)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    selected
                      ? "border-blue-600! bg-blue-600 text-white"
                      : "border-app-border! text-app-text hover:border-blue-500!"
                  }`}
                >
                  {facility}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Images" as="div">
          <ImageListPicker files={images} onChange={setImages} />
        </Field>

        <div className="flex justify-end">
          <Button type="submit" icon={Plus} loading={saving}>
            Add room
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default RoomForm;
