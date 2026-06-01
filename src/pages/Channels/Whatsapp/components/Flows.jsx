import React, { useEffect, useState } from "react";
import { getWhatsAppFlowScreens } from "../../../../services/api/whatsApp";
import { FiEye } from "react-icons/fi";

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
    <div className="p-4">
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          {/* HEADER */}
          <thead className="bg-primary sticky top-0 z-10">
            <tr>
              <th className="px-3 py-3 text-white">#</th>
              <th className="px-3 py-3 text-left text-white">Flow Name</th>
              <th className="px-3 py-3 text-left text-white">Flow ID</th>
              <th className="px-3 py-3 text-left text-white">Created At</th>
              <th className="px-3 py-3 text-center text-white">Action</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && flows.length > 0
              ? flows.map((flow, i) => (
                  <tr
                    key={flow._id}
                    className="odd:bg-app-surface even:bg-app-surface border-app-border  text-app-text dark:text-app-text-faint  hover:bg-blue-500/5 transition-colors  border-b "
                  >
                    <td className="px-3 py-2">
                      {(i + 1).toString().padStart(2, "0")}
                    </td>

                    <td className="px-3 py-2 capitalize">{flow.flowName}</td>

                    <td className="px-3 py-2">{flow.flowId}</td>

                    <td className="px-3 py-2">
                      {new Date(flow.createdAt).toLocaleString()}
                    </td>

                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleView(flow)}
                        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200"
                      >
                        <FiEye className="text-blue-600" />
                      </button>
                    </td>
                  </tr>
                ))
              : !loading && (
                  <tr>
                    <td colSpan={5} className="text-center py-6">
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setOpenPopup(false)}
        >
          <div
            className="bg-app-surface rounded-xl w-[95%] max-w-lg p-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{selectedFlow.flowName}</h2>
              <button onClick={() => setOpenPopup(false)}>✕</button>
            </div>

            {/* FORM PREVIEW */}
            <div className="space-y-4 max-h-[400px] overflow-auto">
              {selectedFlow.screens?.map((screen) => (
                <div key={screen.id}>
                  <h3 className="text-sm font-medium mb-2 text-gray-600 dark:text-app-text">
                    {screen.title}
                  </h3>

                  <div className="space-y-3">
                    {screen.fields?.map((field, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <label className="text-xs text-gray-500 dark:text-app-text">
                          {field.label}
                        </label>

                        {/* INPUT BASED ON TYPE */}
                        {field.type === "text" && (
                          <input
                            type="text"
                            placeholder={field.label}
                            className="border rounded px-2 py-1 text-sm"
                            disabled
                          />
                        )}

                        {field.type === "date" && (
                          <input
                            type="date"
                            className="border rounded px-2 py-1 text-sm"
                            disabled
                          />
                        )}

                        {field.type === "email" && (
                          <input
                            type="email"
                            placeholder={field.label}
                            className="border rounded px-2 py-1 text-sm"
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
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setOpenPopup(false)}
                className="bg-app-surface px-4 py-1 rounded"
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
