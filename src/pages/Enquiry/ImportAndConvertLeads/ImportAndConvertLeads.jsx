import { useState } from "react";
import PageHeader from "./components/PageHeader";
import ImportStepper from "./components/ImportStepper";
import UploadCard from "./components/UploadCard";
import FileInfoCard from "./components/FileInfoCard";
import ColumnMapping from "./components/ColumnMapping";
import ImportRules from "./components/ImportRules";
import { useTenant } from "../../../hooks/useTenant";
import {
  usePreviewLeadsImportMutation,
  useUploadLeadsImportFileMutation,
} from "../../../redux/api/leadsApi";

export default function ImportAndConvertLeads() {
  const { hid } = useTenant();
  const [uploadFile] = useUploadLeadsImportFileMutation();
  const [previewImport] = usePreviewLeadsImportMutation();

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [importId, setImportId] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [mapping, setMapping] = useState({});
  const [columnValues, setColumnValues] = useState({});
  // eslint-disable-next-line no-unused-vars -- step 4 (preview) screen is not built yet
  const [preview, setPreview] = useState(null);

  const [importRules, setImportRules] = useState({
    duplicateBy: "phone",
    importMode: "upsert",
    statusColumn: "",
    statusMappings: {},
    updateFields: ["status", "company"],
  });

  const handleFileSelect = async (file) => {
    try {
      setFile(file);

      const doc = await uploadFile(file).unwrap();

      setImportId(doc.importId);
      setHeaders(doc.headers);
      setTotalRows(doc.totalRows);
      setColumnValues(doc.columnValues);

      setStep(2);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePreview = async () => {
    try {
      if (!importRules.duplicateBy) {
        return alert("Please select duplicate detection.");
      }

      const result = await previewImport({
        hid,
        importId,
        mapping,
        rules: importRules,
      }).unwrap();

      setPreview(result);

      setStep(4);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <PageHeader />
      <ImportStepper currentStep={step} />

      {step === 1 && (
        <div>
          {!file ? (
            <UploadCard file={file} onFileSelect={handleFileSelect} />
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
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <ImportRules
          headers={headers}
          importRules={importRules}
          columnValues={columnValues}
          setImportRules={setImportRules}
          onBack={() => setStep(2)}
          onPreview={() => handlePreview()}
        />
      )}
    </div>
  );
}
