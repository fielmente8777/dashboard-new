import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoChevronDown } from "react-icons/io5";

export default function CustomDropdown({
  label,
  options,
  onChange,
  width = "w-48",
  ...props
}) {
  const [selected, setSelected] = useState(label || options[0]?.label);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close on outside click
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
    if (label) {
      setSelected(label);
    }
  }, [label]);

  const toggleDropdown = () => {
    if (!open) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 260; // approx max height
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpwards = spaceBelow < dropdownHeight;

      setPosition({
        width: rect.width,
        left: rect.left + window.scrollX,
        top: openUpwards
          ? rect.top + window.scrollY - dropdownHeight - 8
          : rect.bottom + window.scrollY + 8,
      });
    }
    setOpen(!open);
  };

  return (
    <>
      {/* BUTTON */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        className={`py-2 ${width} flex items-center justify-between px-3 rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-primary ${props.className}`}
      >
        <span className="truncate">{selected}</span>
        <IoChevronDown
          size={16}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* DROPDOWN */}
      {open &&
        position &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              width: position.width,
              left: position.left,
              top: position.top,
            }}
            className="absolute z-9999 rounded-lg bg-white border border-gray-200 shadow-xl max-h-64 overflow-y-auto wrap-break-word"
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setSelected(opt.label);
                }}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-primary/10"
              >
                {opt.label}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
