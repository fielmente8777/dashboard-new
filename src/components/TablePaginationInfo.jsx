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
      <select
        value={limit}
        onChange={(e) => onLimitChange(Number(e.target.value))}
        className="border rounded px-3 py-1 text-sm bg-app-surface!"
      >
        {limitOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TablePaginationInfo;
