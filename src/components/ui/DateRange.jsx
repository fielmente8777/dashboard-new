import DateRangePicker from "./DateRangePicker";

// A from / to filter picked on one calendar. `from` and `to` are
// "YYYY-MM-DD" strings ("" when not set); onChange gets { from, to }.
// Future dates are not offered unless `allowFuture` is passed.
const DateRange = ({ from, to, onChange, allowFuture = false, placeholder = "Any date" }) => {
  // an old link may carry only one end: treat it as that single day
  const start = from || to;
  const value = start ? { start, end: to || from, preset: null } : null;

  return (
    <DateRangePicker
      value={value}
      onChange={(range) =>
        onChange(range ? { from: range.start, to: range.end } : { from: "", to: "" })
      }
      clearable
      allowFuture={allowFuture}
      placeholder={placeholder}
      align="left"
      className="h-9.5 w-full sm:w-64"
    />
  );
};

export default DateRange;
