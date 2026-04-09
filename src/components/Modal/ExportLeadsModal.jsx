import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import CustomDropdown from "../ui/Dropdown";

const ExportLeadsModal = ({ isOpen, onClose, onExport, isLoading }) => {
  const [range, setRange] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // 📌 Dropdown options
  const rangeOptions = [
    { label: "All", value: "all" },
    { label: "Last 7 Days", value: "7" },
    { label: "Last 15 Days", value: "15" },
    { label: "Last 30 Days", value: "30" },
  ];

  const handleRangeChange = (value) => {
    setRange(value);
    setStartDate(null);
    setEndDate(null);

    if (value === "all") {
      onExport(null, null); // 🔥 ALL DATA
      return;
    }

    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - Number(value));

    onExport(pastDate, today); // 🔥 API HIT
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    setRange("");

    if (start && end) {
      onExport(start, end); // 🔥 API HIT
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setRange("");
      setStartDate(null);
      setEndDate(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-9999">
      <div className="bg-white p-5 rounded-xl max-w-80 w-full space-y-4 shadow-lg">
        <h3 className="font-semibold text-lg">Export Leads</h3>

        {/* Custom Dropdown */}
        <CustomDropdown
          options={rangeOptions}
          value={range}
          onChange={handleRangeChange}
          placeholder="Select Range"
          className="w-full!"
        />

        {/* Date Picker */}

        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateChange}
          maxDate={new Date()}
          className="border p-2 rounded w-full!"
          wrapperClassName="w-full"
          placeholderText="Select custom date range"
        />

        {/* Buttons */}
        <div className="flex gap-2">
          <button onClick={onClose} className="w-full bg-gray-200 py-2 rounded">
            Close
          </button>

          {isLoading && (
            <button
              disabled
              className="w-full bg-primary text-white py-2 rounded opacity-70"
            >
              Exporting...
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportLeadsModal;
