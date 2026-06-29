import { Calendar } from "lucide-react";
import CustomDropdown from "../../../../components/ui/Dropdown";
import { getDateRange } from "../../../../utils/dateRange";

const DATE_RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7days", label: "Last 7 days" },
  { value: "30days", label: "Last 30 days" },
  { value: "90days", label: "Last 90 days" },
  // { value: "custom", label: "Custom" },
];

const Header = ({ selectedRange, onRangeChange }) => {
  const handleRangeChange = (value) => {
    if (value === "custom") {
      // setShowDatePicker(true);
      return;
    }

    onRangeChange({
      type: value,
      ...getDateRange(value),
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Call Analytics</h1>

        <p className="mt-1 text-sm text-slate-500">
          Monitor call performance and trends.
        </p>
      </div>

      <div className="relative flex items-center bg-white">
        {/* <Calendar
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        /> */}

        <div>
          <CustomDropdown
            options={DATE_RANGE_OPTIONS}
            label={selectedRange}
            onChange={(value) => handleRangeChange(value)}
            className="min-w-36"
          />
        </div>

        {/* <select
            value={selectedRange}
            onChange={(e) => onRangeChange(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-blue-500"
          >
            {DATE_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select> */}
      </div>
    </div>
  );
};

export default Header;
