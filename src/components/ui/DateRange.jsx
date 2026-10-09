import { X } from "lucide-react";
import DatePicker from "./DatePicker";
import IconButton from "./IconButton";

// "YYYY-MM-DD" of today, in local time
const getToday = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
};

// A from / to pair of date pickers. `from` and `to` are "YYYY-MM-DD" strings
// ("" when not set); onChange gets { from, to }. Future dates are not offered
// unless `allowFuture` is passed.
const DateRange = ({ from, to, onChange, allowFuture = false }) => {
  const max = allowFuture ? undefined : getToday();

  return (
    <div className="flex items-center gap-1.5">
      <div className="w-36">
        <DatePicker
          value={from}
          max={to || max}
          placeholder="From"
          aria-label="From date"
          onChange={(value) => onChange({ from: value, to })}
        />
      </div>
      <div className="w-36">
        <DatePicker
          value={to}
          min={from || undefined}
          max={max}
          placeholder="To"
          aria-label="To date"
          onChange={(value) => onChange({ from, to: value })}
        />
      </div>
      {(from || to) && (
        <IconButton
          icon={X}
          label="Clear dates"
          onClick={() => onChange({ from: "", to: "" })}
        />
      )}
    </div>
  );
};

export default DateRange;
