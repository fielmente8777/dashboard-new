import { RotateCcw, Search } from "lucide-react";
import Button from "../../../components/ui/Button";
import DateRange from "../../../components/ui/DateRange";
import { Input } from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";
import { PAYMENT_FILTERS } from "../constants";

const pillClassName = (active) =>
  `inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors ${
    active
      ? "border-primary! bg-primary text-white dark:border-blue-600! dark:bg-blue-600"
      : "border-app-border! bg-app-surface text-app-text-muted hover:text-app-text"
  }`;

// One toolbar for the bookings list.
//   search  - typed text, matched in the page against the loaded bookings
//   filter  - asked of the server (null = all):
//             { type: "dates", from, to } | { type: "payment", status }
// The server takes one filter at a time, so picking stay dates clears the
// payment filter and the other way round.
const BookingFilters = ({ search, onSearchChange, filter, onChange }) => {
  const dates = filter?.type === "dates" ? filter : { from: "", to: "" };
  const payment = filter?.type === "payment" ? filter.status : null;
  const hasAnything = Boolean(filter || search);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-app-border! bg-app-surface p-3 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1 lg:max-w-sm">
        <Icon
          icon={Search}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-app-text-faint"
        />
        <Input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search guest, booking ID, phone or email"
          aria-label="Search bookings"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
        <DateRange
          from={dates.from}
          to={dates.to}
          allowFuture
          placeholder="Stay dates"
          onChange={({ from, to }) =>
            onChange(from && to ? { type: "dates", from, to } : null)
          }
        />

        <div
          role="group"
          aria-label="Payment status"
          className="flex flex-wrap items-center gap-1.5"
        >
          <button
            type="button"
            aria-pressed={!payment}
            onClick={() => payment && onChange(null)}
            className={pillClassName(!payment)}
          >
            All payments
          </button>
          {PAYMENT_FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={payment === option.value}
              onClick={() => onChange({ type: "payment", status: option.value })}
              className={pillClassName(payment === option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {hasAnything && (
          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={() => {
              onSearchChange("");
              onChange(null);
            }}
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default BookingFilters;
