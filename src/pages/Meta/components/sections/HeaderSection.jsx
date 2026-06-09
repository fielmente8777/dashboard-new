import React from "react";
import { Calendar, RefreshCw } from "lucide-react";
import DatePicker from "react-datepicker";
import { IoIosClose } from "react-icons/io";

const HeaderSection = ({
  dateRange,
  setDateRange,
  customRange,
  setCustomRange,
}) => {
  const isCustom = dateRange === "custom";

  const setDateRangeCustom = (dates) => {
    const [start, end] = dates;

    setCustomRange({
      startDate: start,
      endDate: end,
    });
  };

  return (
    <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Meta Page Insights
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Track page performance, reach, followers and engagement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 pr-10 text-sm outline-none focus:border-blue-500"
            >
              <option value="today">Today</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_28_days">Last 28 Days</option>
              <option value="last_90_days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {isCustom && (
            <div className="relative">
              <div className="h-10 px-3 flex items-center rounded-lg border border-gray-300 bg-app-surface-secondary focus-within:ring-2 focus-within:ring-primary">
                <DatePicker
                  selectsRange
                  startDate={customRange.startDate}
                  endDate={customRange.endDate}
                  maxDate={new Date()}
                  onChange={(update) => setDateRangeCustom(update)}
                  className="bg-transparent outline-none text-sm w-40"
                  placeholderText="Date range"
                  //   popperClassName="z-99999!"
                />
              </div>

              {customRange.startDate && customRange.endDate && (
                <span
                  onClick={() => {
                    setCustomRange({ startDate: null, endDate: null });
                  }}
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white cursor-pointer"
                >
                  <IoIosClose size={18} />
                </span>
              )}
            </div>
          )}

          {/* <button
            onClick={onRefresh}
            className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:opacity-90"
          >
            <RefreshCw size={16} />
            Refresh
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default HeaderSection;
