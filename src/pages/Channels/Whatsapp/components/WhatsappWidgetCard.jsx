import { Globe } from "lucide-react";
import { useState } from "react";
import Card from "../../../../components/ui/Card";
import CodeBlock from "../../../../components/ui/CodeBlock";
import Segmented from "../../../../components/ui/Segmented";
import { API_URLS, WHATSAPP_WIDGET_SCRIPT_URL } from "../../../../config/env";

const METHODS = [
  { value: "widget", label: "Chat button (recommended)" },
  { value: "api", label: "Custom code" },
];

// Code that adds a "Chat on WhatsApp" button to the hotel's website.
const WhatsappWidgetCard = ({ phoneNumber }) => {
  const [method, setMethod] = useState("widget");
  const ndid = localStorage.getItem("ndid") || "YOUR_NDID";
  const hid = localStorage.getItem("hid") || "YOUR_HID";
  // wa.me links need digits only
  const phone = (phoneNumber?.displayPhoneNumber || "").replace(/\D/g, "") || "919999999999";

  const widgetCode = `<script>
  window.eazbotConfig = {
    ndid: "${ndid}",
    hid: "${hid}",
    phoneNumber: "${phone}",
    message: "Hello",
  };
</script>
<script src="${WHATSAPP_WIDGET_SCRIPT_URL}"></script>`;

  const apiCode = `// call this when a visitor clicks your own WhatsApp button
async function openWhatsApp() {
  try {
    const response = await fetch("${API_URLS.node}/api/v1/widget/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        widget: "whatsapp",
        ndid: "${ndid}",
        hid: "${hid}",
        pageUrl: window.location.href,
        websiteName: window.location.hostname,
        phoneNumber: "${phone}",
        message: "Hello, I'm interested in your offer.",
      }),
    });
    const data = await response.json();
    const url = data?.result?.doc?.whatsappUrl;
    if (url) window.open(url, "_blank");
  } catch (error) {
    console.error("WhatsApp click error:", error);
  }
}`;

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <Globe className="size-4 text-app-text-muted" />
          WhatsApp button for your website
        </span>
      }
      description="Visitors tap it to message you; each click is tracked as a lead."
    >
      <div className="space-y-3">
        <Segmented label="Install method" options={METHODS} value={method} onChange={setMethod} />

        {method === "widget" ? (
          <>
            <p className="text-xs text-app-text-muted">
              Paste this just before the closing <code>&lt;/body&gt;</code> tag of every
              page. A chat button appears in the bottom corner.
            </p>
            <CodeBlock title="Website code" code={widgetCode} />
          </>
        ) : (
          <>
            <p className="text-xs text-app-text-muted">
              For developers who want to use their own button. Call{" "}
              <code>openWhatsApp()</code> when it is clicked.
            </p>
            <CodeBlock title="JavaScript" code={apiCode} />
          </>
        )}
      </div>
    </Card>
  );
};

export default WhatsappWidgetCard;
