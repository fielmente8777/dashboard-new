import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoChevronDown, IoClose } from "react-icons/io5";

export default function CustomDropdown({
  label,
  options,
  onChange,
  width = "w-48",
  zIndex = 99999,
  multiple = false,
  disabled = false,
  ...props
}) {
  const [selected, setSelected] = useState(multiple ? [] : label);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current?.offsetHeight || 260;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < dropdownHeight;

    setPosition({
      width: rect.width,
      left: rect.left,
      top: openUpwards ? rect.top - dropdownHeight - 6 : rect.bottom + 6,
    });
  };

  const toggleDropdown = () => {
    if (disabled) return;

    if (!open) {
      setOpen(true);
      setTimeout(updatePosition, 0);
    } else {
      setOpen(false);
    }
  };

  // const toggleDropdown = () => {
  //   if (disabled) return;

  //   if (!open) {
  //     const rect = buttonRef.current.getBoundingClientRect();
  //     const dropdownHeight = 260;
  //     const spaceBelow = window.innerHeight - rect.bottom;
  //     const openUpwards = spaceBelow < dropdownHeight;

  //     setPosition({
  //       width: rect.width,
  //       left: rect.left + window.scrollX,
  //       top: openUpwards
  //         ? rect.top + window.scrollY - dropdownHeight - 8
  //         : rect.bottom + window.scrollY + 10,
  //     });
  //   }
  //   setOpen(!open);
  // };

  const handleSelect = (opt) => {
    if (disabled) return;

    if (multiple) {
      let updated;

      if (selected.includes(opt.value)) {
        updated = selected.filter((v) => v !== opt.value);
      } else {
        updated = [...selected, opt.value];
      }

      setSelected(updated);
      onChange(updated);
    } else {
      setSelected(opt.value);
      onChange(opt.value);
      setOpen(false);
    }
  };

  const removeItem = (value, e) => {
    e.stopPropagation();
    if (disabled) return;

    const updated = selected.filter((v) => v !== value);
    setSelected(updated);
    onChange(updated);
  };

  const getLabel = (value) => {
    return options?.find((o) => o.value === value)?.label;
  };

  useEffect(() => {
    if (multiple && Array.isArray(label)) {
      setSelected(label);
    } else if (!multiple && label) {
      setSelected(label);
    }
  }, [label, multiple]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  return (
    <div className="relative">
      {/* BUTTON */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        className={`py-2 ${width} flex items-center justify-between px-2 rounded-lg border text-sm ${
          disabled
            ? "bg-app-surface-secondary text-app-text dark:text-app-text-faint cursor-not-allowed"
            : "bg-app-surface-secondary text-app-text dark:text-app-text-faint hover:bg-gray-50/20"
        } ${props.className}`}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {multiple ? (
            selected.length > 0 ? (
              selected.map((val) => (
                <span
                  key={val}
                  className="flex items-center gap-1 bg-primary/10 text-app-text-muted px-2 py-1 rounded-md text-xs"
                >
                  {getLabel(val)}
                  <IoClose
                    size={12}
                    className="cursor-pointer hover:text-red-500"
                    onClick={(e) => removeItem(val, e)}
                  />
                </span>
              ))
            ) : (
              <span className="text-app-text dark:text-app-text-muted">Select</span>
            )
          ) : (
            <span>{getLabel(selected) || label || "Select"}</span>
            // <span>{label?label:""}</span>
          )}
        </div>

        <IoChevronDown
          size={16}
          className={`ml-2 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* DROPDOWN */}
      {open &&
        position &&
        !disabled &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed", // 🔥 IMPORTANT
              width: position.width,
              left: position.left,
              top: position.top,
              zIndex,
            }}
            className="rounded-lg bg-app-surface border border-gray-200 shadow-xl max-h-64 overflow-y-auto"
          >
            {options.map((opt) => {
              const isSelected = multiple
                ? selected.includes(opt.value)
                : selected === opt.value;

              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={`px-3 py-2 text-sm cursor-pointer flex justify-between hover:bg-primary/10 ${
                    isSelected ? "bg-app-surface font-medium" : ""
                  }`}
                >
                  <span>{opt.label}</span>
                  {multiple && isSelected && <span>✔</span>}
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}

// import { useEffect, useRef, useState } from "react";
// import { createPortal } from "react-dom";
// import { IoChevronDown } from "react-icons/io5";

// export default function CustomDropdown({
//   label,
//   options,
//   onChange,
//   width = "w-48",
//   zIndex = 99999,
//   ...props
// }) {
//   const [selected, setSelected] = useState(label || options[0]?.label);
//   const [open, setOpen] = useState(false);
//   const [position, setPosition] = useState(null);

//   const buttonRef = useRef(null);
//   const dropdownRef = useRef(null);

//   // Close on outside click
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(e.target) &&
//         !buttonRef.current.contains(e.target)
//       ) {
//         setOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   useEffect(() => {
//     if (label) {
//       setSelected(label);
//     }
//   }, [label]);

//   const toggleDropdown = () => {
//     if (!open) {
//       const rect = buttonRef.current.getBoundingClientRect();
//       const dropdownHeight = 260; // approx max height
//       const spaceBelow = window.innerHeight - rect.bottom;
//       const openUpwards = spaceBelow < dropdownHeight;

//       setPosition({
//         width: rect.width,
//         left: rect.left + window.scrollX,
//         top: openUpwards
//           ? rect.top + window.scrollY - dropdownHeight - 8
//           : rect.bottom + window.scrollY + 15,
//       });
//     }
//     setOpen(!open);
//   };

//   return (
//     <div className="relativ">
//       {/* BUTTON */}
//       <button
//         ref={buttonRef}
//         type="button"
//         onClick={toggleDropdown}
//         className={`py-2 ${width} flex items-center justify-between px-3 rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-primary ${props.className}`}
//       >
//         <span className="truncate">{selected}</span>
//         <IoChevronDown
//           size={16}
//           className={`transition-transform ${open ? "rotate-180" : ""}`}
//         />
//       </button>

//       {/* DROPDOWN */}
//       {open &&
//         position &&
//         createPortal(
//           <div
//             ref={dropdownRef}
//             style={{
//               width: position.width,
//               left: position.left,
//               top: position.top,
//               zIndex,
//             }}
//             className="absolute rounded-lg bg-white border border-gray-200 shadow-xl max-h-64 overflow-y-auto wrap-break-word"
//           >
//             {options.map((opt) => (
//               <div
//                 key={opt.value}
//                 onClick={() => {
//                   onChange(opt.value);
//                   setOpen(false);
//                   setSelected(opt.label);
//                 }}
//                 className="px-3 py-2 text-sm cursor-pointer hover:bg-primary/10"
//               >
//                 {opt.label}
//               </div>
//             ))}
//           </div>,
//           document.body,
//         )}
//     </div>
//   );
// }
