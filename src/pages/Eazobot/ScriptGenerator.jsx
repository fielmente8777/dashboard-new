import { FiCopy } from "react-icons/fi";
import { useState } from "react";

const ScriptGenerator = () => {
  const [copied, setCopied] = useState(false);

  const script = `<!-- Eazobot Script -->
<script>
  window.eazbotConfig = {
    ndid: "******",
    hid: "*******",
    interval: "2000",
  };
</script>
<script src="https://cb-script.dyq28lyxrazm2.amplifyapp.com/widget/lead-chatbot.js"></script>`;

  const handleCopy = () => {
    const copyScript = `<script>
  window.eazbotConfig = {
    ndid: "******",
    hid: "*******",
    interval: "2000",
  };
</script>
<script src="https://cb-script.dyq28lyxrazm2.amplifyapp.com/widget/lead-chatbot.js"></script>`;

    navigator.clipboard.writeText(copyScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative w-full">
      <textarea
        value={script}
        readOnly
        className="w-full p-4 bg-gray-100 border rounded resize-none font-mono text-sm"
        rows={8}
      />
      <button
        onClick={handleCopy}
        className="absolute top-4 right-10 text-gray-600 hover:text-black"
        title="Copy to Clipboard"
      >
        <FiCopy className="w-5 h-5" />
      </button>
      {copied && (
        <span className="absolute top-4 bg-gray-200 px-2 py-1 rounded-sm right-20 text-gray-600 text-sm font-medium">
          Copied!
        </span>
      )}
    </div>
  );
};

export default ScriptGenerator;
