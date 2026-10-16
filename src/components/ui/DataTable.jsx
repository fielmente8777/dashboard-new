import { Skeleton } from "./States";

// columns: [{ key, header, render?(row, index), className? }]
// Pass onRowClick(row) to make the rows clickable.
const DataTable = ({
  columns,
  rows,
  rowKey,
  onRowClick,
  loading = false,
  emptyMessage = "No data found",
  skeletonRows = 5,
}) => (
  <div className="overflow-x-auto rounded-xl border border-app-border! bg-app-surface">
    <table className="w-full min-w-max text-left text-sm">
      <thead className="bg-app-surface-secondary text-xs uppercase tracking-wide text-app-text-muted">
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              className={`whitespace-nowrap px-4 py-3 font-medium ${column.className || ""}`}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {loading &&
          Array.from({ length: skeletonRows }, (_, index) => (
            <tr key={index} className="border-t border-app-border!">
              <td colSpan={columns.length} className="px-4 py-2.5">
                <Skeleton className="h-5" />
              </td>
            </tr>
          ))}

        {!loading && rows.length === 0 && (
          <tr className="border-t border-app-border!">
            <td
              colSpan={columns.length}
              className="px-4 py-10 text-center text-app-text-muted"
            >
              {emptyMessage}
            </td>
          </tr>
        )}

        {!loading &&
          rows.map((row, index) => (
            <tr
              key={rowKey ? rowKey(row, index) : index}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`anim-fade border-t border-app-border! transition-colors hover:bg-app-surface-secondary ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 text-app-text ${column.className || ""}`}
                >
                  {column.render
                    ? column.render(row, index)
                    : (row[column.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
      </tbody>
    </table>
  </div>
);

export default DataTable;
