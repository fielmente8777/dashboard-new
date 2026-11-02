import {
  Check,
  ConciergeBell,
  Copy,
  Download,
  ExternalLink,
  Link2,
  MapPinned,
  Printer,
  QrCode,
  RotateCcw,
  Share2,
  Smartphone,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Field, Input } from "../../components/ui/Field";
import Icon from "../../components/ui/Icon";
import PageShell from "../../components/ui/PageShell";
import { LOGO_ON_LIGHT_URL } from "../../config/assets";
import { GRM_SITE_URL } from "../../config/env";
import { useToast } from "../../context/ToastContext";
import { hasTenant, useTenant } from "../../hooks/useTenant";
import { selectCurrentLocation } from "../../redux/slice/UserSlice";
import { CARD_COLORS, renderPrintCard } from "./printCard";

// on screen, inside the preview card
const PREVIEW_QR_SIZE = 184;
// for downloads: large enough to print sharply
const PRINT_QR_SIZE = 1024;

const LINK_TYPES = [
  {
    value: "grm",
    label: "Guest request page",
    description: "Guests ask for items and services during their stay.",
    icon: ConciergeBell,
  },
  {
    value: "custom",
    label: "Custom link",
    description: "Your website, menu, Wi-Fi page or any other link.",
    icon: Link2,
  },
];

const STEPS = [
  {
    icon: Printer,
    title: "Download the print card",
    description: "Ready to print, with your hotel name on it.",
  },
  {
    icon: MapPinned,
    title: "Place it where guests look",
    description: "Rooms, reception, restaurant tables.",
  },
  {
    icon: Smartphone,
    title: "Guests scan with their phone",
    description: "No app needed: the link opens straight away.",
  },
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

const hostnameOf = (value) => {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
};

const downloadDataUrl = (dataUrl, fileName) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
};

// "Corbett The Grand" -> "corbett-the-grand"
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "hotel";

const LinkTypePicker = ({ value, onChange }) => (
  <div role="radiogroup" aria-label="QR code opens" className="grid gap-2 sm:grid-cols-2">
    {LINK_TYPES.map((type) => {
      const selected = type.value === value;

      return (
        <button
          key={type.value}
          type="button"
          role="radio"
          aria-checked={selected}
          onClick={() => onChange(type.value)}
          className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
            selected
              ? "border-primary! bg-primary/[0.04] ring-1 ring-primary dark:border-blue-500! dark:bg-blue-500/10 dark:ring-blue-500"
              : "border-app-border! hover:bg-app-surface-secondary"
          }`}
        >
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
              selected
                ? "bg-primary text-white dark:bg-blue-600"
                : "bg-app-surface-secondary text-app-text-muted"
            }`}
          >
            <Icon icon={type.icon} size="lg" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-app-text">
              {type.label}
            </span>
            <span className="mt-0.5 block text-xs leading-snug text-app-text-muted">
              {type.description}
            </span>
          </span>
        </button>
      );
    })}
  </div>
);

// What the printed card looks like. Always light, like the paper it goes on;
// the same layout is drawn for download in printCard.js.
const PrintCardPreview = ({ hotelName, headline, caption, children }) => (
  <div
    style={{ backgroundColor: "#fff", color: CARD_COLORS.navy }}
    className="mx-auto w-full max-w-[300px] overflow-hidden rounded-2xl shadow-[0_12px_40px_-12px_rgba(15,23,42,0.35)] ring-1 ring-black/5"
  >
    <div
      style={{
        backgroundColor: CARD_COLORS.navy,
        borderBottom: `3px solid ${CARD_COLORS.accent}`,
      }}
      className="px-5 py-4 text-center text-white"
    >
      <p className="text-[11px] text-white/70">Welcome to</p>
      <p className="truncate text-lg font-bold capitalize leading-tight">
        {hotelName}
      </p>
    </div>

    <div className="px-5 pb-4 pt-5 text-center">
      <p className="text-base font-bold leading-snug">{headline}</p>
      <p style={{ color: CARD_COLORS.text }} className="mt-0.5 truncate text-xs">
        {caption}
      </p>

      <div
        style={{ borderColor: CARD_COLORS.accent }}
        className="mx-auto mt-4 flex aspect-square w-full max-w-[212px] items-center justify-center rounded-2xl border-[3px] p-[11px]"
      >
        {children}
      </div>

      <p style={{ color: CARD_COLORS.text }} className="mt-3 text-[11px]">
        Point your phone camera at the code
      </p>
    </div>

    <div
      style={{ borderColor: CARD_COLORS.rule, color: CARD_COLORS.faint }}
      className="mx-5 flex items-center justify-center gap-1.5 border-t py-3 text-[10px] font-medium"
    >
      Powered by
      <img src={LOGO_ON_LIGHT_URL} alt="Eazotel" className="h-3 w-auto" />
    </div>
  </div>
);

// QR code for the hotel's guest request (GRM) page, or for any other link.
const Settings = () => {
  const printQrRef = useRef(null);
  const tenant = useTenant();
  const { showToast } = useToast();
  const currentLocation = useSelector(selectCurrentLocation);
  const accountName = useSelector(
    (state) => state.userProfile.user?.Profile?.hotelName,
  );
  const [linkType, setLinkType] = useState("grm");
  const [customUrl, setCustomUrl] = useState("");
  const [qrLink, setQrLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  const hotelName = currentLocation?.local || accountName || "Your hotel";
  const grmLink = hasTenant(tenant)
    ? `${GRM_SITE_URL}/home/?id=${tenant.ndid}&hid=${tenant.hid}`
    : "";
  const customLink = customUrl.trim();
  const nextLink = linkType === "grm" ? grmLink : customLink;
  const canGenerate = linkType === "grm" ? Boolean(grmLink) : isHttpUrl(customLink);

  // the card's wording follows the link the code opens
  const isGrmLink = Boolean(qrLink) && qrLink.startsWith(GRM_SITE_URL);
  const headline = isGrmLink ? "Scan to request services" : "Scan to open";
  const caption = isGrmLink
    ? "Housekeeping, room service, amenities & more"
    : hostnameOf(qrLink);

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
    const message = isGrmLink
      ? `Raise a request during your stay using this link: ${qrLink}`
      : qrLink;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener",
    );
  };

  const printQrCanvas = () => printQrRef.current?.querySelector("canvas");

  const handleDownloadQr = () => {
    const canvas = printQrCanvas();
    if (!canvas) return;
    downloadDataUrl(canvas.toDataURL("image/png"), `qr-${slugify(hotelName)}.png`);
  };

  const handleDownloadCard = async () => {
    const qrCanvas = printQrCanvas();
    if (!qrCanvas) return;

    setIsRendering(true);
    try {
      const dataUrl = await renderPrintCard({
        qrCanvas,
        hotelName,
        headline,
        caption,
      });
      downloadDataUrl(dataUrl, `qr-card-${slugify(hotelName)}.png`);
    } catch {
      showToast({ message: "Could not create the print card.", type: "error" });
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <PageShell
      title="QR Code"
      description="Create a QR code guests can scan, then print it or share it."
    >
      {/* grid-cols-1, so on a phone the column is the screen's width and not
          as wide as its longest line. Phones get form, preview, then steps;
          wide screens keep the preview in its own column on the right. */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
          <Card title="What should the code open?" className="order-1 min-w-0 lg:order-none">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveLink(nextLink);
              }}
            >
              <LinkTypePicker value={linkType} onChange={setLinkType} />

              {linkType === "grm" ? (
                <Field
                  label="Guest request page of this hotel"
                  hint="Created for you. Requests arrive in Front Office › Guest requests."
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

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  type="submit"
                  icon={QrCode}
                  disabled={!canGenerate || nextLink === qrLink}
                >
                  {qrLink ? "Update QR code" : "Generate QR code"}
                </Button>
                {qrLink && nextLink === qrLink && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <Icon icon={Check} size="sm" />
                    The QR code opens this link
                  </span>
                )}
              </div>
            </form>
          </Card>

          <Card title="How it works" className="order-3 min-w-0 lg:order-none lg:col-start-1">
            <ol className="grid gap-4 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3 sm:flex-col">
                  <span className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-app-surface-secondary text-app-text-muted">
                    <Icon icon={step.icon} size="lg" />
                    <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-ternary text-[10px] font-semibold text-white">
                      {index + 1}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-app-text">
                      {step.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-app-text-muted">
                      {step.description}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </Card>

        <Card
          title="Preview"
          description={qrLink ? "This is the card you download and print." : undefined}
          className="order-2 min-w-0 lg:sticky lg:top-4 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1"
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
            <>
              <div className="rounded-xl bg-app-bg px-2 py-4 sm:px-4 sm:py-6">
                <PrintCardPreview
                  hotelName={hotelName}
                  headline={headline}
                  caption={caption}
                >
                  <QRCodeCanvas
                    value={qrLink}
                    size={PREVIEW_QR_SIZE}
                    fgColor={CARD_COLORS.navy}
                    // shrinks with the card on narrow phones
                    style={{ width: "100%", height: "auto", maxWidth: PREVIEW_QR_SIZE }}
                  />
                </PrintCardPreview>
              </div>

              {/* the code used for downloads, drawn large off screen */}
              <div ref={printQrRef} className="hidden" aria-hidden="true">
                <QRCodeCanvas
                  value={qrLink}
                  size={PRINT_QR_SIZE}
                  marginSize={4}
                  fgColor={CARD_COLORS.navy}
                />
              </div>

              <div className="mt-4 flex items-center gap-1 rounded-lg border border-app-border! bg-app-bg py-1 pl-3 pr-1">
                <Icon icon={Link2} size="sm" className="text-app-text-faint" />
                <a
                  href={qrLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={qrLink}
                  className="min-w-0 flex-1 truncate px-1 text-xs text-app-text-muted hover:text-app-text"
                >
                  {qrLink}
                </a>
                <a
                  href={qrLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open link"
                  title="Open link"
                  className="flex size-7 items-center justify-center rounded-md text-app-text-muted transition-colors hover:bg-app-surface-secondary hover:text-app-text"
                >
                  <Icon icon={ExternalLink} size="sm" />
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label={copied ? "Copied" : "Copy link"}
                  title={copied ? "Copied" : "Copy link"}
                  className="flex size-7 items-center justify-center rounded-md text-app-text-muted transition-colors hover:bg-app-surface-secondary hover:text-app-text"
                >
                  <Icon
                    icon={copied ? Check : Copy}
                    size="sm"
                    className={copied ? "text-emerald-500" : ""}
                  />
                </button>
              </div>

              <Button
                size="lg"
                icon={Printer}
                loading={isRendering}
                onClick={handleDownloadCard}
                className="mt-3 w-full whitespace-nowrap"
              >
                Download print card
              </Button>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  icon={Download}
                  onClick={handleDownloadQr}
                  title="Download the QR code only, as a PNG"
                  className="w-full whitespace-nowrap"
                >
                  QR code
                </Button>
                <Button
                  variant="secondary"
                  icon={Share2}
                  onClick={handleShare}
                  title="Share the link on WhatsApp"
                  className="w-full whitespace-nowrap"
                >
                  WhatsApp
                </Button>
              </div>
            </>
          ) : (
            <div className="flex min-h-[260px] flex-col items-center lg:min-h-[420px] justify-center gap-3 rounded-xl border border-dashed border-app-border! bg-app-bg px-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-app-surface-secondary text-app-text-faint">
                <Icon icon={QrCode} size={26} />
              </span>
              <div>
                <p className="text-sm font-medium text-app-text">No QR code yet</p>
                <p className="mt-1 max-w-60 text-xs text-app-text-muted">
                  Choose what it should open and generate it. Your print card
                  will appear here.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
};

export default Settings;
