import { ChevronLeft, ChevronRight } from "lucide-react";
import CustomDropdown from "./Dropdown";
import Icon from "./Icon";

const LIMIT_OPTIONS = [10, 20, 50, 100].map((value) => ({
  value,
  label: String(value),
}));

// [1, "gap", 4, 5, 6, "gap", 12]: the pages around the current one, plus
// the first and the last.
const getPageItems = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const start = Math.max(2, Math.min(page - 1, totalPages - 4));
  const end = Math.min(totalPages - 1, Math.max(page + 1, 5));
  const middle = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  return [
    1,
    ...(start > 2 ? ["gap-start"] : []),
    ...middle,
    ...(end < totalPages - 1 ? ["gap-end"] : []),
    totalPages,
  ];
};

const STEP =
  "inline-flex size-8 items-center justify-center rounded-lg text-app-text-muted transition hover:bg-app-surface-secondary hover:text-app-text disabled:pointer-events-none disabled:opacity-35";

const Divider = () => (
  <span className="hidden h-6 w-px bg-app-text-faint/25 sm:block" aria-hidden="true" />
);

// The footer of a paged table. It sits on the left and is only as wide as
// its content, so floating buttons in the bottom-right corner never cover it.
//   page, total            - the current page (from 1) and how many items there are
//   limit                  - items per page; with onLimitChange, a "per page" picker
//   totalPages             - when the server says it (otherwise from total / limit)
//   itemLabel              - what is being counted, e.g. "leads"
const TablePagination = ({
  page,
  total,
  limit,
  totalPages: pagesFromServer,
  onPageChange,
  onLimitChange,
  itemLabel = "results",
}) => {
  if (!total) return null;

  const totalPages = Math.max(
    1,
    pagesFromServer || (limit ? Math.ceil(total / limit) : 1),
  );
  const first = limit ? (page - 1) * limit + 1 : 0;
  const last = limit ? Math.min(page * limit, total) : 0;

  return (
    <nav
      aria-label="Pages"
      className="flex w-fit max-w-full flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-app-border! bg-app-surface px-3 py-2 shadow-sm"
    >
      <p className="whitespace-nowrap text-sm text-app-text-muted">
        {limit ? (
          <>
            <span className="font-semibold tabular-nums text-app-text">
              {first.toLocaleString()}–{last.toLocaleString()}
            </span>{" "}
            of{" "}
          </>
        ) : null}
        <span className="font-semibold tabular-nums text-app-text">
          {total.toLocaleString()}
        </span>{" "}
        {itemLabel}
      </p>

      {totalPages > 1 && (
        <>
          <Divider />
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              className={STEP}
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <Icon icon={ChevronLeft} />
            </button>

            {/* every page on wider screens, "2 / 9" on a phone */}
            <span className="px-1.5 text-sm tabular-nums text-app-text-muted sm:hidden">
              <span className="font-semibold text-app-text">{page}</span> /{" "}
              {totalPages}
            </span>
            <div className="hidden items-center gap-0.5 sm:flex">
              {getPageItems(page, totalPages).map((item) =>
                typeof item === "string" ? (
                  <span
                    key={item}
                    className="w-5 select-none text-center text-app-text-faint"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    aria-label={`Page ${item}`}
                    aria-current={item === page ? "page" : undefined}
                    onClick={() => onPageChange(item)}
                    className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-1.5 text-sm tabular-nums transition ${
                      item === page
                        ? "bg-primary font-semibold text-white shadow-sm dark:bg-blue-600"
                        : "text-app-text-muted hover:bg-app-surface-secondary hover:text-app-text"
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              className={STEP}
              aria-label="Next page"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <Icon icon={ChevronRight} />
            </button>
          </div>
        </>
      )}

      {limit && onLimitChange && (
        <>
          <Divider />
          <div className="flex items-center gap-2 text-sm text-app-text-muted">
            <span className="whitespace-nowrap">Per page</span>
            <div className="w-18">
              <CustomDropdown
                key={limit}
                label={limit}
                options={LIMIT_OPTIONS}
                onChange={(value) => onLimitChange(Number(value))}
                className="h-8 border-app-border! py-0! font-medium"
              />
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default TablePagination;
