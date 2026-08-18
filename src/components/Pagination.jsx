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
      end = 3;
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

  /* shared so every control keeps the same footprint */
  const CELL =
    "h-9 min-w-9 px-2 sm:px-3 shrink-0 flex items-center justify-center rounded-md border border-app-border text-sm text-app-text transition-colors";

  return (
    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 border border-app-border bg-app-surface rounded-lg p-1.5 shadow-sm">
      {/* Prev Button */}
      <button
        onClick={onPrev}
        disabled={page === 1}
        aria-label="Previous page"
        className={`${CELL} leading-none hover:bg-app-surface-secondary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
      >
        ‹
      </button>

      {/* Page Buttons */}
      {visiblePages.map((p) => {
        if (p === "left-ellipsis" || p === "right-ellipsis") {
          return (
            <span
              key={p}
              className="px-1 sm:px-2 shrink-0 text-gray-500 dark:text-app-text-faint select-none"
            >
              ...
            </span>
          );
        }

        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-label={`Go to page ${p}`}
            aria-current={p === Number(page) ? "page" : undefined}
            className={`${CELL} tabular-nums ${
              p === Number(page)
                ? "bg-primary text-white border-primary font-medium"
                : "hover:bg-app-surface-secondary"
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
        aria-label="Next page"
        className={`${CELL} leading-none hover:bg-app-surface-secondary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
      >
        ›
      </button>
    </div>
  );
};

export default Pagination;