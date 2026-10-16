import { Check, Copy, Download, QrCode, RotateCcw, Share2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Field, Input } from "../../components/ui/Field";
import PageShell from "../../components/ui/PageShell";
import Tabs from "../../components/ui/Tabs";
import { GRM_SITE_URL } from "../../config/env";
import { useToast } from "../../context/ToastContext";
import { hasTenant, useTenant } from "../../hooks/useTenant";
import Icon from "../../components/ui/Icon";

const QR_SIZE = 240;

const LINK_TABS = [
  { value: "grm", label: "Guest request page" },
  { value: "custom", label: "Custom link" },
];

// the generated link is remembered per hotel location
const storageKey = (hid) => `qr:${hid}`;

const readSavedLink = (hid) => {
  if (!hid) return "";
  const saved = localStorage.getItem(storageKey(hid));
  if (saved) return saved;

  // before this page remembered a link per location, one link was kept for
  // the whole account: use it only if it belongs to this location
  const legacy = localStorage.getItem("qr") || "";
  return legacy.includes(`hid=${hid}`) ? legacy : "";
};

const isHttpUrl = (value) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

// QR code for the hotel's guest request (GRM) page, or for any other link.
const Settings = () => {
  const qrRef = useRef(null);
  const tenant = useTenant();
  const { showToast } = useToast();
  const [linkType, setLinkType] = useState("grm");
  const [customUrl, setCustomUrl] = useState("");
  const [qrLink, setQrLink] = useState("");
  const [copied, setCopied] = useState(false);

  const grmLink = hasTenant(tenant)
    ? `${GRM_SITE_URL}/home/?id=${tenant.ndid}&hid=${tenant.hid}`
    : "";
  const customLink = customUrl.trim();
  const nextLink = linkType === "grm" ? grmLink : customLink;
  const canGenerate = linkType === "grm" ? Boolean(grmLink) : isHttpUrl(customLink);

  // show the code generated last time for this hotel location
  useEffect(() => {
    setQrLink(readSavedLink(tenant.hid));
  }, [tenant.hid]);

  const saveLink = (link) => {
    setQrLink(link);
    if (link) {
      localStorage.setItem(storageKey(tenant.hid), link);
    } else {
      localStorage.removeItem(storageKey(tenant.hid));
      localStorage.removeItem("qr");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({ message: "Could not copy the link.", type: "error" });
    }
  };

  const handleShare = () => {
    const message = `Raise a request during your stay using this link: ${qrLink}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener",
    );
  };

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "qr-code.png";
    link.click();
  };

  return (
    <PageShell
      title="QR Code"
      description="Print it or share it so guests can open the page by scanning."
    >
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Card title="Link" description="What should the QR code open?">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              saveLink(nextLink);
            }}
          >
            <Tabs tabs={LINK_TABS} value={linkType} onChange={setLinkType} />

            {linkType === "grm" ? (
              <Field
                label="Guest request page of this hotel"
                hint="Guests use it to ask for items and services during their stay."
              >
                <Input readOnly value={grmLink} placeholder="Loading..." />
              </Field>
            ) : (
              <Field
                label="Link"
                error={
                  customLink && !isHttpUrl(customLink)
                    ? "Enter a full link starting with https://"
                    : ""
                }
              >
                <Input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://"
                />
              </Field>
            )}

            <Button
              type="submit"
              icon={QrCode}
              disabled={!canGenerate || nextLink === qrLink}
            >
              {qrLink ? "Update QR code" : "Generate QR code"}
            </Button>
          </form>
        </Card>

        <Card
          title="QR code"
          actions={
            qrLink && (
              <Button
                variant="ghost"
                size="sm"
                icon={RotateCcw}
                onClick={() => saveLink("")}
              >
                Reset
              </Button>
            )
          }
        >
          {qrLink ? (
            <div className="flex flex-col items-center gap-4">
              {/* always white, so the code stays scannable in dark mode */}
              <div
                ref={qrRef}
                style={{ backgroundColor: "#fff" }}
                className="rounded-xl p-4"
              >
                <QRCodeCanvas value={qrLink} size={QR_SIZE} />
              </div>

              <a
                href={qrLink}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-full break-all text-center text-sm text-blue-500 hover:underline"
              >
                {qrLink}
              </a>

              <div className="flex flex-wrap justify-center gap-2">
                <Button icon={Download} onClick={handleDownload}>
                  Download
                </Button>
                <Button
                  variant="secondary"
                  icon={copied ? Check : Copy}
                  onClick={handleCopy}
                >
                  {copied ? "Copied" : "Copy link"}
                </Button>
                <Button variant="secondary" icon={Share2} onClick={handleShare}>
                  Share on WhatsApp
                </Button>
              </div>
            </div>
          ) : (
            <div
              style={{ height: QR_SIZE }}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-app-border! text-app-text-muted"
            >
              <Icon icon={QrCode} size={28} className="text-app-text-faint" />
              <p className="text-sm">Generate the QR code to see it here.</p>
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
};

export default Settings;
