const ScriptGenerator = () => {
  const script = `<!-- Eazobot Script -->\n<script src=\"https://your-cdn.com/eazobot.js\"></script>`;

  return (
    <div>
      <textarea
        value={script}
        readOnly
        className="w-full p-4 bg-gray-100 border rounded resize-none"
        rows={4}
      />
      <button
        onClick={() => navigator.clipboard.writeText(script)}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Copy to Clipboard
      </button>
    </div>
  );
};

export default ScriptGenerator;
