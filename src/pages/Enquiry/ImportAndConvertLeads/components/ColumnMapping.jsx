import { leadFields } from "../constants/constants";

export default function ColumnMapping({
  file,
  headers,
  totalRows,
  mapping,
  setMapping,
}) {
  return (
    <div className="bg-white rounded-xl border">
      {/* Header */}
      <div className="border-b p-6">
        <h2 className="text-xl font-semibold">Column Mapping</h2>

        <p className="text-gray-500 mt-1">
          Match your Excel columns with CRM fields.
        </p>
      </div>

      {/* File Info */}

      <div className="p-6 border-b bg-gray-50">
        <div className="flex justify-between">
          <div>
            <p className="font-medium">{file.name}</p>

            <p className="text-sm text-gray-500">{totalRows} Records Found</p>
          </div>

          <span className="text-green-600 font-medium">
            Uploaded Successfully
          </span>
        </div>
      </div>

      {/* Mapping */}

      <div className="p-6">
        <div className="grid grid-cols-2 gap-5 font-semibold text-sm text-gray-500 border-b pb-3">
          <div>CRM Field</div>

          <div>Excel Column</div>
        </div>

        <div className="space-y-4 mt-4">
          {leadFields.map((field) => (
            <div
              key={field.key}
              className="grid grid-cols-2 gap-5 items-center"
            >
              <div>
                {field.label}

                {field.required && <span className="text-red-500 ml-1">*</span>}
              </div>

              <select
                className="border rounded-lg px-4 py-2"
                value={mapping[field.key] || ""}
                onChange={(e) =>
                  setMapping((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
              >
                <option value="">Ignore</option>

                {headers.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}

      <div className="border-t p-6 flex justify-end">
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg">
          Preview & Match
        </button>
      </div>
    </div>
  );
}
