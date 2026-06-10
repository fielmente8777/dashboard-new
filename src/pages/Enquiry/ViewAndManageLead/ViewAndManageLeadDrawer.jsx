import React, { useEffect } from "react";
import ViewAndManageLeads from "./ViewAndManageLeads";

const ViewAndManageLeadDrawer = ({ leadId, hid, isOpen, onClose }) => {
  // prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => (document.body.style.overflow = "");
  }, [isOpen]);

  return (
    <>
      {/* 🔥 Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300
        ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
      />

      {/* 🔥 Drawer */}
      <div
        className={`fixed top-0 right-0 h-full max-w-2xl w-full bg-app-surface z-999! shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-app-surface-secondary">
          <h2 className="text-lg font-semibold">Lead Details</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-black text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
          <ViewAndManageLeads leadId={leadId} hid={hid} />
        </div>
      </div>
    </>
  );
};

export default ViewAndManageLeadDrawer;
