import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Wraps an email body fragment in a minimal document so it renders
 * the way an inbox would. The iframe is sandboxed: no scripts run.
 */
// a whole document (an uploaded file, or gian's final email) is shown as it is
export const buildEmailDocument = (html = "") => /<html[\s>]/i.test(html) ? html : `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<base target="_blank" />
<style>
  html, body { margin: 0; padding: 0; }
  body { background: #ffffff; -webkit-text-size-adjust: 100%; }
  img { max-width: 100%; height: auto; }
</style>
</head>
<body>${html}</body>
</html>`;

export default function EmailPreviewFrame({
  html,
  title = "Email preview",
  className = "",
}) {
  const srcDoc = useMemo(() => buildEmailDocument(html), [html]);

  return (
    <iframe
      title={title}
      srcDoc={srcDoc}
      sandbox="allow-popups allow-popups-to-escape-sandbox"
      className={`block w-full border-0 bg-white ${className}`}
    />
  );
}

// the screen widths (CSS px) emails are laid out at: iPhone 15 / Pixel & Galaxy
const PREVIEW_WIDTHS = { desktop: 700, ios: 390, android: 412, mobile: 390 };
const PHONE_FRAME = {
  ios: { border: 10, radius: 44, bar: "ios" },
  android: { border: 8, radius: 26, bar: "android" },
  mobile: { border: 10, radius: 44, bar: "ios" },
};

// what sits above the email on a phone: a status bar and the mail app's header
function PhoneTop({ kind }) {
  return (
    <div className="relative bg-white" style={{ height: 30 }}>
      {kind === "ios" ? (
        <div className="absolute left-1/2 top-1.5 h-[18px] w-[90px] -translate-x-1/2 rounded-full bg-neutral-900" />
      ) : (
        <div className="absolute left-1/2 top-2 size-[11px] -translate-x-1/2 rounded-full bg-neutral-900" />
      )}
      <span className="absolute left-5 top-2 text-[10px] font-semibold text-neutral-800">9:41</span>
      <span className="absolute right-5 top-2 flex items-center gap-0.5">
        <span className="h-[7px] w-[3px] rounded-[1px] bg-neutral-800" />
        <span className="h-[9px] w-[3px] rounded-[1px] bg-neutral-800" />
        <span className="ml-1 h-[8px] w-[16px] rounded-[2px] border border-neutral-800" />
      </span>
    </div>
  );
}

/**
 * The email laid out at the width it was designed for, then scaled down to fit
 * its box, like an inbox shows it. A template built 1200px wide is shown whole
 * instead of cropped. On "mobile" it is drawn at a phone's width; a design
 * wider than that is shrunk to fit, as phone mail apps do, and reported through
 * onMeasure({ contentWidth, mobileFriendly }).
 *
 * The frame may read its own document (allow-same-origin) to measure it, but
 * runs no scripts.
 */
export function FittedEmailPreview({ html, device = "desktop", className = "", onMeasure }) {
  const srcDoc = useMemo(() => buildEmailDocument(html), [html]);
  const boxRef = useRef(null);
  const frameRef = useRef(null);
  const [boxWidth, setBoxWidth] = useState(0);
  const [content, setContent] = useState({ width: PREVIEW_WIDTHS[device], height: 600 });
  const baseWidth = PREVIEW_WIDTHS[device];

  // the width it is drawn at: the device's, or the design's own when wider
  const measure = useCallback(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc?.documentElement) return;
    const width = Math.max(baseWidth, doc.documentElement.scrollWidth, doc.body?.scrollWidth || 0);
    // the body's own height: the page's would never shrink below the frame
    const height = Math.max(doc.body?.scrollHeight || 0, 200);
    setContent((current) => (current.width === width && current.height === height ? current : { width, height }));
  }, [baseWidth]);

  // a new device or email: start from the device width again
  useEffect(() => {
    setContent({ width: baseWidth, height: 600 });
  }, [baseWidth, srcDoc]);

  // only a phone view tells whether the design fits a phone
  useEffect(() => {
    if (device === "desktop") return;
    onMeasure?.({ contentWidth: content.width, mobileFriendly: content.width <= baseWidth + 20 });
  }, [content.width, onMeasure, device, baseWidth]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return undefined;
    const observer = new ResizeObserver(([entry]) => setBoxWidth(entry.contentRect.width));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // follow late layout changes (fonts, pictures) inside the email
  const onLoad = () => {
    measure();
    const body = frameRef.current?.contentDocument?.body;
    if (!body) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(body);
    frameRef.current.__observer?.disconnect();
    frameRef.current.__observer = observer;
  };
  useEffect(() => () => frameRef.current?.__observer?.disconnect(), []);

  // phone: its own screen width (smaller when the box is narrow); desktop: the whole box
  const phone = PHONE_FRAME[device];
  const frameExtra = phone ? phone.border * 2 : 0;
  const screenWidth = phone ? Math.min(baseWidth, boxWidth - 32 - frameExtra) : boxWidth - 32;
  // the phone itself shrinks to fit the box; a too-wide design shrinks inside it, as mail apps do
  const phoneScale = phone && screenWidth > 0 ? screenWidth / baseWidth : 1;
  const scale = screenWidth > 0 ? Math.min(1, screenWidth / content.width) : 1;
  const topHeight = phone ? 30 * phoneScale : 0;

  return (
    <div
      ref={boxRef}
      className={`overflow-y-auto overflow-x-hidden bg-[repeating-linear-gradient(45deg,#eef0f3_0,#eef0f3_6px,#e6e9ee_6px,#e6e9ee_12px)] p-4 dark:bg-[repeating-linear-gradient(45deg,#1b1f27_0,#1b1f27_6px,#171a21_6px,#171a21_12px)] ${className}`}
    >
      <div
        className={`relative mx-auto overflow-hidden bg-white shadow-[0_6px_24px_rgba(0,0,0,0.18)] ring-1 ring-black/5 ${
          phone ? "border-neutral-900" : "rounded-md"
        }`}
        style={{
          width: (phone ? screenWidth : content.width * scale) + frameExtra,
          height: content.height * scale + topHeight + frameExtra,
          ...(phone && { borderWidth: phone.border, borderStyle: "solid", borderRadius: phone.radius }),
        }}
      >
        {phone && (
          <div className="origin-top-left" style={{ width: baseWidth, transform: `scale(${phoneScale})` }}>
            <PhoneTop kind={phone.bar} />
          </div>
        )}
        <iframe
          ref={frameRef}
          title="Email preview"
          srcDoc={srcDoc}
          onLoad={onLoad}
          sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          scrolling="no"
          className="absolute left-0 block origin-top-left border-0 bg-white"
          style={{ top: topHeight, width: content.width, height: content.height, transform: `scale(${scale})` }}
        />
      </div>
    </div>
  );
}

/**
 * Small, non-interactive, scaled-down preview for template cards.
 */
export function EmailThumbnail({ html, height = 190, scale = 0.4 }) {
  const srcDoc = useMemo(() => buildEmailDocument(html), [html]);

  return (
    <div
      className="pointer-events-none relative w-full overflow-hidden bg-app-surface-secondary"
      style={{ height }}
      aria-hidden="true"
    >
      <iframe
        title="Template thumbnail"
        srcDoc={srcDoc}
        sandbox=""
        tabIndex={-1}
        scrolling="no"
        loading="lazy"
        className="absolute left-0 top-0 origin-top-left border-0 bg-white"
        style={{
          width: `${100 / scale}%`,
          height: height / scale,
          transform: `scale(${scale})`,
        }}
      />
    </div>
  );
}
