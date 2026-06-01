import React, { useState } from "react";
import DatePicker from "react-datepicker";

const DatePickerModal = ({ isOpen, onClose, onSave, loading = false }) => {
  const [date, setDate] = useState(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setDate(null);
    onClose();
  };

  const handleSave = () => {
    if (!date) return;

    // ✅ Ensure valid Date object
    const finalDate = new Date(date);

    onSave(finalDate); // API call happens outside
    setDate(null);
  };

  return (
    <div
      className="fixed inset-0 bg-app-surface backdrop-blur-sm flex items-center justify-center z-[99999]"
      onClick={handleClose}
    >
      <div
        className="bg-app-surface rounded-lg p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4 text-center">
          Select Follow Up Date & Time
        </h3>

        <DatePicker
          selected={date}
          onChange={(d) => setDate(d)}
          inline
          minDate={new Date()}
          showTimeSelect
          timeIntervals={5}
          dateFormat="dd/MM/yyyy h:mm aa"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>

          <button
            disabled={!date || loading}
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-app-text dark:text-app-text-faint rounded disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePickerModal;

// // FollowUpDateModal.jsx
// import React, { useState } from "react";
// import DatePicker from "react-datepicker";

// const DatePickerModal = ({ isOpen, onClose, onSave, loading = false }) => {
//   const [date, setDate] = useState(null);

//   if (!isOpen) return null;

//   const handleClose = () => {
//     setDate(null);
//     onClose();
//   };

//   const handleSave = () => {
//     if (!date) return;
//     onSave(date);
//     setDate(null);
//   };

//   return (
//     <div
//       className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-99999"
//       onClick={handleClose}
//     >
//       <div
//         className="bg-white rounded-lg p-6 max-w-auto shadow-lg"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <h3 className="text-lg font-semibold mb-4 text-center">
//           Select Follow Up Date
//         </h3>

//         <DatePicker
//           selected={date}
//           onChange={(d) => setDate(d)}
//           inline
//           minDate={new Date()}
//         />

//         <div className="flex justify-end gap-3 mt-4">
//           <button
//             onClick={handleClose}
//             className="px-4 py-2 bg-gray-300 rounded"
//           >
//             Cancel
//           </button>

//           <button
//             disabled={!date || loading}
//             onClick={handleSave}
//             className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
//           >
//             {loading ? "Saving..." : "Save"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DatePickerModal;
