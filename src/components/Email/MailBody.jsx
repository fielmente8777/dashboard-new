import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// The email itself, shown inline the way Gmail opens a message: on white,
// full width, as tall as the email (no inner scrollbar). Scripts never run;
// links open in a new tab. `phone` draws it at a phone's width.
// Like Gmail: room around the email, and plain text in Gmail's own font and size.
//  - `defaults` go first, so an email's own fonts and colours still win
//  - `frame` goes last and wins over the email's "body{padding:0!important}":
//    the room around it (`pad` px), and a height that follows the content
const HEAD_OPEN = /<head(\s[^>]*)?>/i;
const buildDoc = (html, pad) => {
  const defaults = `<base target="_blank"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#202124;word-wrap:break-word}img{max-width:100%;height:auto}</style>`;
  const frame = `<style>html,html body{margin:0!important;background:#fff;height:auto!important;min-height:0!important}html body{padding:${pad}px ${pad + 4}px!important;overflow:hidden!important;box-sizing:border-box}html body::after{content:"";display:table;clear:both}</style>`;
  const source = String(html || "");
  if (HEAD_OPEN.test(source)) {
    const withDefaults = source.replace(HEAD_OPEN, (m) => `${m}${defaults}`);
    return /<\/head>/i.test(withDefaults) ? withDefaults.replace(/<\/head>/i, `${frame}</head>`) : `${withDefaults}${frame}`;
  }
  return `<!doctype html><html><head><meta charset="utf-8">${defaults}${frame}</head><body>${source}</body></html>`;
};

// an email taller than this is cut (nothing real is; a runaway layout would be)
const MAX_HEIGHT = 20000;

export default function MailBody({ html, phone = false, className = "" }) {
  const boxRef = useRef(null);
  const frameRef = useRef(null);
  const [height, setHeight] = useState(240);
  // the width the email is laid out at, when it is wider than its box (a 600 px email on a phone)
  const [contentWidth, setContentWidth] = useState(0);
  const [boxWidth, setBoxWidth] = useState(0);
  const growth = useRef({ delta: 0, repeats: 0 });
  const srcDoc = useMemo(() => buildDoc(html, phone ? 16 : 28), [html, phone]);

  const measure = useCallback(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc?.body) return;
    // the content's own height (the page's can't be used: it is never less than the frame)
    const next = Math.min(MAX_HEIGHT, Math.max(Math.ceil(doc.body.getBoundingClientRect().height), doc.body.scrollHeight, 120));
    setHeight((current) => {
      if (Math.abs(current - next) <= 2) return current;
      // An email sized by its window ("height: 100vh") grows by the same step every time the
      // frame grows: stop following it after a few steps instead of growing until the tab crashes.
      const delta = next - current;
      const g = growth.current;
      g.repeats = delta > 0 && Math.abs(delta - g.delta) <= 2 ? g.repeats + 1 : 0;
      g.delta = delta;
      return g.repeats >= 3 ? current : next;
    });
    const box = boxRef.current?.clientWidth || 0;
    const wide = Math.max(doc.documentElement.scrollWidth, doc.body.scrollWidth);
    // wider than the box: lay it out at its own width and shrink it, as phone mail apps do
    setContentWidth((current) => {
      const target = wide > box + 4 ? wide : 0;
      return Math.abs(current - target) > 4 ? target : current;
    });
  }, []);

  // a new email or device starts again
  useEffect(() => {
    growth.current = { delta: 0, repeats: 0 };
    setContentWidth(0);
  }, [srcDoc]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || !("ResizeObserver" in window)) return undefined;
    const observer = new ResizeObserver(([entry]) => setBoxWidth(Math.round(entry.contentRect.width)));
    observer.observe(box);
    return () => observer.disconnect();
  }, [phone]);

  // the box changed width (phone turned, Desktop / Phone switch): measure the email again
  useEffect(() => {
    setContentWidth(0);
    const timer = setTimeout(measure, 50);
    return () => clearTimeout(timer);
  }, [boxWidth, measure]);

  const scale = contentWidth && boxWidth ? Math.min(1, boxWidth / contentWidth) : 1;

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

  const shrunk = scale < 1;
  const frame = (
    <div ref={boxRef} className="relative w-full overflow-hidden" style={{ height: Math.ceil(height * scale) }}>
      <iframe
        ref={frameRef}
        title="Email"
        srcDoc={srcDoc}
        // same origin only to measure its height; no scripts
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        style={{
          height,
          ...(shrunk && { width: contentWidth, transform: `scale(${scale})`, transformOrigin: "top left" }),
        }}
        className={`block border-0 bg-white ${shrunk ? "absolute left-0 top-0" : "w-full"}`}
      />
    </div>
  );

  // a phone: 390 px wide in a dark frame
  if (phone) {
    return (
      <div className={`flex justify-center ${className}`}>
        <div className="w-[406px] max-w-full rounded-[2rem] bg-slate-800 p-2 shadow-xl dark:bg-slate-700">
          <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-slate-600" />
          <div className="overflow-hidden rounded-[1.5rem] bg-white">{frame}</div>
          <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-slate-600" />
        </div>
      </div>
    );
  }

  // desktop: on white, full width, like Gmail
  return <div className={`bg-white ${className}`}>{frame}</div>;
}
