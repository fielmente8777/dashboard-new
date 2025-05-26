import React from "react";

const Modal = ({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  render,
  labels,
}) => {
  const { confirm, cancel } = labels;
  return (
    isOpen && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm">
        <div className="animate-topDown max-w-xl mx-auto border border-gray-100 rounded-sm shadow-md bg-gray-100 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-medium">{title}</h2>
            <p>{description}</p>
          </div>

          {render && render()}

          <div className="flex justify-end gap-4">
            <button
              className="px-4 py-1 rounded-sm bg-gray-200 font-semibold"
              onClick={onConfirm}
            >
              {confirm}
            </button>
            <button
              className="text-white px-4 py-1 rounded-sm bg-[#F95E5E] font-semibold"
              onClick={onCancel}
            >
              {cancel || "Cancel"}
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default Modal;
