import React from "react";
import { FiCopy } from "react-icons/fi";

const WhatsappWidgetCard = ({ phoneNumber }) => {
  console.log(phoneNumber);
  const codeSnippet = `const payload = {
  widget: "whatsapp",
  ndid: ${localStorage?.getItem("ndid")},
  hid: ${localStorage?.getItem("hid")},
  pageUrl: window.location.href,
  websiteName: window.location.hostname,
  phoneNumber: ${phoneNumber?.displayPhoneNumber},
  message: "Hello, I'm interested in your offer."
};

await fetch(
  "https://your-domain.com/api/v1/widget/click",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }
);`;
  const copyCode = async () => {
    await navigator.clipboard.writeText(codeSnippet);
  };

  return (
    <div className="bg-app-surface p-6 shadow-sm">
      <h2 className="text-xl font-semibold">WhatsApp Widget Integration</h2>

      <p className="mt-2 text-sm text-gray-600">
        Add the following code to your website to track WhatsApp widget clicks.
      </p>

      {/* <div className="mt-5 rounded-lg border bg-gray-50 p-4">
        <h3 className="font-medium">Required Local Storage Keys</h3>

        <ul className="mt-2 text-sm text-gray-600 list-disc pl-5">
          <li>
            <code>ndid</code> - Visitor identifier
          </li>
          <li>
            <code>hid</code> - Website identifier
          </li>
        </ul>

        <div className="mt-3 rounded bg-gray-100 p-3 text-sm">
          <code>
            localStorage.setItem("ndid", "YOUR_NDID");
            <br />
            localStorage.setItem("hid", "YOUR_HID");
          </code>
        </div>
      </div> */}

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-medium">Integration Code</h3>

          <button
            onClick={copyCode}
            className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <FiCopy />
            Copy Code
          </button>
        </div>

        <pre className="overflow-auto rounded-lg bg-black  p-4 text-sm text-green-400">
          <code>{codeSnippet}</code>
        </pre>
      </div>

      <div className="mt-5 rounded-lg border border-blue-200 bg-app-surface  p-4">
        <h4 className="font-medium text-blue-900">Fields You Can Customize</h4>

        <ul className="mt-2 text-sm text-blue-800 list-disc pl-5">
          <li>phoneNumber</li>
          <li>message</li>
          <li>API endpoint URL</li>
        </ul>
      </div>
    </div>
  );
};

export default WhatsappWidgetCard;
