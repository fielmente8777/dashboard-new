import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { IoIosSearch, IoMdClose } from "react-icons/io";
import { IoArrowBack } from "react-icons/io5";
import { MessagesSquare, PhoneCall, Search, Sparkles, Users } from "lucide-react";
import { getGlobalSearch } from "../../redux/api/searchApi";
import { askAssistant } from "../chatbot/askAssistant";
import { buildLink } from "../../utils/buildLink";
import Icon from "../ui/Icon";

const DROPDOWN_WIDTH = 480;

// what the search covers, by result group key
const GROUPS = {
  leads: { label: "Leads", icon: Users },
  conversations: { label: "Conversations", icon: MessagesSquare },
  calls: { label: "Calls", icon: PhoneCall },
};

const groupLabelClassName =
  "text-[11px] font-semibold uppercase tracking-wider text-app-text-faint";
const kbdClassName =
  "rounded border border-app-border! bg-app-surface px-1.5 py-0.5 font-sans text-[10px] font-medium text-app-text-muted";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

const GlobalSearch = () => {
  const navigate = useNavigate();
  const hid = localStorage.getItem("hid");

  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: DROPDOWN_WIDTH });

  const wrapperRef = useRef(null);
  const inputBoxRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const abortRef = useRef(null);

  const handleSelect = (group, item) => {
    setOpen(false);
    setMobileOpen(false);
    const link = buildLink(group, item, hid);
    if (link) navigate(link);
  };

  const clearSearch = () => {
    setQuery("");
    setData(null);
    (mobileOpen ? mobileInputRef : inputRef).current?.focus();
  };

  // ---------- Debounced search ----------
  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      abortRef.current?.abort();
      setData(null);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await getGlobalSearch({
          q,
          hid,
          signal: controller.signal,
        });

        const payload = res?.results
          ? res
          : res?.data?.results
            ? res.data
            : res?.result?.data?.results
              ? res.result.data
              : res?.data?.data;

        if (payload) {
          setData(payload);
          setError("");
        }
      } catch (e) {
        setError(e.message || "Search failed");
        setData(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, hid]);

  // ---------- Position the desktop dropdown ----------
  const updatePosition = () => {
    const box = inputBoxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const vw = window.innerWidth;
    const width = Math.min(DROPDOWN_WIDTH, vw - 16);
    const left = Math.max(8, Math.min(rect.right - width, vw - width - 8));
    setPos({ top: rect.bottom + 8, left, width });
  };

  useLayoutEffect(() => {
    if (!open || mobileOpen) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, mobileOpen]);

  // ---------- Outside click, Esc, Ctrl/Cmd + K ----------
  useEffect(() => {
    const onClick = (e) => {
      const t = e.target;
      const insideInput = wrapperRef.current?.contains(t);
      const insideDropdown = dropdownRef.current?.contains(t);
      if (!insideInput && !insideDropdown) setOpen(false);
    };

    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (window.innerWidth < 640) setMobileOpen(true);
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setMobileOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const trimmed = query.trim();

  // Hand the query to the AI assistant, which can answer about any of the data.
  const askAI = () => {
    if (!trimmed) return;
    setOpen(false);
    setMobileOpen(false);
    inputRef.current?.blur();
    setQuery("");
    askAssistant(trimmed);
  };

  const onInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      askAI();
    }
  };

  const summary =
    data && trimmed.length >= 3 && !loading
      ? `${data.totalMatches} match${data.totalMatches === 1 ? "" : "es"} in ${
          data.modulesMatched
        } module${data.modulesMatched === 1 ? "" : "s"}`
      : "Search records or ask AI";

  // ---------- Shared results markup ----------
  const renderResults = () => (
    <>
      <div className="p-1.5">
        <button
          type="button"
          onClick={askAI}
          disabled={!trimmed}
          className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-app-surface-secondary disabled:cursor-default disabled:hover:bg-transparent"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary to-blue-600 text-white dark:from-blue-600 dark:to-indigo-500">
            <Icon icon={Sparkles} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {trimmed ? (
                <>
                  Ask AI{" "}
                  <span className="text-app-text-muted">“{trimmed}”</span>
                </>
              ) : (
                "Ask Eazotel AI anything"
              )}
            </span>
            <span className="block truncate text-xs text-app-text-muted">
              {trimmed
                ? "Get an answer from your hotel’s data"
                : "e.g. How many leads came in this week?"}
            </span>
          </span>
          {trimmed && <kbd className={kbdClassName}>Enter</kbd>}
        </button>
      </div>

      <div className="h-px bg-app-border" />

      {trimmed.length < 3 ? (
        <div className="px-4 py-4">
          <p className={groupLabelClassName}>Search across</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.entries(GROUPS).map(([key, { label, icon }]) => (
              <span
                key={key}
                className="flex items-center gap-1.5 rounded-full border border-app-border! px-2.5 py-1 text-xs font-medium text-app-text-muted"
              >
                <Icon icon={icon} size="xs" />
                {label}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-app-text-muted">
            Type at least 3 characters of a name, phone number or email.
          </p>
        </div>
      ) : loading ? (
        <div className="space-y-1 p-1.5" aria-label="Searching">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 px-2.5 py-2">
              <span className="size-8 shrink-0 animate-pulse rounded-full bg-app-surface-secondary" />
              <span className="flex-1 space-y-1.5">
                <span className="block h-3 w-2/5 animate-pulse rounded bg-app-surface-secondary" />
                <span className="block h-2.5 w-3/5 animate-pulse rounded bg-app-surface-secondary" />
              </span>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="px-4 py-6 text-center text-sm text-red-500">{error}</p>
      ) : data?.totalMatches === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-sm font-medium">No records match “{trimmed}”</p>
          <p className="mt-1 text-xs text-app-text-muted">
            Press Enter to ask AI instead.
          </p>
        </div>
      ) : (
        data?.results?.map((group) => (
          <div key={group.key} className="p-1.5">
            <div className="flex items-center justify-between px-2.5 pb-1 pt-1">
              <span className={`flex items-center gap-1.5 ${groupLabelClassName}`}>
                <Icon icon={GROUPS[group.key]?.icon ?? Search} size="xs" />
                {group.label}
              </span>
              <span className="rounded-full bg-app-surface-secondary px-1.5 py-px text-[10px] font-semibold text-app-text-muted">
                {group.total}
              </span>
            </div>

            {group.items.map((item) => (
              <button
                key={`${group.key}-${item.id}`}
                type="button"
                onClick={() => handleSelect(group, item)}
                className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-app-surface-secondary active:bg-app-surface-secondary"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold uppercase text-primary dark:bg-white/10 dark:text-white">
                  {String(item.title || "?").charAt(0)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {item.title}
                  </span>
                  {item.subtitle && (
                    <span className="block truncate text-xs text-app-text-muted">
                      {item.subtitle}
                    </span>
                  )}
                </span>

                <span className="flex shrink-0 flex-col items-end gap-1">
                  {item.status && (
                    <span className="rounded-full bg-app-surface-secondary px-2 py-0.5 text-[10px] font-medium capitalize text-app-text-muted">
                      {item.status}
                    </span>
                  )}
                  <span className="text-[11px] text-app-text-faint">
                    {formatDate(item.date)}
                  </span>
                </span>
              </button>
            ))}

            {group.total > group.items.length && (
              <p className="px-2.5 pb-1 pt-0.5 text-[11px] text-app-text-faint">
                Showing {group.items.length} of {group.total}
              </p>
            )}
          </div>
        ))
      )}
    </>
  );

  const searchInputClassName =
    "h-9 w-full rounded-lg border border-app-border! bg-app-bg pl-9 text-sm text-app-text placeholder:text-app-text-faint outline-none transition focus:border-ternary/60! focus:bg-app-surface focus:ring-3 focus:ring-ternary/15";

  // ---------- Mobile: full-screen popup ----------
  const mobilePopup =
    mobileOpen &&
    createPortal(
      <div className="fixed inset-0 z-[9999] flex flex-col bg-app-surface text-app-text sm:hidden">
        <div className="flex shrink-0 items-center gap-2 border-b border-app-border! px-3 py-3">
          <button
            onClick={() => {
              setMobileOpen(false);
              setOpen(false);
            }}
            aria-label="Close search"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-app-text-muted hover:bg-app-surface-secondary"
          >
            <Icon icon={IoArrowBack} size="xl" />
          </button>

          <div className="relative flex-1">
            <Icon icon={IoIosSearch} size="lg"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-app-text-faint" />
            <input
              ref={mobileInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Search records or ask AI…"
              enterKeyHint="send"
              autoFocus
              className={`${searchInputClassName} h-10 pr-9`}
            />
            {query && (
              <button
                onClick={clearSearch}
                aria-label="Clear"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-app-text-muted"
              >
                <Icon icon={IoMdClose} size="lg" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">{renderResults()}</div>
      </div>,
      document.body,
    );

  // ---------- Desktop: dropdown ----------
  const dropdown =
    open &&
    !mobileOpen &&
    createPortal(
      <div
        ref={dropdownRef}
        style={{
          position: "fixed",
          top: pos.top,
          left: pos.left,
          width: pos.width,
          zIndex: 9999,
        }}
        className="anim-menu hidden max-h-[70vh] flex-col overflow-hidden rounded-xl border border-app-border! bg-app-surface text-app-text shadow-2xl sm:flex"
      >
        <div className="min-h-0 flex-1 overflow-y-auto">{renderResults()}</div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-app-border! bg-app-bg/60 px-3 py-2 text-[11px] text-app-text-muted">
          <span className="truncate">{summary}</span>
          <span className="flex shrink-0 items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className={kbdClassName}>Enter</kbd> ask AI
            </span>
            <span className="flex items-center gap-1">
              <kbd className={kbdClassName}>Esc</kbd> close
            </span>
          </span>
        </div>
      </div>,
      document.body,
    );

  return (
    <div ref={wrapperRef} className="relative">
      {/* Mobile: search icon */}
      <button
        onClick={() => {
          setMobileOpen(true);
          setOpen(true);
        }}
        className="sm:hidden flex size-9 items-center justify-center rounded-lg text-app-text-muted transition-colors hover:bg-app-surface-secondary hover:text-app-text"
        aria-label="Search"
      >
        <Icon icon={IoIosSearch} size="xl" />
      </button>

      {/* Desktop: inline input */}
      <div className="hidden sm:flex items-center gap-2">
        <div ref={inputBoxRef} className="relative w-full">
          <Icon icon={IoIosSearch} size="lg"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-app-text-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onInputKeyDown}
            placeholder="Search or ask AI…"
            className={`${searchInputClassName} pr-16`}
          />
          {query ? (
            <button
              onClick={clearSearch}
              aria-label="Clear"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-app-text-muted hover:text-app-text"
            >
              <Icon icon={IoMdClose} />
            </button>
          ) : (
            <kbd className={`${kbdClassName} absolute right-2 top-1/2 hidden -translate-y-1/2 lg:block`}>
              Ctrl K
            </kbd>
          )}
        </div>
      </div>

      {dropdown}
      {mobilePopup}
    </div>
  );
};

export default GlobalSearch;

// import { useEffect, useLayoutEffect, useRef, useState } from "react";
// import { createPortal } from "react-dom";
// import { useNavigate } from "react-router-dom";
// import { IoIosSearch, IoMdClose } from "react-icons/io";
// import { getGlobalSearch } from "../../services/api/globalSearch.api"; // 👈 keep your existing import path
// import { BASE_PATH, ROUTES_PATH } from "../../data/constant";
// import { buildLink } from "../../utils/buildLink";

// const DROPDOWN_WIDTH = 440;

// const formatDate = (d) =>
//   d
//     ? new Date(d).toLocaleDateString("en-IN", {
//         day: "numeric",
//         month: "short",
//         year: "numeric",
//       })
//     : "";

// const GlobalSearch = () => {
//   const navigate = useNavigate();
//   const hid = localStorage.getItem("hid");

//   const [query, setQuery] = useState("");
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [open, setOpen] = useState(false);
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [scope, setScope] = useState("hotel"); // "hotel" | "all"
//   const [pos, setPos] = useState({ top: 0, left: 0, width: DROPDOWN_WIDTH });

//   const wrapperRef = useRef(null);
//   const inputBoxRef = useRef(null);
//   const dropdownRef = useRef(null);
//   const inputRef = useRef(null);
//   const abortRef = useRef(null);

//   const handleSelect = (group, item) => {
//     setOpen(false);
//     setMobileOpen(false);
//     const link = buildLink(group, item, hid);
//     if (link) navigate(link);
//   };

//   // ---------- Debounced search ----------
//   useEffect(() => {
//     const q = query.trim();
//     if (q.length < 3) {
//       abortRef.current?.abort();
//       setData(null);
//       setError("");
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     const timer = setTimeout(async () => {
//       abortRef.current?.abort();
//       const controller = new AbortController();
//       abortRef.current = controller;

//       try {
//         const res = await getGlobalSearch({
//           q,
//           hid: scope === "hotel" ? hid : null,
//           signal: controller.signal,
//         });

//         console.log(res);

//         const payload = res?.results
//           ? res
//           : res?.data?.results
//             ? res.data
//             : res?.result?.data?.results
//               ? res.result.data
//               : res?.data?.data;

//         if (payload) {
//           setData(payload);
//           setError("");
//         }
//       } catch (e) {
//         setError(e.message || "Search failed");
//         setData(null);
//       } finally {
//         if (!controller.signal.aborted) setLoading(false);
//       }
//     }, 400);

//     return () => clearTimeout(timer);
//   }, [query, scope, hid]);

//   // ---------- Position dropdown under the input ----------
//   const updatePosition = () => {
//     const box = inputBoxRef.current;
//     if (!box) return;
//     const rect = box.getBoundingClientRect();
//     const vw = window.innerWidth;

//     if (vw < 640) {
//       // mobile: full width under the search bar
//       setPos({ top: rect.bottom + 8, left: 8, width: vw - 16 });
//     } else {
//       const width = Math.min(DROPDOWN_WIDTH, vw - 16);
//       const left = Math.max(8, Math.min(rect.right - width, vw - width - 8));
//       setPos({ top: rect.bottom + 8, left, width });
//     }
//   };

//   useLayoutEffect(() => {
//     if (!open) return;
//     updatePosition();
//     window.addEventListener("resize", updatePosition);
//     window.addEventListener("scroll", updatePosition, true);
//     return () => {
//       window.removeEventListener("resize", updatePosition);
//       window.removeEventListener("scroll", updatePosition, true);
//     };
//   }, [open, mobileOpen]);

//   // ---------- Outside click, Esc, Ctrl/Cmd + K ----------
//   useEffect(() => {
//     const onClick = (e) => {
//       const t = e.target;
//       const insideInput = wrapperRef.current?.contains(t);
//       const insideDropdown = dropdownRef.current?.contains(t);
//       if (!insideInput && !insideDropdown) {
//         setOpen(false);
//         setMobileOpen(false);
//       }
//     };
//     const onKey = (e) => {
//       if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
//         e.preventDefault();
//         setMobileOpen(true);
//         setOpen(true);
//         setTimeout(() => inputRef.current?.focus(), 0);
//       }
//       if (e.key === "Escape") {
//         setOpen(false);
//         setMobileOpen(false);
//         inputRef.current?.blur();
//       }
//     };
//     document.addEventListener("mousedown", onClick);
//     document.addEventListener("keydown", onKey);
//     return () => {
//       document.removeEventListener("mousedown", onClick);
//       document.removeEventListener("keydown", onKey);
//     };
//   }, []);

//   // const handleSelect = (item) => {
//   //   setOpen(false);
//   //   setMobileOpen(false);
//   //   if (item.link) navigate(item.link);
//   // };

//   const clearSearch = () => {
//     setQuery("");
//     setData(null);
//     inputRef.current?.focus();
//   };

//   const trimmed = query.trim();
//   const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
//   const showDropdown = open && (!isMobile || mobileOpen);

//   const mobilePopup =
//     mobileOpen &&
//     createPortal(
//       <div className="fixed inset-0 z-[9999] flex flex-col bg-app-surface sm:hidden">
//         {/* Search bar */}
//         <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-primary dark:bg-app-navbar">
//           <button
//             onClick={() => {
//               setMobileOpen(false);
//               setOpen(false);
//             }}
//             aria-label="Close search"
//             className="shrink-0 size-9 flex items-center justify-center rounded-full text-white"
//           >
//             <Icon icon={IoArrowBack} size="xl" />
//           </button>

//           <div className="relative flex-1">
//             <Icon icon={IoIosSearch} //               size="lg"
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80"
// />
//             <input
//               ref={inputRef}
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               placeholder="Search phone, email or name…"
//               autoFocus
//               className="w-full bg-white/15 text-white placeholder-white/70 text-sm rounded-lg pl-9 pr-9 py-2.5 outline-none focus:bg-white/25"
//             />
//             {query && (
//               <button
//                 onClick={clearSearch}
//                 aria-label="Clear"
//                 className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80"
//               >
//                 <Icon icon={IoMdClose} size="lg" />
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Results */}
//         <div className="flex-1 overflow-y-auto">{renderResults()}</div>
//       </div>,
//       document.body,
//     );

//   // ---------- Dropdown (rendered into document.body) ----------
//   const dropdown = showDropdown
//     ? createPortal(
//         <div
//           ref={dropdownRef}
//           style={{
//             position: "fixed",
//             top: pos.top,
//             left: pos.left,
//             width: pos.width,
//             zIndex: 9999,
//           }}
//           className="max-h-[70vh] overflow-y-auto rounded-lg shadow-2xl bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700"
//         >
//           {/* Header + scope toggle */}
//           <div className="sticky top-0 bg-white dark:bg-zinc-900 flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-700 text-xs">
//             <span className="text-zinc-500 dark:text-zinc-400">
//               {data && trimmed.length >= 3 && !loading
//                 ? `${data.totalMatches} match${data.totalMatches === 1 ? "" : "es"} in ${
//                     data.modulesMatched
//                   } module${data.modulesMatched === 1 ? "" : "s"}`
//                 : "Global search"}
//             </span>
//             {/* {hid && (
//               <div className="flex rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-700">
//                 {[
//                   { key: "hotel", label: "This hotel" },
//                   { key: "all", label: "All hotels" },
//                 ].map((s) => (
//                   <button
//                     key={s.key}
//                     onClick={() => setScope(s.key)}
//                     className={`px-2 py-1 ${
//                       scope === s.key
//                         ? "bg-primary text-white"
//                         : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
//                     }`}
//                   >
//                     {s.label}
//                   </button>
//                 ))}
//               </div>
//             )} */}
//           </div>

//           {/* States */}
//           {trimmed.length < 3 && (
//             <p className="px-4 py-6 text-sm text-center text-zinc-500 dark:text-zinc-400">
//               Type at least 3 characters — phone, email or name
//             </p>
//           )}

//           {trimmed.length >= 3 && loading && (
//             <p className="px-4 py-6 text-sm text-center text-zinc-500 dark:text-zinc-400">
//               Searching…
//             </p>
//           )}

//           {trimmed.length >= 3 && !loading && error && (
//             <p className="px-4 py-6 text-sm text-center text-red-500">
//               {error}
//             </p>
//           )}

//           {trimmed.length >= 3 &&
//             !loading &&
//             !error &&
//             data?.totalMatches === 0 && (
//               <p className="px-4 py-6 text-sm text-center text-zinc-500 dark:text-zinc-400">
//                 No results for “{trimmed}”
//               </p>
//             )}

//           {/* Grouped results */}
//           {trimmed.length >= 3 &&
//             !loading &&
//             !error &&
//             data?.results?.map((group) => (
//               <div key={group.key} className="py-1">
//                 <div className="flex justify-between px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
//                   <span>{group.label}</span>
//                   <span>{group.total}</span>
//                 </div>

//                 {group.items.map((item) => (
//                   <button
//                     key={`${group.key}-${item.id}`}
//                     // onClick={() => handleSelect(item)}
//                     onClick={() => handleSelect(group, item)}
//                     className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-start justify-between gap-3"
//                   >
//                     <div className="min-w-0">
//                       <p className="text-sm font-medium truncate">
//                         {item.title}
//                       </p>
//                       {item.subtitle && (
//                         <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
//                           {item.subtitle}
//                         </p>
//                       )}
//                     </div>
//                     <div className="flex flex-col items-end shrink-0 gap-1">
//                       {item.status && (
//                         <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 capitalize">
//                           {item.status}
//                         </span>
//                       )}
//                       <span className="text-[10px] text-zinc-400">
//                         {formatDate(item.date)}
//                       </span>
//                     </div>
//                   </button>
//                 ))}

//                 {group.total > group.items.length && (
//                   <p className="px-3 pb-2 text-[11px] text-zinc-400">
//                     Showing {group.items.length} of {group.total}
//                   </p>
//                 )}
//               </div>
//             ))}
//         </div>,
//         document.body,
//       )
//     : null;

//   return (
//     <div ref={wrapperRef} className="relative">
//       {/* Mobile: search icon */}
//       <button
//         onClick={() => {
//           setMobileOpen(true);
//           setOpen(true);
//           setTimeout(() => inputRef.current?.focus(), 0);
//         }}
//         className="sm:hidden bg-[#2e3b61] text-white p-1 rounded-md"
//         aria-label="Search"
//       >
//         <Icon icon={IoIosSearch} size="2xl" />
//       </button>

//       {/* Input (inline on desktop, full-width bar on mobile) */}
//       <div
//         className={`${
//           mobileOpen
//             ? "fixed inset-x-0 top-0 z-[9998] p-3 bg-primary dark:bg-app-navbar flex"
//             : "hidden"
//         } sm:static sm:flex sm:p-0 sm:bg-transparent sm:dark:bg-transparent items-center gap-2`}
//       >
//         <div ref={inputBoxRef} className="relative flex-1 sm:w-72 lg:w-96">
//           <Icon icon={IoIosSearch} //             size="lg"
//             className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80"
// />
//           <input
//             ref={inputRef}
//             value={query}
//             onChange={(e) => {
//               setQuery(e.target.value);
//               setOpen(true);
//             }}
//             onFocus={() => setOpen(true)}
//             placeholder="Search phone, email or name…"
//             className="w-full bg-white/15 dark:bg-white/10 text-white placeholder-white/70 text-sm rounded-lg pl-9 pr-16 py-2 outline-none focus:bg-white/25 focus:ring-2 focus:ring-white/40 transition"
//           />
//           {query ? (
//             <button
//               onClick={clearSearch}
//               className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
//               aria-label="Clear"
//             >
//               <Icon icon={IoMdClose} />
//             </button>
//           ) : (
//             <span className="hidden lg:block absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/70 border border-white/30 rounded px-1.5 py-0.5">
//               Ctrl K
//             </span>
//           )}
//         </div>

//         {mobileOpen && (
//           <button
//             onClick={() => {
//               setMobileOpen(false);
//               setOpen(false);
//             }}
//             className="sm:hidden text-white text-sm px-2"
//           >
//             Cancel
//           </button>
//         )}
//       </div>

//       {dropdown}
//     </div>
//   );
// };

// export default GlobalSearch;
