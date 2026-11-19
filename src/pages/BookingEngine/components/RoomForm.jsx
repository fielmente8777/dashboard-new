import { BedDouble, Check, ImageIcon, Minus, Plus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { Field, Input, Select, Textarea } from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";
import ImageListPicker from "../../../components/ui/ImageListPicker";
import { useApiAction } from "../../../hooks/useApiAction";
import { useImageUpload } from "../../../hooks/useImageUpload";
import { useAddRoomMutation } from "../../../redux/api/bookingEngineApi";
import { ROOM_TYPES, getRoomTypeId } from "../constants";
import AmenityPicker from "./AmenityPicker";

const MAX_IMAGES = 8;
const PREVIEW_AMENITIES = 6;

const EMPTY_FORM = {
  roomName: "",
  roomSubheading: "",
  roomDescription: "",
  child: "0",
  adult: "2",
  noOfRooms: "1",
  price: "",
};

// −  2  +  for small counts; the value stays a string like the other fields.
const Stepper = ({ label, value, onChange, min = 0, max = 99 }) => {
  const number = Number(value) || 0;
  const set = (next) => onChange(String(Math.min(max, Math.max(min, next))));
  const buttonClassName =
    "flex size-9 shrink-0 items-center justify-center rounded-md text-app-text-muted transition-colors hover:bg-app-surface-secondary hover:text-app-text disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <Field label={label} as="div">
      <div className="flex items-center rounded-lg border border-app-border! bg-app-surface p-0.5">
        <button
          type="button"
          aria-label={`Fewer ${label.toLowerCase()}`}
          disabled={number <= min}
          onClick={() => set(number - 1)}
          className={buttonClassName}
        >
          <Icon icon={Minus} size="sm" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          aria-label={label}
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => set(number)}
          className="w-full min-w-0 bg-transparent text-center text-sm font-semibold tabular-nums text-app-text outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          aria-label={`More ${label.toLowerCase()}`}
          disabled={number >= max}
          onClick={() => set(number + 1)}
          className={buttonClassName}
        >
          <Icon icon={Plus} size="sm" />
        </button>
      </div>
    </Field>
  );
};

// What the guest will see, filled in as the form is typed.
const RoomPreview = ({ form, roomType, amenities, coverUrl, imageCount }) => {
  const price = Number(form.price) || 0;
  const adults = Number(form.adult) || 0;
  const children = Number(form.child) || 0;
  const rooms = Number(form.noOfRooms) || 0;

  return (
    <div className="overflow-hidden rounded-xl border border-app-border! bg-app-surface">
      <div className="relative aspect-[16/10] bg-app-surface-secondary">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-app-text-faint">
            <Icon icon={ImageIcon} size="2xl" />
            <span className="text-xs">Cover photo</span>
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
          {roomType}
        </span>
        {imageCount > 1 && (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] text-white">
            +{imageCount - 1} photos
          </span>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="min-w-0">
          <p className={`truncate font-semibold ${form.roomName ? "text-app-text" : "text-app-text-faint"}`}>
            {form.roomName || "Room name"}
          </p>
          {form.roomSubheading && (
            <p className="mt-0.5 line-clamp-2 text-xs text-app-text-muted">{form.roomSubheading}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-app-text-muted">
          <span className="flex items-center gap-1">
            <Icon icon={Users} size="xs" />
            {adults} adult{adults === 1 ? "" : "s"}
            {children > 0 && ` · ${children} child${children === 1 ? "" : "ren"}`}
          </span>
          <span className="flex items-center gap-1">
            <Icon icon={BedDouble} size="xs" />
            {rooms} room{rooms === 1 ? "" : "s"}
          </span>
        </div>

        {amenities.length > 0 && (
          <ul className="flex flex-wrap gap-1">
            {amenities.slice(0, PREVIEW_AMENITIES).map((name) => (
              <li
                key={name}
                className="rounded-md bg-app-surface-secondary px-2 py-0.5 text-[11px] text-app-text-muted"
              >
                {name}
              </li>
            ))}
            {amenities.length > PREVIEW_AMENITIES && (
              <li className="px-1 py-0.5 text-[11px] text-app-text-faint">
                +{amenities.length - PREVIEW_AMENITIES} more
              </li>
            )}
          </ul>
        )}

        <p className="border-t border-app-border! pt-3 text-lg font-semibold text-app-text">
          ₹{price.toLocaleString("en-IN")}
          <span className="text-xs font-normal text-app-text-muted"> / night</span>
        </p>
      </div>
    </div>
  );
};

const ChecklistItem = ({ done, children }) => (
  <li className={`flex items-center gap-2 text-xs ${done ? "text-app-text" : "text-app-text-muted"}`}>
    <span
      className={`flex size-4 items-center justify-center rounded-full ${
        done ? "bg-emerald-500 text-white" : "border border-app-text-faint!"
      }`}
    >
      {done && <Icon icon={Check} size="xs" />}
    </span>
    {children}
  </li>
);

// Adds a room type to the hotel. `takenTypeIds` are the room type ids the
// hotel already has (one room per type). `onAdded` runs once it is saved.
const RoomForm = ({ hid, takenTypeIds = [], onAdded }) => {
  const run = useApiAction();
  const { uploadAll } = useImageUpload();
  const [addRoom] = useAddRoomMutation();

  const typeOptions = useMemo(
    () =>
      ROOM_TYPES.filter((type) => !takenTypeIds.includes(getRoomTypeId(type))).map(
        (type) => ({ value: type, label: type }),
      ),
    [takenTypeIds],
  );

  const [roomType, setRoomType] = useState(typeOptions[0]?.value || "");
  const [form, setForm] = useState(EMPTY_FORM);
  const [facilities, setFacilities] = useState([]);
  const [images, setImages] = useState([]);
  const [coverUrl, setCoverUrl] = useState(null);
  const [saving, setSaving] = useState(false);

  // a room type added meanwhile (another tab) is no longer offered
  useEffect(() => {
    if (!typeOptions.some((option) => option.value === roomType)) {
      setRoomType(typeOptions[0]?.value || "");
    }
  }, [typeOptions, roomType]);

  useEffect(() => {
    if (!images[0]) {
      setCoverUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(images[0]);
    setCoverUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [images]);

  const setValue = (name) => (value) => setForm((current) => ({ ...current, [name]: value }));
  const setField = (name) => (e) => setValue(name)(e.target.value);

  const checklist = [
    { label: "Name", done: Boolean(form.roomName.trim()) },
    { label: "Price per night", done: Number(form.price) > 0 },
    { label: "Description", done: Boolean(form.roomDescription.trim()) },
    { label: "Amenities", done: facilities.length > 0, optional: true },
    { label: "Photos", done: images.length > 0, optional: true },
  ];
  const isReady = checklist.every((item) => item.optional || item.done);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const roomImage = await uploadAll(images);
    const added =
      roomImage &&
      (await run(
        addRoom({
          hId: String(hid),
          roomType: String(getRoomTypeId(roomType)),
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
          error: "Could not add the room. A room of this type may already exist.",
        },
      ));

    setSaving(false);
    if (added) onAdded();
  };

  if (typeOptions.length === 0) {
    return (
      <Card>
        <p className="py-8 text-center text-sm text-app-text-muted">
          Every room type already has a room. Delete one under All rooms to add it again.
        </p>
      </Card>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <div className="min-w-0 space-y-5">
        <Card title="Basics" description="How the room is named and described to guests.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Room type" hint="Types you already added are not listed.">
              <Select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                options={typeOptions}
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
            <Field label="Subheading" hint="Optional. A short line under the name." className="sm:col-span-2">
              <Input
                value={form.roomSubheading}
                onChange={setField("roomSubheading")}
                placeholder="e.g. King bed · 32 m² · Balcony"
              />
            </Field>
            <Field
              label="Description"
              hint={`${form.roomDescription.length} characters`}
              className="sm:col-span-2"
            >
              <Textarea
                required
                rows={4}
                value={form.roomDescription}
                onChange={setField("roomDescription")}
                placeholder="What makes this room special: bed, size, view, what guests get"
              />
            </Field>
          </div>
        </Card>

        <Card title="Price & guests">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Field label="Price per night" className="col-span-2 lg:col-span-1">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-app-text-muted">
                  ₹
                </span>
                <Input
                  required
                  type="number"
                  inputMode="decimal"
                  min="1"
                  value={form.price}
                  onChange={setField("price")}
                  placeholder="0"
                  className="pl-7"
                />
              </div>
            </Field>
            <Stepper label="Adults" value={form.adult} onChange={setValue("adult")} min={1} max={20} />
            <Stepper label="Children" value={form.child} onChange={setValue("child")} max={20} />
            <Stepper label="Rooms" value={form.noOfRooms} onChange={setValue("noOfRooms")} min={1} max={500} />
          </div>
        </Card>

        <Card
          title="Amenities"
          description="What guests get with this room. Search, pick a category, or add your own."
        >
          <AmenityPicker value={facilities} onChange={setFacilities} />
        </Card>

        <Card
          title="Photos"
          description={`The first photo is the cover. Up to ${MAX_IMAGES}.`}
        >
          <ImageListPicker files={images} onChange={setImages} max={MAX_IMAGES} />
        </Card>
      </div>

      {/* Preview and save: beside the form on desktop, after it on phones */}
      <aside className="min-w-0 space-y-4 lg:sticky lg:top-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-app-text-muted">
          Guest preview
        </p>
        <RoomPreview
          form={form}
          roomType={roomType}
          amenities={facilities}
          coverUrl={coverUrl}
          imageCount={images.length}
        />

        <div className="space-y-3 rounded-xl border border-app-border! bg-app-surface p-4">
          <ul className="space-y-1.5">
            {checklist.map((item) => (
              <ChecklistItem key={item.label} done={item.done}>
                {item.label}
                {item.optional && <span className="text-app-text-faint"> (optional)</span>}
              </ChecklistItem>
            ))}
          </ul>
          <Button
            type="submit"
            icon={Plus}
            loading={saving}
            disabled={!isReady}
            className="w-full"
          >
            Add room
          </Button>
        </div>
      </aside>
    </form>
  );
};

export default RoomForm;
