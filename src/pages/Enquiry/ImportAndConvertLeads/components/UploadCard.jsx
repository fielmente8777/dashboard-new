import { UploadCloud } from "lucide-react";

export default function UploadCard({ setFile, onFileSelect }) {
  const handleChange = (e) => {
    if (!e.target.files.length) return;
    // setFile(e.target.files[0]);
    const file = e.target.files[0];
    onFileSelect(file);
  };

  return (
    <div className="bg-white rounded-xl border p-10">
      <div className="border-2 border-dashed rounded-xl p-16 text-center">
        <UploadCloud size={60} className="mx-auto text-slate-400" />

        <h2 className="mt-6 text-xl font-semibold">Upload Excel File</h2>

        <p className="text-slate-500 mt-2">Drag & drop your Excel file here</p>

        <div className="mt-8">
          <label className="cursor-pointer">
            <input
              hidden
              type="file"
              accept=".xlsx,.xls"
              onChange={handleChange}
            />

            <span className="bg-indigo-600 text-white px-6 py-3 rounded-lg">
              Choose File
            </span>
          </label>
        </div>

        <p className="mt-6 text-xs text-slate-400">Supported .xlsx .xls</p>
      </div>
    </div>
  );
}
