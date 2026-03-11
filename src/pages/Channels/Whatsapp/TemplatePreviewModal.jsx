import React from "react";
import TemplatePreview from "./TemplatePreview";
import { IoMdClose } from "react-icons/io";

const TemplatePreviewModal = ({ components = [], onClose }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-black/40">
      <div className="relative">
        <TemplatePreview components={components} />

        <button
          onClick={onClose}
          className="absolute -right-2 -top-3 bg-red-700 size-6 rounded-full flex justify-center items-center"
        >
          <IoMdClose size={15} color="#fefefe" />
        </button>
      </div>
    </div>
  );
};

export default TemplatePreviewModal;
