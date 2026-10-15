import Loader from "../../../components/Loader";
import { FIELD, LABEL } from "../constants/styles";

const HotelModal = ({
  hotelForm,
  hotelLoading,
  onChange,
  onClose,
  onSave,
  mode = "edit",
}) => {
  const isAddMode = mode === "add";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-app-surface-secondary p-5 sm:p-6 shadow-2xl">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-app-text">
              {isAddMode ? "Add Hotel" : "Edit Hotel"}
            </h2>

            <p className="text-xs text-gray-500 dark:text-app-text-faint mt-1">
              {isAddMode
                ? "Add new hotel information"
                : "Update hotel information"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={hotelLoading}
            className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-app-surface disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">

          <HotelInput
            id="hotel-local"
            name="local"
            label="Hotel Name"
            value={hotelForm.local}
            onChange={onChange}
            placeholder="Enter hotel name"
          />

          <HotelInput
            id="hotel-city"
            name="city"
            label="City"
            value={hotelForm.city}
            onChange={onChange}
            placeholder="Enter city"
          />

          <HotelInput
            id="hotel-state"
            name="state"
            label="State"
            value={hotelForm.state}
            onChange={onChange}
            placeholder="Enter state"
          />

          <HotelInput
            id="hotel-country"
            name="country"
            label="Country"
            value={hotelForm.country}
            onChange={onChange}
            placeholder="Enter country"
          />

          <HotelInput
            id="hotel-pin"
            name="pinCode"
            label="PIN Code"
            value={hotelForm.pinCode}
            onChange={onChange}
            placeholder="Enter PIN code"
          />

        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button
            type="button"
            onClick={onClose}
            disabled={hotelLoading}
            className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-app-text-faint/25 text-sm text-gray-700 dark:text-app-text-muted disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={hotelLoading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium disabled:opacity-50"
          >
            {hotelLoading ? (
              <>
                <Loader size={16} color="white" />
                {isAddMode ? "Adding..." : "Saving..."}
              </>
            ) : (
              isAddMode ? "Add Hotel" : "Save Changes"
            )}
          </button>

        </div>

      </div>
    </div>
  );
};

const HotelInput = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
}) => (
  <div>
    <label htmlFor={id} className={LABEL}>
      {label}
    </label>

    <input
      id={id}
      name={name}
      type="text"
      value={value}
      onChange={onChange}
      className={FIELD}
      placeholder={placeholder}
    />
  </div>
);

export default HotelModal;