import { FiCopy } from "react-icons/fi";
import { useState } from "react";

const ScriptGenerator = () => {
  const [copied, setCopied] = useState(false);

  const script = `<!-- Eazbot Script -->
<script>
  window.eazbotConfig = {
    ndid: "${String(localStorage.getItem("ndid"))}",
    hid: "${String(localStorage.getItem("hid"))}",
  };
</script>
<script 
  src="https://cb-script.dyq28lyxrazm2.amplifyapp.com/widget/lead-chatbot.js">
</script>`;

  const handleCopy = () => {
    const copyScript = `<script>
  window.eazbotConfig = {
     ndid: "${String(localStorage.getItem("ndid"))}",
    hid: "${String(localStorage.getItem("hid"))}",
  };
</script>
<script src="https://cb-script.dyq28lyxrazm2.amplifyapp.com/widget/lead-chatbot.js"></script>`;

    navigator.clipboard.writeText(copyScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative w-full">
      <p className="mb-2">{`Copy and paste the below code before the closing </body> tag of your website's HTML source code.`}</p>
      <textarea
        value={script}
        readOnly
        className="w-full px-4 py-6 bg-white border rounded resize-none outline-none font-mono text-sm"
        rows={10}
      />
      <button
        onClick={handleCopy}
        className="absolute top-12 right-5 text-gray-600 hover:text-black"
        title="Copy to Clipboard"
      >
        <FiCopy className="w-5 h-5" />
      </button>
      {
        copied && (
          <span className="absolute top-10 bg-gray-200 px-2 py-1 rounded-sm right-10 text-gray-600 text-sm font-medium">
            Copied!
          </span>
        )
      }
    </div >
  );
};

export default ScriptGenerator;
