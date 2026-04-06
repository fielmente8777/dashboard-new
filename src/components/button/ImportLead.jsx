import React, { useState } from "react";
import Papa from "papaparse";
import { importLead } from "../../services/api/leads.api";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";

export default function ImportLead({ open, setOpen }) {
  const [fileName, setFileName] = useState("");
  const [leads, setLeads] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);


  const normalizeKey = (key) => key.toLowerCase().replace(/[^a-z]/g, "");

  const FIELD_MAP = {
    name: ["name", "fullname", "customername"],
    email: ["email", "emailaddress", "mail"],
    phone: ["phone", "contact", "mobilenumber", "phonenumber"],
    status: ["status", "leadstatus", "stage"],
    message: ["message", "leadmessage", "notes"],
    created_from: ["createdfrom", "source", "createdsource", "leadsource"],
    date: ["date", "createdat", "createdon", "timestamp", "added"],
  };

  const findField = (row, field) => {
    const keys = Object?.keys(row);

    for (let key of keys) {
      const normalized = normalizeKey(key);

      if (FIELD_MAP[field].includes(normalized)) {
        return row[key];
      }
    }

    return "";
  };

  const transformLead = (row) => {
    console.log("Row", row);
    const name = findField(row, "name");
    const email = findField(row, "email");
    const phone = findField(row, "phone");
    const status = findField(row, "status");
    const message = findField(row, "message");
    const created_from = findField(row, "created_from");

    return {
      Name: name,
      Email: email,
      Contact: phone,
      status: status,
      Message: message,
      created_from: created_from,
      other_details: row, // everything else goes here
    };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        console.log("Result", results);
        setTotalPage(Math.ceil(results.data.length / chunkSize));
        const transformed = results.data.map(transformLead);
        setLeads(transformed);
        setPreview(transformed.slice(0, 5)); // show only first 5 rows in preview
      },
    });
  };

  const chunkSize = 100;

  const chunkArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  const handleImport = async () => {
    if (leads.length === 0) {
      alert("No leads to import");
      return;
    }

    setLoading(true);

    try {
      const leadChunks = chunkArray(leads, chunkSize);
      for (const chunk of leadChunks) {
        setCurrentPage((prev) => prev + 1);
        const res = await importLead(chunk);
        const data = res.data;
        console.log("Data response", data, chunk);
      }
      // alert(`Imported: ${data.success}, Failed: ${data.failed}`);
      setOpen(false);
      setCurrentPage(0);
      setTotalPage(0);
    } catch (err) {
      console.error(err);
      // alert("Import failed");
    }
    finally{
      setOpen(false);
      setCurrentPage(0);
      setTotalPage(0);
      setFileName("");
      setLeads([]);
      setPreview([]);
    }

    setLoading(false);
  };

  console.log("Leads", leads);
  return (
    <div className="max-w-3xl mx-auto space-y-4 bg-gray">
      <button className="text-sm font-medium bg-gray-200 p-2.5 rounded-sm ml-2" onClick={() => setOpen(!open)}>
        Import Leads (CSV)
      </button>

      {open&&<div onClick={(e) => {
        if (e.currentTarget === e.target) {
          e.stopPropagation(); setOpen(false)
        }
      }} className="absolute z-99999 top-0 left-0 w-full h-full bg-black/70 bg-opacity-50 flex justify-center items-start p-10">
        <div className="p-6 bg-white rounded-2xl shadow-md w-full max-w-md mx-auto">
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">

            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16V4m0 0l-4 4m4-4l4 4m6 8v4m0 0l4-4m-4 4l-4-4"
                />
              </svg>

              <p className="mb-1 text-sm text-gray-600">
                <span className="font-medium text-blue-600">Click to upload</span> or drag & drop
              </p>
              <p className="text-xs text-gray-400">CSV files only</p>
            </div>

            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {fileName && (
            <div className="mt-3 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg flex items-center justify-between">
              <span className="truncate">📄 {fileName}</span>
            </div>
          )}
          <button className="bg-primary py-1.5 rounded-lg w-full mt-2 text-sm text-white font-medium" onClick={handleImport}>
              Proceed
          </button>

          <div className="flex flex-col gap-1">

          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <p>Uploading...</p>
            <p>{currentPage} / {totalPages}</p>
          </div>

            {/* <p className={`${currentPage <= totalPages ? 'w-full bg-gray-300' : `w-[${(currentPage / totalPages) * 100}%] bg-green-600`} h-2 rounded-full `}/> */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
    <div
      className="h-full bg-green-600 transition-all duration-500"
      style={{
        width: `${totalPages ? (currentPage / totalPages) * 100 : 0}%`,
      }}
    />
  </div>
          </div>            
          </div>
     
      </div>}

       
    </div>
  );
}
