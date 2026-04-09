import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoChevronDown } from "react-icons/io5";

export default function CustomSubDropdown({
  options = [],
  onChange,
  placeholder = "Select category",
  disabled = false,
  zIndex = 9999,
  label,
  ...props
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState({
    label: label,
  });
  const [position, setPosition] = useState(null);

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // 📍 Dynamic position (same as your main dropdown)
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

  // 🎯 Select child
  const handleSelect = (parent, child) => {
    if (disabled) return;

    const value = {
      parentLabel: parent.label,
      parentValue: parent.value,
      label: child.label,
      value: child.value,
    };

    setSelected(value);
    onChange?.(value);
    setOpen(false);
  };

  useEffect(() => {
    setSelected({
      label: label,
    });
  }, [label]);

  // ❌ Close on outside click
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

  // 🔄 Recalculate on scroll/resize
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
        className={`py-2 max-w-40 w-full flex items-center justify-between px-3 rounded-lg border text-sm ${
          disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50"
        } ${props.className}`}
      >
        <span className={selected ? "" : "text-gray-400"}>
          {selected?.label ? selected.label : placeholder}
        </span>

        <IoChevronDown
          size={16}
          className={`ml-2 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* DROPDOWN (PORTAL) */}
      {open &&
        position &&
        !disabled &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              width: position.width,
              left: position.left,
              top: position.top,
              zIndex,
            }}
            className="rounded-lg bg-white border border-gray-200 shadow-xl max-h-64 overflow-y-auto"
          >
            {options.map((group) => (
              <div key={group.value}>
                {/* 🔹 HEADER */}
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                  {group.label}
                </div>

                {/* 🔹 CHILDREN */}
                {group.children?.map((child) => {
                  const isSelected = selected?.value === child.value;

                  return (
                    <div
                      key={child.value}
                      onClick={() => handleSelect(group, child)}
                      className={`px-4 py-2 text-sm cursor-pointer flex justify-between hover:bg-primary/10 ${
                        isSelected ? "bg-primary/10 font-medium" : ""
                      }`}
                    >
                      <span>{child.label}</span>
                      {isSelected && <span>✔</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

// import { useState } from "react";

// export default function CustomSubDropdown({ options, onChange }) {
//   const [open, setOpen] = useState(false);
//   const [selected, setSelected] = useState(null);

//   const handleSelect = (parent, child) => {
//     const value = {
//       parentLabel: parent.label,
//       parentValue: parent.value,
//       label: child.label,
//       value: child.value,
//     };

//     setSelected(value);
//     onChange?.(value);
//     setOpen(false);
//   };

//   return (
//     <div className="relative w-80">
//       {/* Input */}
//       <div
//         onClick={() => setOpen(!open)}
//         className="border rounded-md px-3 py-2 cursor-pointer bg-white"
//       >
//         {selected ? selected.label : "Select category"}
//       </div>

//       {/* Dropdown */}
//       {open && (
//         <div className="absolute w-full bg-white border rounded-md mt-1 shadow max-h-60 overflow-auto z-10">
//           {options.map((group) => (
//             <div key={group.value}>
//               {/* Header (NOT clickable) */}
//               <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
//                 {group.label}
//               </div>

//               {/* Children */}
//               {group.children.map((child) => (
//                 <div
//                   key={child.value}
//                   onClick={() => handleSelect(group, child)}
//                   className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
//                 >
//                   {child.label}
//                 </div>
//               ))}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
