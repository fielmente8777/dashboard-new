import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const DEFAULT_LIMIT = 20;

// filter name -> its name in the URL
const PARAMS = {
  page: "page",
  limit: "limit",
  search: "q",
  stage: "stage",
  source: "source",
  notes: "notes",
  from: "from",
  to: "to",
};

const DEFAULTS = { page: 1, limit: DEFAULT_LIMIT };

// The list filters, kept in the URL so that coming back from a lead (or
// reloading, or sharing the link) shows the same page of the same results.
// Returns [filters, setFilters]; setFilters takes only the filters to change
// and goes back to the first page unless the page itself is being changed.
export const useLeadFilters = () => {
  const [params, setParams] = useSearchParams();

  const filters = useMemo(
    () => ({
      page: Number(params.get(PARAMS.page)) || DEFAULTS.page,
      limit: Number(params.get(PARAMS.limit)) || DEFAULTS.limit,
      search: params.get(PARAMS.search) || "",
      stage: params.get(PARAMS.stage) || "",
      source: params.get(PARAMS.source)?.split(",").filter(Boolean) || [],
      notes: params.get(PARAMS.notes) || "",
      from: params.get(PARAMS.from) || "",
      to: params.get(PARAMS.to) || "",
    }),
    [params],
  );

  const setFilters = useCallback(
    (changes) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (!("page" in changes)) next.delete(PARAMS.page);

          Object.entries(changes).forEach(([name, value]) => {
            const text = Array.isArray(value) ? value.join(",") : String(value);
            // defaults stay out of the URL
            if (!text || value === DEFAULTS[name]) next.delete(PARAMS[name]);
            else next.set(PARAMS[name], text);
          });

          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return [filters, setFilters];
};
