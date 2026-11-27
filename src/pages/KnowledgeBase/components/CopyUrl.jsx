import { Check, Copy } from "lucide-react";
import { fileNameOf, useCopyUrl } from "../utils/copyUrl";

/**
 * The picture's link on one line with a Copy button.
 *   tone "light": on a page; "dark": over a picture (white text on a dark bar)
 */
export default function CopyUrl({ url, tone = "light", className = "" }) {
  const { copy, copied } = useCopyUrl();
  const done = copied === url;
  const dark = tone === "dark";
  return (
    <div className={`flex min-w-0 items-center gap-1.5 ${className}`}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title={url}
        onClick={(e) => e.stopPropagation()}
        className={`min-w-0 flex-1 truncate text-xs hover:underline ${dark ? "text-white/90" : "text-app-text-muted hover:text-blue-600 dark:hover:text-blue-400"}`}
      >
        {dark ? fileNameOf(url) : url}
      </a>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          copy(url);
        }}
        aria-label={done ? "Link copied" : "Copy link"}
        title={done ? "Copied" : "Copy link"}
        className={`flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium transition ${
          dark ? "bg-white/90 text-gray-800 hover:bg-white" : "border border-app-border! text-app-text hover:bg-app-surface-secondary"
        }`}
      >
        {done ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
        <span className={dark ? "hidden sm:inline" : ""}>{done ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
