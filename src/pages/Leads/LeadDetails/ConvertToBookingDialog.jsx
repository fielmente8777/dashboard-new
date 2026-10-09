import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import DatePicker from "../../../components/ui/DatePicker";
import Dialog from "../../../components/ui/Dialog";
import {
  Field,
  Input,
  Select,
  Textarea,
} from "../../../components/ui/Field";
import { useApiAction } from "../../../hooks/useApiAction";
import { useTenant } from "../../../hooks/useTenant";
import {
  useCreateReservationMutation,
  useGetRoomsQuery,
} from "../../../redux/api/bookingApi";

const DAY = 24 * 60 * 60 * 1000;
// CGST and SGST, each on the room charge
const GST_RATE = 0.06;

const formatAmount = (amount) => `₹${amount.toLocaleString("en-IN")}`;

// "12-10-2026" or "12/10/2026" (how older leads store dates) -> "2026-10-12"
const toDateValue = (text) => {
  if (!text) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const [day, month, year] = text.split(/[-/]/);
  return year?.length === 4 ? `${year}-${month}-${day}` : "";
};

const BillRow = ({ label, strong, children }) => (
  <div
    className={`flex justify-between gap-3 ${strong ? "border-t border-app-border! pt-2 font-semibold text-app-text" : "text-app-text-muted"}`}
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
      guests: 1,
      rooms: 1,
      roomType: "",
      specialRequests: "",
    });
  }, [open, lead]);

  if (!form) return null;

  const setField = (name) => (e) => setForm({ ...form, [name]: e.target.value });
  const setValue = (name) => (value) => setForm({ ...form, [name]: value });
  const setCount = (name) => (e) =>
    setForm({ ...form, [name]: Math.max(1, parseInt(e.target.value, 10) || 1) });

  const room = (rooms.data || []).find((item) => item.roomType === form.roomType);
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

  const canCreate =
    form.name.trim() && form.phone.trim() && form.roomType && nights > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Check in" as="div">
            <DatePicker
              value={form.checkIn}
              aria-label="Check in"
              onChange={setValue("checkIn")}
            />
          </Field>
          <Field
            label="Check out"
            as="div"
            hint={
              nights > 0 ? `${nights} ${nights === 1 ? "night" : "nights"}` : ""
            }
          >
            <DatePicker
              value={form.checkOut}
              min={form.checkIn || undefined}
              aria-label="Check out"
              onChange={setValue("checkOut")}
            />
          </Field>
          <Field label="Guests">
            <Input
              type="number"
              min={1}
              value={form.guests}
              onChange={setCount("guests")}
            />
          </Field>
          <Field label="Rooms">
            <Input
              type="number"
              min={1}
              value={form.rooms}
              onChange={setCount("rooms")}
            />
          </Field>
        </div>

        <Field label="Room type">
          <Select
            value={form.roomType}
            onChange={setField("roomType")}
            options={[
              {
                value: "",
                label: rooms.isLoading ? "Loading rooms..." : "Select a room",
              },
              ...(rooms.data || []).map((item) => ({
                value: item.roomType,
                label: `${item.roomName} · ${formatAmount(Number(item.price) || 0)} a night`,
              })),
            ]}
          />
        </Field>

        <Field label="Special requests">
          <Textarea
            rows={2}
            value={form.specialRequests}
            onChange={setField("specialRequests")}
          />
        </Field>

        {room && nights > 0 && (
          <dl className="space-y-2 rounded-lg bg-app-surface-secondary p-4 text-sm">
            <BillRow
              label={`${room.roomName} × ${form.rooms} × ${nights} ${nights === 1 ? "night" : "nights"}`}
            >
              {formatAmount(subtotal)}
            </BillRow>
            <BillRow label="CGST @ 6%">{formatAmount(cgst)}</BillRow>
            <BillRow label="SGST @ 6%">{formatAmount(sgst)}</BillRow>
            <BillRow label="Total" strong>
              {formatAmount(total)}
            </BillRow>
          </dl>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canCreate} loading={isLoading}>
            Create booking
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default ConvertToBookingDialog;
