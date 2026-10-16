import { Select } from "./ui/Field";
const TablePaginationInfo = ({
  page,
  limit,
  total,
  onLimitChange,
  limitOptions = [10, 20, 50, 100],
}) => {
  if (!total) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between mt-4 gap-5 bg-app-surface">
      {/* Left Text */}
      <p className="text-sm text-gray-600">
        Results: {start} – {end} of {total}
      </p>

      {/* Right Limit Selector */}
      <Select
        aria-label="Rows per page"
        value={limit}
        onChange={(e) => onLimitChange(Number(e.target.value))}
        className="w-20!"
        options={limitOptions.map((opt) => ({ value: opt, label: String(opt) }))}
      />
    </div>
  );
};

export default TablePaginationInfo;
