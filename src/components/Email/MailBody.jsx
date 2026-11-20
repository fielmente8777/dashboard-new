import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// The email itself, shown inline the way Gmail opens a message: on white,
// full width, as tall as the email (no inner scrollbar). Scripts never run;
// links open in a new tab. `phone` draws it at a phone's width.
const buildDoc = (html) => {
  const head = `<base target="_blank"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;background:#fff}body{overflow:hidden}img{max-width:100%;height:auto}</style>`;
  const source = String(html || "");
  if (/<head[^>]*>/i.test(source)) return source.replace(/<head[^>]*>/i, (m) => `${m}${head}`);
  return `<!doctype html><html><head><meta charset="utf-8">${head}</head><body>${source}</body></html>`;
};

export default function MailBody({ html, phone = false, className = "" }) {
  const frameRef = useRef(null);
  const [height, setHeight] = useState(400);
  const srcDoc = useMemo(() => buildDoc(html), [html]);

  const measure = useCallback(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc?.body) return;
    const next = Math.max(doc.body.scrollHeight, doc.documentElement?.scrollHeight || 0, 120);
    setHeight((current) => (Math.abs(current - next) > 2 ? next : current));
  }, []);

  // pictures load after the page: measure again when the email's size changes
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;
    let observer;
    const onLoad = () => {
      measure();
      const doc = frame.contentDocument;
      if (doc?.body && "ResizeObserver" in window) {
        observer?.disconnect();
        observer = new ResizeObserver(measure);
        observer.observe(doc.body);
      }
      doc?.querySelectorAll("img").forEach((img) => img.addEventListener("load", measure));
    };
    frame.addEventListener("load", onLoad);
    return () => {
      frame.removeEventListener("load", onLoad);
      observer?.disconnect();
    };
  }, [srcDoc, measure]);

  useEffect(() => {
    measure();
  }, [phone, measure]);

  return (
    <div className={`bg-white ${phone ? "flex justify-center bg-app-surface-secondary py-4" : ""} ${className}`}>
      <iframe
        ref={frameRef}
        title="Email"
        srcDoc={srcDoc}
        // same origin only to measure its height; no scripts
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        style={{ height }}
        className={`block border-0 bg-white ${phone ? "w-[390px] max-w-full rounded-xl shadow-md ring-1 ring-black/5" : "w-full"}`}
      />
    </div>
  );
}
