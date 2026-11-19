export default function FileInfoCard({ file, setFile }) {
  return (
    <div className="bg-white rounded-xl border p-6 flex justify-between items-center">
      <div>
        <h3 className="font-semibold">{file.name}</h3>

        <p className="text-sm text-slate-500 mt-1">
          {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>

      <button onClick={() => setFile(null)} className="text-red-500">
        Remove
      </button>
    </div>
  );
}
