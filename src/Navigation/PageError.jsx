import { AlertTriangle, Check, Copy, House, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, isRouteErrorResponse, useLocation, useParams, useRouteError } from "react-router-dom";
import Button from "../components/ui/Button";
import { useToast } from "../context/ToastContext";
import { BASE_PATH } from "../routes/paths";
import { isStaleChunk, reloadForNewVersion } from "./staleChunk";

// "/dashboard/client/123/integration/exotel" -> "Integration › Exotel"
const pageName = (pathname, home) =>
  pathname
    .slice(home.length)
    .split("/")
    .filter((part) => part && !/^\d+$/.test(part) && part.length < 30)
    .map((part) => decodeURIComponent(part).replace(/[-_]/g, " ").replace(/^\w/, (c) => c.toUpperCase()))
    .join(" › ") || "Dashboard";

const describe = (error) => {
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText || ""}`.trim();
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error ?? "Unknown error");
};

// where in our code it broke: the first stack line that points at our source
const whereFrom = (error) =>
  String(error?.stack || "")
    .split("\n")
    .slice(1)
    .map((line) => line.trim())
    .find((line) => /\/src\/|\/assets\//.test(line))
    ?.replace(/\?t=\d+/, "")
    .replace(/https?:\/\/[^/]+/, "") || "";

// Shown in place of one dashboard page when it crashes. The sidebar and the
// navbar stay, so the user can open any other page (that clears this), and
// the error is spelled out on screen so a screenshot is enough to debug it.
export default function PageError() {
  const error = useRouteError();
  const { pathname } = useLocation();
  const { hid } = useParams();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const staleChunk = isStaleChunk(error);

  const home = `${BASE_PATH}/${hid}`;
  const page = pageName(pathname, home);
  const details = useMemo(
    () => ({
      page,
      error: describe(error),
      at: whereFrom(error),
      url: pathname,
      hid,
      time: new Date().toLocaleString("en-IN"),
    }),
    // one snapshot per error
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [error],
  );

  useEffect(() => {
    if (staleChunk) {
      reloadForNewVersion();
      return;
    }
    console.error(error);
    toast?.showToast({
      type: "error",
      title: `${page} couldn't load`,
      message: details.error,
      duration: 10000,
    });
    // once per error
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const report = [
    `Page: ${details.page}`,
    `Error: ${details.error}`,
    details.at && `At: ${details.at}`,
    `URL: ${details.url}`,
    `Hotel ID: ${details.hid}`,
    `Time: ${details.time}`,
  ]
    .filter(Boolean)
    .join("\n");

  const copy = () =>
    navigator.clipboard?.writeText(report).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {},
    );

  if (staleChunk) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-lg font-semibold text-app-text">A new version is available</p>
        <Button icon={RotateCcw} onClick={() => window.location.reload()}>
          Reload
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <section className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-red-500/30! bg-app-surface">
        <div className="flex items-start gap-3 border-b border-app-border! bg-red-500/5 p-4 sm:p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-app-text">{page} couldn&apos;t load</h1>
            <p className="mt-0.5 text-sm text-app-text-muted">
              The rest of the dashboard works: pick another page from the menu, or try this one
              again. If it keeps happening, send a screenshot of this box to Eazotel support.
            </p>
          </div>
        </div>

        <dl className="space-y-2 p-4 text-sm sm:p-5">
          <div>
            <dt className="text-xs text-app-text-muted">Error</dt>
            <dd className="mt-0.5 break-words rounded-lg bg-app-surface-secondary px-3 py-2 font-mono text-xs text-red-600 dark:text-red-400">
              {details.error}
            </dd>
          </div>
          {details.at && (
            <div>
              <dt className="text-xs text-app-text-muted">Where</dt>
              <dd className="mt-0.5 break-all font-mono text-xs text-app-text-muted">{details.at}</dd>
            </div>
          )}
          <div className="grid grid-cols-1 gap-2 pt-1 text-xs sm:grid-cols-3">
            <div className="min-w-0">
              <dt className="text-app-text-muted">Page</dt>
              <dd className="truncate text-app-text" title={details.url}>{details.url}</dd>
            </div>
            <div>
              <dt className="text-app-text-muted">Hotel ID</dt>
              <dd className="font-mono text-app-text">{details.hid}</dd>
            </div>
            <div>
              <dt className="text-app-text-muted">Time</dt>
              <dd className="text-app-text">{details.time}</dd>
            </div>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2 border-t border-app-border! p-4 sm:px-5">
          <Button icon={RotateCcw} onClick={() => window.location.reload()}>
            Try again
          </Button>
          <Button variant="secondary" icon={copied ? Check : Copy} onClick={copy}>
            {copied ? "Copied" : "Copy error details"}
          </Button>
          <Link to={home} className="sm:ml-auto">
            <Button variant="ghost" icon={House}>
              Dashboard home
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
