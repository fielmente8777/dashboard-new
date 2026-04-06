import { useState, useCallback } from "react";

const usePagination = ({ initialPage = 1, initialLimit = 10 } = {}) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit);

  const goToPage = useCallback((p) => {
    setPage(p);
  }, []);

  const nextPage = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const changeLimit = useCallback((newLimit) => {
    // console.log("aaya");
    setLimit(newLimit);
    setPage(1); // reset page when limit changes
  }, []);

  return {
    page,
    limit,
    total,
    totalPages,
    setPage,
    setTotal,
    goToPage,
    nextPage,
    prevPage,
    changeLimit,
  };
};

export default usePagination;
