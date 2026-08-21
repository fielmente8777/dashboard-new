import React, { useEffect, useState } from "react";
import { getWhatsAppFlowScreens } from "../../../../services/api/whatsApp";
import { FiEye } from "react-icons/fi";

const HEAD_CELL =
  "px-[var(--sp-3)] py-[var(--sp-3)] text-white font-semibold text-[length:var(--fs-sm)] whitespace-nowrap";
const CELL =
  "px-[var(--sp-3)] py-[var(--sp-2)] text-[length:var(--fs-sm)] whitespace-nowrap";
const PREVIEW_FIELD =
  "rounded-[var(--r-sm)] border border-app-border bg-app-surface-secondary px-[var(--sp-2)] py-1 text-[length:var(--fs-sm)] text-app-text disabled:opacity-70 disabled:cursor-not-allowed";

const Flows = () => {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedFlow, setSelectedFlow] = useState(null);
  const [openPopup, setOpenPopup] = useState(false);

  const fetchFlows = async () => {
    try {
      const response = await getWhatsAppFlowScreens();

      if (response?.success) {
        setFlows(response?.result?.docs?.flows || []);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlows();
  }, []);

  const handleView = (flow) => {
    setSelectedFlow(flow);
    setOpenPopup(true);
  };

  return (
    <div className="p-[var(--sp-4)] bg-app-surface">
      <div className="border border-app-border rounded-[var(--r-md)] overflow-x-auto">
        <table className="min-w-full">
          {/* HEADER */}
          <thead className="bg-primary sticky top-0 z-10">
            <tr>
              <th className={`${HEAD_CELL} text-center`}>#</th>
              <th className={`${HEAD_CELL} text-left`}>Flow Name</th>
              <th className={`${HEAD_CELL} text-left`}>Flow ID</th>
              <th className={`${HEAD_CELL} text-left`}>Created At</th>
              <th className={`${HEAD_CELL} text-center`}>Action</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-[var(--sp-5)] text-[length:var(--fs-sm)] text-app-text-faint"
                >
                  Loading...
                </td>
              </tr>
            )}

            {!loading && flows.length > 0
              ? flows.map((flow, i) => (
                  <tr
                    key={flow._id}
                    className="odd:bg-app-surface even:bg-app-surface-secondary border-b border-app-border text-app-text hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
                  >
                    <td className={`${CELL} text-center tabular-nums`}>
                      {(i + 1).toString().padStart(2, "0")}
                    </td>

                    <td className={`${CELL} capitalize`}>{flow.flowName}</td>

                    <td className={CELL}>{flow.flowId}</td>

                    <td className={CELL}>
                      {new Date(flow.createdAt).toLocaleString()}
                    </td>

                    <td className={`${CELL} text-center`}>
                      <button
                        onClick={() => handleView(flow)}
                        aria-label={`View ${flow.flowName}`}
                        className="p-2 rounded-full bg-blue-100 dark:bg-blue-500/15 hover:bg-blue-200 dark:hover:bg-blue-500/25 transition-colors"
                      >
                        <FiEye className="text-blue-600 dark:text-blue-400" />
                      </button>
                    </td>
                  </tr>
                ))
              : !loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-[var(--sp-5)] text-[length:var(--fs-sm)] text-app-text-faint"
                    >
                      No Flows Found
                    </td>
                  </tr>
                )}
          </tbody>
        </table>
      </div>

      {/* ✅ POPUP */}
      {openPopup && selectedFlow && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-[var(--sp-4)]"
          onClick={() => setOpenPopup(false)}
        >
          <div
            className="bg-app-surface rounded-[var(--r-lg)] w-full max-w-lg max-h-[90dvh] overflow-y-auto p-[var(--sp-5)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center gap-[var(--sp-3)] mb-[var(--sp-4)]">
              <h2 className="text-[length:var(--fs-lg)] font-semibold text-app-text truncate">
                {selectedFlow.flowName}
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpenPopup(false)}
                className="shrink-0 size-8 flex items-center justify-center rounded-[var(--r-sm)] text-app-text hover:bg-app-surface-secondary transition-colors"
              >
                ✕
              </button>
            </div>

            {/* FORM PREVIEW */}
            <div className="space-y-[var(--sp-4)] max-h-[25rem] overflow-auto">
              {selectedFlow.screens?.map((screen) => (
                <div key={screen.id}>
                  <h3 className="text-[length:var(--fs-sm)] font-medium mb-2 text-gray-600 dark:text-app-text">
                    {screen.title}
                  </h3>

                  <div className="space-y-[var(--sp-3)]">
                    {screen.fields?.map((field, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <label className="text-[length:var(--fs-xs)] text-gray-500 dark:text-app-text-faint">
                          {field.label}
                        </label>

                        {/* INPUT BASED ON TYPE */}
                        {field.type === "text" && (
                          <input
                            type="text"
                            placeholder={field.label}
                            className={PREVIEW_FIELD}
                            disabled
                          />
                        )}

                        {field.type === "date" && (
                          <input
                            type="date"
                            className={PREVIEW_FIELD}
                            disabled
                          />
                        )}

                        {field.type === "email" && (
                          <input
                            type="email"
                            placeholder={field.label}
                            className={PREVIEW_FIELD}
                            disabled
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* FOOTER */}
            <div className="mt-[var(--sp-4)] flex justify-end">
              <button
                onClick={() => setOpenPopup(false)}
                className="border border-app-border text-app-text bg-app-surface hover:bg-app-surface-secondary px-[var(--sp-4)] py-[var(--sp-2)] rounded-[var(--r-sm)] text-[length:var(--fs-sm)] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flows;