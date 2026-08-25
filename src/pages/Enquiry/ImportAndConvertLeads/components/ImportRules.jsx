import { useState, useEffect } from "react";

const UPDATE_FIELDS = [
  {
    key: "name",
    label: "Lead Name",
  },
  {
    key: "email",
    label: "Email",
  },
  {
    key: "phone",
    label: "Phone",
  },
  {
    key: "company",
    label: "Company",
  },
  {
    key: "status",
    label: "Lead Status",
  },
  {
    key: "source",
    label: "Lead Source",
  },
  {
    key: "tags",
    label: "Tags",
  },
  {
    key: "owner",
    label: "Lead Owner",
  },
];

const CRM_STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Won",
  "Lost",
  "Converted",
  "Junk",
];

export default function ImportRules({
  headers,
  importRules,
  setImportRules,
  columnValues,
  onBack,
  onPreview,
}) {
  //   const [uniqueValues, setUniqueValues] = useState([]);

  const shouldShowStatusMapping = importRules.updateFields.includes("status");
  const selectedColumnValues = columnValues?.[importRules.statusColumn] || [];

  //   useEffect(() => {
  //     if (!shouldShowStatusMapping) {
  //       setUniqueValues([]);
  //       return;
  //     }

  //     if (!importRules.statusColumn) {
  //       //   setUniqueValues([]);
  //       return;
  //     }

  //     // Later call backend
  //     // POST /unique-values

  //     // setUniqueValues(["Paid", "Pending", "Cancelled", "Failed"]);
  //   }, [shouldShowStatusMapping, importRules.statusColumn]);

  const toggleUpdateField = (field) => {
    if (importRules.updateFields.includes(field)) {
      setImportRules((prev) => ({
        ...prev,
        updateFields: prev.updateFields.filter((x) => x !== field),
      }));

      return;
    }

    setImportRules((prev) => ({
      ...prev,
      updateFields: [...prev.updateFields, field],
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow">
      {/* HEADER */}

      <div className="border-b p-6">
        <h2 className="text-2xl font-semibold">Import Rules</h2>

        <p className="text-gray-500 mt-1">
          Configure how existing leads should be matched and updated.
        </p>
      </div>

      <div className="p-6 space-y-10">
        {/* Duplicate Detection */}

        <section>
          <h3 className="text-lg font-semibold">Duplicate Detection</h3>

          <p className="text-gray-500 text-sm mb-4">
            Choose how existing leads will be identified.
          </p>

          <select
            className="border rounded-lg px-4 py-3 w-full"
            value={importRules.duplicateBy}
            onChange={(e) =>
              setImportRules((prev) => ({
                ...prev,
                duplicateBy: e.target.value,
              }))
            }
          >
            <option value="phone">Phone Number</option>

            <option value="email">Email Address</option>

            <option value="phone_email">Phone OR Email</option>
          </select>
        </section>

        {/* Import Mode */}

        <section>
          <h3 className="text-lg font-semibold">Import Mode</h3>

          <p className="text-gray-500 text-sm mb-4">
            Decide what should happen when duplicates are found.
          </p>

          <div className="space-y-4">
            <label className="flex gap-3">
              <input
                type="radio"
                checked={importRules.importMode === "create"}
                onChange={() =>
                  setImportRules((prev) => ({
                    ...prev,
                    importMode: "create",
                  }))
                }
              />

              <div>
                <div className="font-medium">Create New Leads Only</div>

                <div className="text-sm text-gray-500">
                  Skip existing leads.
                </div>
              </div>
            </label>

            <label className="flex gap-3">
              <input
                type="radio"
                checked={importRules.importMode === "update"}
                onChange={() =>
                  setImportRules((prev) => ({
                    ...prev,
                    importMode: "update",
                  }))
                }
              />

              <div>
                <div className="font-medium">Update Existing Leads Only</div>

                <div className="text-sm text-gray-500">Ignore new leads.</div>
              </div>
            </label>

            <label className="flex gap-3">
              <input
                type="radio"
                checked={importRules.importMode === "upsert"}
                onChange={() =>
                  setImportRules((prev) => ({
                    ...prev,
                    importMode: "upsert",
                  }))
                }
              />

              <div>
                <div className="font-medium">Create + Update Existing</div>

                <div className="text-sm text-gray-500">
                  Create new leads and update duplicates.
                </div>
              </div>
            </label>
          </div>
        </section>

        {/* Update Existing Fields */}
        <section>
          <h3 className="text-lg font-semibold">Update Existing Fields</h3>

          <p className="text-gray-500 text-sm mb-5">
            Choose which fields should be updated when a duplicate lead is
            found.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {UPDATE_FIELDS.map((field) => (
              <label key={field.key} className="flex gap-3 items-center">
                <input
                  type="checkbox"
                  checked={importRules.updateFields.includes(field.key)}
                  onChange={() => toggleUpdateField(field.key)}
                />

                <span>{field.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* STATUS MAPPING WILL COME HERE */}
        {shouldShowStatusMapping && (
          <section>
            <h3 className="text-lg font-semibold">Status Transformation</h3>

            <p className="text-gray-500 text-sm mb-5">
              Convert values from your Excel file into CRM Lead Status.
            </p>

            {/* Excel Column */}
            <div>
              <label className="block font-medium mb-2">Excel Column</label>

              <select
                className="border rounded-lg px-4 py-3 w-full"
                value={importRules.statusColumn}
                onChange={(e) =>
                  setImportRules((prev) => ({
                    ...prev,
                    statusColumn: e.target.value,
                    statusMappings: {},
                  }))
                }
              >
                <option value="">Select Excel Column</option>

                {headers.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>

            {/* Empty */}

            {!importRules.statusColumn && (
              <div className="mt-6 rounded-lg border border-dashed p-6 text-center text-gray-500">
                Select an Excel column to configure status mapping.
              </div>
            )}

            {/* Mapping */}

            {importRules.statusColumn && selectedColumnValues.length > 0 && (
              <div className="mt-8">
                <div className="grid grid-cols-2 gap-6 border-b pb-3 font-semibold">
                  <div>Excel Value</div>
                  <div>CRM Lead Status</div>
                </div>

                <div className="space-y-4 mt-5">
                  {selectedColumnValues.map((value) => (
                    <div
                      key={value}
                      className="grid grid-cols-2 gap-6 items-center"
                    >
                      <div>
                        <div className="font-medium">{value}</div>
                      </div>

                      <select
                        className="border rounded-lg px-4 py-2"
                        value={importRules.statusMappings[value] || ""}
                        onChange={(e) =>
                          setImportRules((prev) => ({
                            ...prev,

                            statusMappings: {
                              ...prev.statusMappings,
                              [value]: e.target.value,
                            },
                          }))
                        }
                      >
                        <option value="">Ignore</option>

                        {CRM_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* FOOTER WILL COME LATER */}
      <div className="border-t bg-gray-50 px-6 py-5 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          <div>
            Duplicate By:
            <span className="font-medium text-gray-700 ml-1">
              {importRules.duplicateBy}
            </span>
          </div>

          <div>
            Mode:
            <span className="font-medium text-gray-700 ml-1">
              {importRules.importMode}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-5 py-2 rounded-lg border hover:bg-gray-100"
          >
            Back
          </button>

          <button
            onClick={onPreview}
            className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Preview Changes →
          </button>
        </div>
      </div>
    </div>
  );
}

// import { useEffect, useState } from "react";

// const CRM_STATUSES = [
//   "New",
//   "Contacted",
//   "Qualified",
//   "Proposal",
//   "Won",
//   "Lost",
//   "Converted",
//   "Junk",
// ];

// export default function ImportRules({
//   headers,
//   importRules,
//   setImportRules,
//   onBack,
//   onPreview,
// }) {
//   const [uniqueValues, setUniqueValues] = useState([]);

//   useEffect(() => {
//     // Later you'll call backend here
//     // Example:
//     //
//     // GET /unique-values?column=Payment Status
//     //
//     // setUniqueValues(response.data);

//     if (!importRules.statusColumn) {
//       setUniqueValues([]);
//       return;
//     }

//     // Dummy values for now
//     setUniqueValues(["Paid", "Pending", "Cancelled", "Failed"]);
//   }, [importRules.statusColumn]);

//   return (
//     <div className="bg-white rounded-xl shadow">
//       {/* Header */}

//       <div className="border-b p-6">
//         <h2 className="text-xl font-semibold">Import Rules</h2>

//         <p className="text-gray-500 mt-1">
//           Configure how duplicates and lead status should be handled.
//         </p>
//       </div>

//       <div className="p-6 space-y-8">
//         {/* Duplicate */}
//         <div>
//           <h3 className="font-semibold mb-4">Duplicate Detection</h3>

//           <select
//             className="border rounded-lg px-4 py-2 w-full"
//             value={importRules.duplicateBy}
//             onChange={(e) =>
//               setImportRules((prev) => ({
//                 ...prev,
//                 duplicateBy: e.target.value,
//               }))
//             }
//           >
//             <option value="phone">Phone</option>

//             <option value="email">Email</option>

//             <option value="phone_email">Phone OR Email</option>
//           </select>
//         </div>

//         {/* Import Mode */}
//         <div>
//           <h3 className="font-semibold mb-4">Import Mode</h3>

//           <div className="space-y-3">
//             <label className="flex gap-2">
//               <input
//                 type="radio"
//                 checked={importRules.importMode === "create"}
//                 onChange={() =>
//                   setImportRules((prev) => ({
//                     ...prev,
//                     importMode: "create",
//                   }))
//                 }
//               />
//               Create New Leads Only
//             </label>

//             <label className="flex gap-2">
//               <input
//                 type="radio"
//                 checked={importRules.importMode === "update"}
//                 onChange={() =>
//                   setImportRules((prev) => ({
//                     ...prev,
//                     importMode: "update",
//                   }))
//                 }
//               />
//               Update Existing Leads Only
//             </label>

//             <label className="flex gap-2">
//               <input
//                 type="radio"
//                 checked={importRules.importMode === "upsert"}
//                 onChange={() =>
//                   setImportRules((prev) => ({
//                     ...prev,
//                     importMode: "upsert",
//                   }))
//                 }
//               />
//               Create + Update Existing
//             </label>
//           </div>
//         </div>

//         {/* Status Mapping */}
//         <div>
//           <h3 className="font-semibold mb-4">Lead Status Mapping</h3>
//           <label className="block mb-2 text-sm">Select Excel Column</label>

//           <select
//             className="border rounded-lg px-4 py-2 w-full"
//             value={importRules.statusColumn}
//             onChange={(e) =>
//               setImportRules((prev) => ({
//                 ...prev,
//                 statusColumn: e.target.value,
//                 statusMappings: {},
//               }))
//             }
//           >
//             <option value="">Don't Change Status</option>
//             {headers.map((header) => (
//               <option key={header} value={header}>
//                 {header}
//               </option>
//             ))}
//           </select>

//           {uniqueValues.length > 0 && (
//             <div className="mt-6">
//               <div className="grid grid-cols-2 font-semibold border-b pb-2">
//                 <div>Excel Value</div>

//                 <div>CRM Status</div>
//               </div>

//               <div className="space-y-4 mt-4">
//                 {uniqueValues.map((value) => (
//                   <div
//                     key={value}
//                     className="grid grid-cols-2 gap-5 items-center"
//                   >
//                     <div>{value}</div>

//                     <select
//                       className="border rounded-lg px-3 py-2"
//                       value={importRules.statusMappings?.[value] || ""}
//                       onChange={(e) =>
//                         setImportRules((prev) => ({
//                           ...prev,

//                           statusMappings: {
//                             ...prev.statusMappings,
//                             [value]: e.target.value,
//                           },
//                         }))
//                       }
//                     >
//                       <option value="">Ignore</option>

//                       {CRM_STATUSES.map((status) => (
//                         <option key={status} value={status}>
//                           {status}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Update Fields */}

//         <div>
//           <h3 className="font-semibold mb-4">Update Existing Fields</h3>

//           <div className="grid grid-cols-2 gap-3">
//             {[
//               "name",
//               "email",
//               "phone",
//               "company",
//               "status",
//               "source",
//               "tags",
//               "owner",
//             ].map((field) => (
//               <label key={field} className="flex gap-2">
//                 <input
//                   type="checkbox"
//                   checked={importRules.updateFields.includes(field)}
//                   onChange={(e) => {
//                     if (e.target.checked) {
//                       setImportRules((prev) => ({
//                         ...prev,

//                         updateFields: [...prev.updateFields, field],
//                       }));
//                     } else {
//                       setImportRules((prev) => ({
//                         ...prev,

//                         updateFields: prev.updateFields.filter(
//                           (x) => x !== field,
//                         ),
//                       }));
//                     }
//                   }}
//                 />

//                 {field}
//               </label>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Footer */}

//       <div className="border-t p-6 flex justify-between">
//         <button onClick={onBack} className="border px-6 py-3 rounded-lg">
//           Back
//         </button>

//         <button
//           onClick={onPreview}
//           className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
//         >
//           Preview Import
//         </button>
//       </div>
//     </div>
//   );
// }
