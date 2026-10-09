import CustomDropdown from "./Dropdown";

const dropdownClassName =
  "border-primary/60! w-40! p-1! rounded-md! bg-app-surface-secondary! z-9!";

// A dropdown that sits in a table cell: shows `value` and reports the option
// picked. `id` is the row's id; with it the cell goes back to the saved value
// when the row changes. Clicking it never counts as a click on the row.
const CellSelect = ({ id, value, options, onSelect }) => (
  <div onClick={(e) => e.stopPropagation()}>
    <CustomDropdown
      key={`${id}-${value}`}
      label={value}
      options={options}
      onChange={onSelect}
      className={dropdownClassName}
    />
  </div>
);

export default CellSelect;
