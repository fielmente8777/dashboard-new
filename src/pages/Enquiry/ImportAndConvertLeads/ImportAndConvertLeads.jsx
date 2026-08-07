import { useState } from "react";
import PageHeader from "./components/PageHeader";
import ImportStepper from "./components/ImportStepper";
import UploadCard from "./components/UploadCard";
import FileInfoCard from "./components/FileInfoCard";
import axios from "axios";
import { NEW_BASE_URL } from "../../../data/constant";
import ColumnMapping from "./components/ColumnMapping";

export default function ImportAndConvertLeads() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [importId, setImportId] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [mapping, setMapping] = useState({});
  const [loading, setLoading] = useState(false);

  const handleFileSelect = async (file) => {
    try {
      setLoading(true);

      setFile(file);

      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axios.post(
        `${NEW_BASE_URL}/api/v1/leads-import/upload`,
        formData,
      );

      console.log("data", data);

      setImportId(data.result?.doc?.importId);
      setHeaders(data.result?.doc?.headers);
      setTotalRows(data.result?.doc?.totalRows);

      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  console.log("step", step);

  return (
    <div className="space-y-6 p-4">
      <PageHeader />
      <ImportStepper currentStep={step} />

      {step === 1 && (
        <div>
          {!file ? (
            <UploadCard
              file={file}
              //   setFile={setFile}
              onFileSelect={handleFileSelect}
            />
          ) : (
            <FileInfoCard file={file} setFile={setFile} />
          )}
        </div>
      )}

      {step === 2 && (
        <ColumnMapping
          file={file}
          headers={headers}
          totalRows={totalRows}
          mapping={mapping}
          setMapping={setMapping}
        />
      )}
    </div>
  );
}
