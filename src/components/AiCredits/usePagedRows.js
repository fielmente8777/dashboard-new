import { useEffect, useMemo, useState } from "react";

// Client-side paging for the AI credit tables (the demo API returns every
// row). Goes back to page 1 whenever the rows change, e.g. after a filter.
export const usePagedRows = (rows, initialLimit = 10) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);

  useEffect(() => setPage(1), [rows, limit]);

  const pageRows = useMemo(
    () => rows.slice((page - 1) * limit, page * limit),
    [rows, page, limit],
  );

  return {
    pageRows,
    pagination: {
      page,
      limit,
      total: rows.length,
      onPageChange: setPage,
      onLimitChange: setLimit,
    },
  };
};
