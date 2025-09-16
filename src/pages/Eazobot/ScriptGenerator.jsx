import { FiCopy } from "react-icons/fi";
import { useState } from "react";

const ScriptGenerator = () => {
  const [copied, setCopied] = useState("");

  const nextjsScript = `<!-- Eazbot Script (Next.js) -->
<Script id="chatbot-config" strategy="afterInteractive">
  { \`
    window.eazbotConfig = {
       ndid: "${localStorage.getItem("ndid") || ""}",
       hid: "${localStorage.getItem("hid") || ""}",
    };
  \` }
</Script>
<Script
  src="https://cb-script.dyq28lyxrazm2.amplifyapp.com/widget/lead-chatbot.js"
  strategy="afterInteractive"
/>`;

  const rawScript = `<!-- Eazbot Script (Plain HTML) -->
<script>
  window.eazbotConfig = {
    ndid: "${localStorage.getItem("ndid") || ""}",
    hid: "${localStorage.getItem("hid") || ""}",
  };
</script>
<script src="https://cb-script.dyq28lyxrazm2.amplifyapp.com/widget/lead-chatbot.js"></script>`;

  const handleCopy = (type) => {
    const text = type === "nextjs" ? nextjsScript : rawScript;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <div className="space-y-8">
      {/* ✅ Option 1: Next.js */}
      <div className="relative w-full">
        <p className="mb-2 font-semibold">For Next.js Projects:</p>
        <textarea
          value={nextjsScript}
          readOnly
          className="w-full px-4 py-6 bg-white border rounded resize-none outline-none font-mono text-sm"
          rows={10}
        />
        <button
          onClick={() => handleCopy("nextjs")}
          className="absolute top-12 right-5 text-gray-600 hover:text-black"
          title="Copy to Clipboard"
        >
          <FiCopy className="w-5 h-5" />
        </button>
        {copied === "nextjs" && (
          <span className="absolute top-10 bg-gray-200 px-2 py-1 rounded-sm right-10 text-gray-600 text-sm font-medium">
            Copied!
          </span>
        )}
      </div>

      {/* ✅ Option 2: Plain HTML */}
      <div className="relative w-full">
        <p className="mb-2 font-semibold">
          For Plain HTML or Any Other Website:
        </p>
        <textarea
          value={rawScript}
          readOnly
          className="w-full px-4 py-6 bg-white border rounded resize-none outline-none font-mono text-sm"
          rows={10}
        />
        <button
          onClick={() => handleCopy("raw")}
          className="absolute top-12 right-5 text-gray-600 hover:text-black"
          title="Copy to Clipboard"
        >
          <FiCopy className="w-5 h-5" />
        </button>
        {copied === "raw" && (
          <span className="absolute top-10 bg-gray-200 px-2 py-1 rounded-sm right-10 text-gray-600 text-sm font-medium">
            Copied!
          </span>
        )}
      </div>
    </div>
  );
};

export default ScriptGenerator;
