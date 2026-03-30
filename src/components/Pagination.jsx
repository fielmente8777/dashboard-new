const Pagination = ({ page, totalPages, onPageChange, onNext, onPrev }) => {
  if (!totalPages || totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages = [];

    // If total pages are small → show everything
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first page
    pages.push(1);

    let start = Math.max(2, page - 1);
    let end = Math.min(totalPages - 1, page + 1);

    /**
     * Adjust when near start
     * Example: page 1,2,3 → show 1 2 3 4 ... last
     */
    if (page <= 3) {
      start = 2;
      end = 4;
    }

    /**
     * Adjust when near end
     * Example: last-2 → show first ... last-3 last-2 last-1 last
     */
    if (page >= totalPages - 2) {
      start = totalPages - 3;
      end = totalPages - 1;
    }

    // Left ellipsis
    if (start > 2) {
      pages.push("left-ellipsis");
    }

    // Middle window
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Right ellipsis
    if (end < totalPages - 1) {
      pages.push("right-ellipsis");
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center gap-2 border rounded-md p-2 shadow-sm">
      {/* Prev Button */}
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="px-3 py-1 border rounded disabled:opacity-40"
      >
        ‹
      </button>

      {/* Page Buttons */}
      {visiblePages.map((p) => {
        if (p === "left-ellipsis" || p === "right-ellipsis") {
          return (
            <span key={p} className="px-2 text-gray-500">
              ...
            </span>
          );
        }

        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 border rounded transition ${
              p === Number(page)
                ? "bg-blue-600 text-white border-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={page === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-40"
      >
        ›
      </button>
    </div>
  );
};

export default Pagination;
