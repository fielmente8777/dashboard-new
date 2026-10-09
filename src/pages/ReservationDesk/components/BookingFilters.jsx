import { RotateCcw, Search } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { Field, Input } from "../../../components/ui/Field";
import Tabs from "../../../components/ui/Tabs";
import { FILTER_TABS, PAYMENT_FILTERS } from "../constants";
import DatePicker from "../../../components/ui/DatePicker";

// Picks which bookings to show. `filter` is the one applied now (null = all):
// { type: "dates", from, to } | { type: "bookingId", id } | { type: "payment", status }
const BookingFilters = ({ filter, onChange }) => {
  const [tab, setTab] = useState("dates");
  const [dates, setDates] = useState({ from: "", to: "" });
  const [bookingId, setBookingId] = useState("");

  const hasDates = dates.from && dates.to && dates.from <= dates.to;

  const reset = () => {
    setDates({ from: "", to: "" });
    setBookingId("");
    onChange(null);
  };

  return (
    <Card
      title="Filter bookings"
      actions={
        filter && (
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={reset}>
            Show all bookings
          </Button>
        )
      }
    >
      <Tabs tabs={FILTER_TABS} value={tab} onChange={setTab} className="mb-4" />

      {tab === "dates" && (
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            onChange({ type: "dates", ...dates });
          }}
        >
          <Field label="Booking date from" className="w-48">
            <DatePicker
              value={dates.from}
              max={dates.to || undefined}
              onChange={(from) => setDates({ ...dates, from })}
            />
          </Field>
          <Field label="Booking date to" className="w-48">
            <DatePicker
              value={dates.to}
              min={dates.from || undefined}
              onChange={(to) => setDates({ ...dates, to })}
            />
          </Field>
          <Button type="submit" icon={Search} disabled={!hasDates}>
            Show bookings
          </Button>
        </form>
      )}

      {tab === "bookingId" && (
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            onChange({ type: "bookingId", id: bookingId.trim() });
          }}
        >
          <Field label="Booking ID">
            <Input
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Enter booking ID"
            />
          </Field>
          <Button type="submit" icon={Search} disabled={!bookingId.trim()}>
            Show booking
          </Button>
        </form>
      )}

      {tab === "payment" && (
        <div className="flex flex-wrap gap-2">
          {PAYMENT_FILTERS.map((option) => {
            const active =
              filter?.type === "payment" && filter.status === option.value;

            return (
              <Button
                key={option.value}
                variant={active ? "primary" : "secondary"}
                aria-pressed={active}
                onClick={() =>
                  onChange({ type: "payment", status: option.value })
                }
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default BookingFilters;
