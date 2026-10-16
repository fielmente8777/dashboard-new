import { BedDouble, CalendarDays, Check, Minus, Plus, User } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import DatePicker from "../../../components/ui/DatePicker";
import Dialog from "../../../components/ui/Dialog";
import { Field, Input, Textarea } from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";
import IconButton from "../../../components/ui/IconButton";
import { Skeleton } from "../../../components/ui/States";
import { useApiAction } from "../../../hooks/useApiAction";
import { useTenant } from "../../../hooks/useTenant";
import {
  useCreateReservationMutation,
  useGetRoomsQuery,
} from "../../../redux/api/bookingApi";

const DAY = 24 * 60 * 60 * 1000;
// CGST and SGST, each on the room charge
const GST_RATE = 0.06;
const MAX_COUNT = 99;

const formatAmount = (amount) => `₹${amount.toLocaleString("en-IN")}`;

// "2026-10-12" -> "Mon, 12 Oct"
const formatDay = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

const pad = (n) => String(n).padStart(2, "0");
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// "12-10-2026" or "12/10/2026" (how older leads store dates) -> "2026-10-12"
const toDateValue = (text) => {
  if (!text) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const [day, month, year] = text.split(/[-/]/);
  return year?.length === 4 ? `${year}-${month}-${day}` : "";
};

const Section = ({ icon, title, children }) => (
  <section className="space-y-3">
    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-app-text-muted">
      <Icon icon={icon} size="sm" /> {title}
    </h3>
    {children}
  </section>
);

// a number with - and + either side, never below 1
const Counter = ({ label, value, onChange }) => (
  <div>
    <span className="mb-1.5 block text-xs font-medium text-app-text-muted">{label}</span>
    <div className="flex items-center justify-between rounded-lg border border-app-border! bg-app-surface p-1">
      <IconButton
        icon={Minus}
        label={`Fewer ${label.toLowerCase()}`}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      />
      <span className="text-sm font-semibold tabular-nums text-app-text" aria-live="polite">
        {value}
      </span>
      <IconButton
        icon={Plus}
        label={`More ${label.toLowerCase()}`}
        disabled={value >= MAX_COUNT}
        onClick={() => onChange(value + 1)}
      />
    </div>
  </div>
);

const RoomOption = ({ room, selected, onSelect }) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={onSelect}
    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
      selected
        ? "border-blue-500! bg-blue-500/10 ring-1 ring-blue-500"
        : "border-app-border! hover:border-app-text-faint!"
    }`}
  >
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-medium text-app-text">{room.roomName}</span>
      <span className="text-xs text-app-text-muted">
        {formatAmount(Number(room.price) || 0)} a night
      </span>
    </span>
    <span
      className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
        selected ? "border-blue-500! bg-blue-500 text-white" : "border-app-border!"
      }`}
    >
      {selected && <Icon icon={Check} size={12} />}
    </span>
  </button>
);

const BillRow = ({ label, strong, children }) => (
  <div
    className={`flex justify-between gap-3 ${strong ? "border-t border-app-border! pt-3 text-base font-semibold text-app-text" : "text-app-text-muted"}`}
  >
    <dt>{label}</dt>
    <dd className="tabular-nums">{children}</dd>
  </div>
);

// Turns a lead into a reservation: the guest, the stay, the room, and the
// bill that follows from them.
const ConvertToBookingDialog = ({ open, lead, onClose }) => {
  const run = useApiAction();
  const { hid, ndid } = useTenant();
  const rooms = useGetRoomsQuery(hid, { skip: !hid || !open });
  const [createReservation, { isLoading }] = useCreateReservationMutation();

  const [form, setForm] = useState(null);

  // start from what the lead already told us
  useEffect(() => {
    if (!open) return;
    setForm({
      name: lead?.Name || "",
      phone: lead?.Contact || "",
      email: lead?.Email || "",
      address: lead?.Address || "",
      checkIn: toDateValue(lead?.check_in),
      checkOut: toDateValue(lead?.check_out),
      guests: Math.max(1, parseInt(lead?.number_of_guest, 10) || 1),
      rooms: 1,
      roomType: "",
      specialRequests: "",
    });
  }, [open, lead]);

  if (!form) return null;

  const setField = (name) => (e) => setForm({ ...form, [name]: e.target.value });
  const setValue = (name) => (value) => setForm({ ...form, [name]: value });

  const roomList = rooms.data || [];
  const room = roomList.find((item) => item.roomType === form.roomType);
  const nights =
    form.checkIn && form.checkOut
      ? Math.max(
          0,
          Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / DAY),
        )
      : 0;

  const subtotal = room ? (Number(room.price) || 0) * form.rooms * nights : 0;
  const cgst = Math.round(subtotal * GST_RATE);
  const sgst = Math.round(subtotal * GST_RATE);
  const total = subtotal + cgst + sgst;

  // what is still missing, so a disabled button is never a mystery
  const missing = [
    !form.name.trim() && "guest name",
    !form.phone.trim() && "phone number",
    !(form.checkIn && form.checkOut && nights > 0) && "stay dates",
    !form.roomType && "room",
  ].filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (missing.length) return;

    const created = await run(
      createReservation({
        hid,
        ndid,
        guestName: form.name.trim(),
        emailId: form.email.trim(),
        phone: form.phone.trim(),
        city: "",
        address: form.address,
        label: "",
        value: "",
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        adults: form.guests,
        room_type: form.roomType,
        quantity: form.rooms,
        package_id: "",
        package_name: "none",
        package_price: 0,
        package_type: "",
        code: "",
        promo_id: "",
        discount: 0,
        ref_no: "",
        payment_provider: "Stripe",
        mode: "Credit Card",
        status: "Pending",
        pay_id: "",
        total: subtotal,
        tax: cgst + sgst,
        amountPay: total,
        special_request: form.specialRequests,
        checked_in: false,
        checked_out: false,
      }),
      {
        success: "Booking created",
        error: "Could not create the booking.",
      },
    );
    if (created) onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title="Convert to booking"
      description="Create a reservation for this lead."
    >
      <form
        onSubmit={handleSubmit}
        className="grid gap-6 md:grid-cols-[minmax(0,1fr)_16rem]"
      >
        <div className="space-y-6">
          <Section icon={User} title="Guest">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Guest name">
                <Input value={form.name} onChange={setField("name")} />
              </Field>
              <Field label="Phone number">
                <Input type="tel" value={form.phone} onChange={setField("phone")} />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email} onChange={setField("email")} />
              </Field>
              <Field label="Address">
                <Input value={form.address} onChange={setField("address")} />
              </Field>
            </div>
          </Section>

          <Section icon={CalendarDays} title="Stay">
            <Field
              label="Check-in → check-out"
              as="div"
              hint={
                nights > 0
                  ? `${formatDay(form.checkIn)} → ${formatDay(form.checkOut)} · ${nights} ${nights === 1 ? "night" : "nights"}`
                  : form.checkIn
                    ? "Now pick the check-out day."
                    : "Pick the check-in day, then the check-out day."
              }
            >
              <DatePicker
                mode="range"
                aria-label="Stay dates"
                placeholder="Select check-in and check-out"
                min={today()}
                value={{ start: form.checkIn, end: form.checkOut }}
                onChange={({ start, end }) =>
                  setForm({
                    ...form,
                    checkIn: start,
                    // the same day twice is not a stay
                    checkOut: end && end !== start ? end : "",
                  })
                }
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Counter label="Guests" value={form.guests} onChange={setValue("guests")} />
              <Counter label="Rooms" value={form.rooms} onChange={setValue("rooms")} />
            </div>
          </Section>

          <Section icon={BedDouble} title="Room">
            {rooms.isLoading ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : rooms.isError ? (
              <p className="text-sm text-red-500">
                Could not load your rooms.{" "}
                <button type="button" onClick={rooms.refetch} className="underline">
                  Try again
                </button>
              </p>
            ) : roomList.length === 0 ? (
              <p className="rounded-lg border border-dashed border-app-border! p-4 text-sm text-app-text-muted">
                No rooms are set up yet. Add them under Booking Engine → Rooms &amp; inventory.
              </p>
            ) : (
              <div
                role="radiogroup"
                aria-label="Room"
                className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2"
              >
                {roomList.map((item) => (
                  <RoomOption
                    key={item.roomType}
                    room={item}
                    selected={item.roomType === form.roomType}
                    onSelect={() => setValue("roomType")(item.roomType)}
                  />
                ))}
              </div>
            )}
          </Section>

          <Field label="Special requests">
            <Textarea
              rows={2}
              value={form.specialRequests}
              onChange={setField("specialRequests")}
              placeholder="Early check-in, extra bed, airport pickup…"
            />
          </Field>
        </div>

        <aside className="h-fit space-y-4 rounded-xl bg-app-surface-secondary p-4 md:sticky md:top-0">
          <h3 className="text-sm font-semibold text-app-text">Booking summary</h3>

          {room && nights > 0 ? (
            <dl className="space-y-2 text-sm">
              <BillRow label={`${room.roomName} × ${form.rooms}`}>
                {formatAmount((Number(room.price) || 0) * form.rooms)}
              </BillRow>
              <BillRow label={`× ${nights} ${nights === 1 ? "night" : "nights"}`}>
                {formatAmount(subtotal)}
              </BillRow>
              <BillRow label="CGST @ 6%">{formatAmount(cgst)}</BillRow>
              <BillRow label="SGST @ 6%">{formatAmount(sgst)}</BillRow>
              <BillRow label="Total" strong>
                {formatAmount(total)}
              </BillRow>
            </dl>
          ) : (
            <p className="text-sm text-app-text-muted">
              Pick the dates and a room to see the bill.
            </p>
          )}

          <div className="space-y-2">
            <Button
              type="submit"
              className="w-full"
              disabled={missing.length > 0}
              loading={isLoading}
            >
              Create booking
            </Button>
            <Button variant="secondary" className="w-full" onClick={onClose}>
              Cancel
            </Button>
            {missing.length > 0 && (
              <p className="text-xs text-app-text-muted">
                Still needed: {missing.join(", ")}
              </p>
            )}
          </div>
        </aside>
      </form>
    </Dialog>
  );
};

export default ConvertToBookingDialog;
