import { useMemo } from "react";

/**
 * Wraps an email body fragment in a minimal document so it renders
 * the way an inbox would. The iframe is sandboxed: no scripts run.
 */
export const buildEmailDocument = (html = "") => `<!DOCTYPE html>
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

/**
 * Small, non-interactive, scaled-down preview for template cards.
 */
export function EmailThumbnail({ html, height = 190, scale = 0.4 }) {
  const srcDoc = useMemo(() => buildEmailDocument(html), [html]);

  return (
    <div
      className="pointer-events-none relative w-full overflow-hidden bg-gray-50"
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
