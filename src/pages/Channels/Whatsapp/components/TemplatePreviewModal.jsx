import React from "react";
import TemplatePreview from "./TemplatePreview";
import { IoMdClose } from "react-icons/io";

const TemplatePreviewModal = ({ components = [], onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-sm bg-black/40 p-[var(--sp-5)]">
      <div className="relative w-full max-w-[21.25rem] max-h-[90dvh] overflow-y-auto">
        <TemplatePreview components={components} />

        <button
          type="button"
          aria-label="Close preview"
          onClick={onClose}
          className="absolute -right-2 -top-2 bg-red-600 hover:bg-red-700 size-7 rounded-full flex justify-center items-center transition-colors"
        >
          <IoMdClose size={16} color="#fefefe" />
        </button>
      </div>
    </div>
  );
};

export default TemplatePreviewModal;