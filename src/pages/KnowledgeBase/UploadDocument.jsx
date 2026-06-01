import { useState } from "react";
import axios from "axios";
import { UploadCloud } from "lucide-react";
import { SALES_AGEENT_BASE_URL } from "../../data/constant";

const UploadDocument = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Handle file select
  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    // Validate type
    if (selected.type !== "application/pdf") {
      alert("Only PDF files are allowed");
      return;
    }

    // Validate size (5MB)
    if (selected.size > 50 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    setFile(selected);
  };

  // ✅ Upload function
  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file); // ⚠️ must match backend key

    console.log("Data ", formData)
    setLoading(true);
    try {
      const res = await axios.post(
        `${SALES_AGEENT_BASE_URL}/api/v1/knowledgebase/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Upload success:", res.data);
      alert("PDF uploaded successfully!");

      setFile(null); // reset after upload
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto bg-app-surface-secondary border rounded-xl p-6 space-y-4">
      
      {/* Header */}
      <div>
        <h2 className="text-md font-medium text-app-text dark:text-app-text-muted">Upload Document</h2>
        <p className="text-xs text-gray-500">
          Upload your PDF to generate knowledge base
        </p>
      </div>

      {/* Upload Box */}
      <label className="flex flex-col items-center h-125 justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition">
        <UploadCloud className="text-gray-400 mb-2" size={32} />
        <p className="text-sm text-gray-600">
          Click to upload or drag & drop
        </p>
        <p className="text-xs text-gray-400">PDF only (max 5MB)</p>

        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* File Preview */}
      {file && (
        <div className="flex items-center justify-between bg-gray-100 p-3 rounded">
          <div className="text-sm">
            📄 <span className="font-medium">{file.name}</span>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-red-500 text-xs"
          >
            Remove
          </button>
        </div>
      )}


      {/* Upload Button */}
      <div className="flex w-full justify-center ">

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className=" bg-blue-600 w-fit text-white py-1 px-4 rounded-md disabled:bg-app"
      >
        {loading ? "Uploading..." : "Upload PDF"}
      </button>
      </div>

    </div>
  );
};

export default UploadDocument;