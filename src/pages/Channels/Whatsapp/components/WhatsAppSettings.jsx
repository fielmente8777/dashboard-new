import React, { useContext, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { MdDeleteOutline, MdLinkOff, MdWarningAmber } from "react-icons/md";
import DataContext from "../../../../context/DataContext";
import { disconnectIntegration } from "../../../../services/api/Integration";
import { useToast } from "../../../../context/ToastContext";

const ACTIONS = {
  disconnect: {
    title: "Disconnect WhatsApp Number",
    description:
      "Your WhatsApp Business number will be disconnected from the dashboard. Messages, templates and auto replies will stop working until you connect again.",
    confirmLabel: "Disconnect",
  },
  delete: {
    title: "Delete WhatsApp Number",
    description:
      "This will permanently remove the WhatsApp number and its configuration from your account. This action cannot be undone.",
    confirmLabel: "Delete",
  },
};

const WhatsAppSettings = ({ phoneNumber, waba }) => {
  const { showToast } = useToast();
  const { checkIntegrationStatus } = useContext(DataContext);
  const [pendingAction, setPendingAction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDisconnect = async () => {
    const response = await disconnectIntegration("metaWhatsapp");
    if (response?.success && response?.responseStatusCode) {
      showToast({
        message: response?.responseMessage || "WhatsApp disconnected",
        type: "success",
      });
      checkIntegrationStatus();
    } else {
      throw new Error(response?.responseMessage || "Failed to disconnect");
    }
  };

  const handleDelete = async () => {
    // TODO: hook up delete WhatsApp number API once available
    showToast({
      message: "Delete WhatsApp number is coming soon",
      type: "error",
    });
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (pendingAction === "disconnect") await handleDisconnect();
      if (pendingAction === "delete") await handleDelete();
      setPendingAction(null);
    } catch (error) {
      showToast({
        message: error?.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const action = pendingAction ? ACTIONS[pendingAction] : null;

  return (
    <div className="w-full max-w-3xl flex flex-col gap-4">
      {/* Connected Number */}
      <div className="w-full border border-gray-200 dark:border-primary/60! bg-app-surface px-4 sm:px-6 py-5">
        <div className="flex items-center gap-2 mb-3">
          <FaWhatsapp className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-app-text">
            Connected Number
          </span>
        </div>
        <p className="text-lg sm:text-xl font-medium text-gray-600 dark:text-app-text break-words">
          {phoneNumber?.displayPhoneNumber || "—"}
        </p>
        <p className="text-sm text-gray-500 dark:text-app-text-faint break-words">
          {phoneNumber?.verifiedName}
          {waba?.name ? ` • ${waba.name}` : ""}
        </p>
      </div>

      {/* Danger Zone */}
      <div className="w-full border border-red-200 dark:border-red-500/40 bg-app-surface px-4 sm:px-6 py-5">
        <h3 className="text-base font-medium text-red-600 dark:text-red-400 mb-4">
          Danger Zone
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-app-text-muted">
              Disconnect WhatsApp Number
            </p>
            <p className="text-xs text-gray-500 dark:text-app-text-faint mt-1">
              Stop using this number in the dashboard. You can reconnect
              anytime.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPendingAction("disconnect")}
            className="inline-flex items-center justify-center gap-2 shrink-0 px-4 py-2 rounded-lg border border-red-300 dark:border-red-500/50 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition"
          >
            <MdLinkOff className="w-4 h-4" />
            Disconnect
          </button>
        </div>

        {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-app-text-muted">
              Delete WhatsApp Number
            </p>
            <p className="text-xs text-gray-500 dark:text-app-text-faint mt-1">
              Permanently remove this number and its configuration.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPendingAction("delete")}
            className="inline-flex items-center justify-center gap-2 shrink-0 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition"
          >
            <MdDeleteOutline className="w-4 h-4" />
            Delete
          </button>
        </div> */}
      </div>

      {/* Confirm Modal */}
      {action && (
        <div
          onClick={() => !loading && setPendingAction(null)}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-99999 px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-app-surface w-full max-w-md p-6 space-y-4 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <MdWarningAmber className="w-6 h-6 text-red-500 shrink-0" />
              <h2 className="text-lg font-medium text-gray-700 dark:text-app-text">
                {action.title}
              </h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-app-text-faint leading-relaxed">
              {action.description}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setPendingAction(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-app-text-muted hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition disabled:opacity-60"
              >
                {loading ? "Please wait..." : action.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppSettings;
