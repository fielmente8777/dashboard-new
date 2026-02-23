export const TableSkeleton = ({ rows = 8, columns = 6 }) => {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          <td className="px-3 py-3">
            <div className="h-4 w-6  bg-gray-200 rounded" />
          </td>

          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-3 py-3">
              <div className="h-4 bg-gray-200 rounded w-full" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

export const TableRowSkelton = ({ rows = 8, columns = 4 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse duration-500">
          {/* Index column */}
          <td className="px-3 py-3">
            <div className="h-4 w-full bg-gray-200 rounded" />
          </td>

          {/* Data columns */}
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-3 py-3">
              <div className={`h-4 bg-gray-200 rounded w-full`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};
