import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { IoIosSearch, IoMdClose } from "react-icons/io";
import { IoArrowBack } from "react-icons/io5";
import { getGlobalSearch } from "../../services/api/globalSearch.api";
import { buildLink } from "../../utils/buildLink";

const DROPDOWN_WIDTH = 440;

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

  // ---------- Shared results markup ----------
  const renderResults = () => (
    <>
      <div className="sticky top-0 bg-white dark:bg-zinc-900 px-3 py-2 border-b border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400">
        {data && trimmed.length >= 3 && !loading
          ? `${data.totalMatches} match${data.totalMatches === 1 ? "" : "es"} in ${
              data.modulesMatched
            } module${data.modulesMatched === 1 ? "" : "s"}`
          : "Global search"}
      </div>

      {trimmed.length < 3 && (
        <p className="px-4 py-6 text-sm text-center text-zinc-500 dark:text-zinc-400">
          Type at least 3 characters — phone, email or name
        </p>
      )}

      {trimmed.length >= 3 && loading && (
        <p className="px-4 py-6 text-sm text-center text-zinc-500 dark:text-zinc-400">
          Searching…
        </p>
      )}

      {trimmed.length >= 3 && !loading && error && (
        <p className="px-4 py-6 text-sm text-center text-red-500">{error}</p>
      )}

      {trimmed.length >= 3 &&
        !loading &&
        !error &&
        data?.totalMatches === 0 && (
          <p className="px-4 py-6 text-sm text-center text-zinc-500 dark:text-zinc-400">
            No results for “{trimmed}”
          </p>
        )}

      {trimmed.length >= 3 &&
        !loading &&
        !error &&
        data?.results?.map((group) => (
          <div key={group.key} className="py-1">
            <div className="flex justify-between px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              <span>{group.label}</span>
              <span>{group.total}</span>
            </div>

            {group.items.map((item) => (
              <button
                key={`${group.key}-${item.id}`}
                onClick={() => handleSelect(group, item)}
                className="w-full text-left px-3 py-3 sm:py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:bg-zinc-100 dark:active:bg-zinc-800 transition flex items-start justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 sm:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  {item.subtitle && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {item.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end shrink-0 gap-1">
                  {item.status && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 capitalize">
                      {item.status}
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-400">
                    {formatDate(item.date)}
                  </span>
                </div>
              </button>
            ))}

            {group.total > group.items.length && (
              <p className="px-3 pb-2 text-[11px] text-zinc-400">
                Showing {group.items.length} of {group.total}
              </p>
            )}
          </div>
        ))}
    </>
  );

  // ---------- Mobile: full-screen popup ----------
  const mobilePopup =
    mobileOpen &&
    createPortal(
      <div className="fixed inset-0 z-[9999] flex flex-col bg-white dark:bg-zinc-900 sm:hidden">
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-primary dark:bg-app-navbar">
          <button
            onClick={() => {
              setMobileOpen(false);
              setOpen(false);
            }}
            aria-label="Close search"
            className="shrink-0 size-9 flex items-center justify-center rounded-full text-white"
          >
            <IoArrowBack size={20} />
          </button>

          <div className="relative flex-1">
            <IoIosSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80"
            />
            <input
              ref={mobileInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search phone, email or name…"
              autoFocus
              className="w-full bg-white/15 text-white placeholder-white/70 text-sm rounded-lg pl-9 pr-9 py-2.5 outline-none focus:bg-white/25"
            />
            {query && (
              <button
                onClick={clearSearch}
                aria-label="Clear"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80"
              >
                <IoMdClose size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto text-zinc-800 dark:text-zinc-100">
          {renderResults()}
        </div>
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
        className="hidden sm:block max-h-[70vh] overflow-y-auto rounded-lg shadow-2xl bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700"
      >
        {renderResults()}
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
        className="sm:hidden bg-[#2e3b61] text-white p-1 rounded-md"
        aria-label="Search"
      >
        <IoIosSearch size={22} />
      </button>

      {/* Desktop: inline input */}
      <div className="hidden sm:flex items-center gap-2">
        <div ref={inputBoxRef} className="relative sm:w-72 lg:w-96">
          <IoIosSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search phone, email or name…"
            className="w-full bg-white/15 dark:bg-white/10 text-white placeholder-white/70 text-sm rounded-lg pl-9 pr-16 py-2 outline-none focus:bg-white/25 focus:ring-2 focus:ring-white/40 transition"
          />
          {query ? (
            <button
              onClick={clearSearch}
              aria-label="Clear"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
            >
              <IoMdClose size={16} />
            </button>
          ) : (
            <span className="hidden lg:block absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/70 border border-white/30 rounded px-1.5 py-0.5">
              Ctrl K
            </span>
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
//             <IoArrowBack size={20} />
//           </button>

//           <div className="relative flex-1">
//             <IoIosSearch
//               size={18}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80"
//             />
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
//                 <IoMdClose size={18} />
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
//         <IoIosSearch size={22} />
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
//           <IoIosSearch
//             size={18}
//             className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80"
//           />
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
//               <IoMdClose size={16} />
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
