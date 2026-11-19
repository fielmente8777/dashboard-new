import { useEffect, useRef, useState } from "react";
import { API_URLS } from "../../../../config/env";
import { getToken } from "../../../../utils/session";

const PROGRESS_URL = `${API_URLS.node}/api/v1/seo/seo-intelligence/progress`;
const RECONNECT_MS = 3000;

// Live progress of a geo-grid scan, pushed by the server (Server-Sent
// Events). Returns the latest { step, percent, status, detail } while a scan
// is running or just finished, `null` otherwise. Calls `onDone` once per
// finished scan.
export const useScanProgress = (onDone) => {
  const [progress, setProgress] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    let source = null;
    let retryTimer = null;
    let closed = false;
    let doneReported = true; // nothing running yet

    const connect = () => {
      // EventSource cannot send headers, so the token goes in the URL
      source = new EventSource(
        `${PROGRESS_URL}?token=${encodeURIComponent(getToken() || "")}`,
      );

      source.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }
        if (!data || data.status === "idle") return;

        const finished = data.status === "done" || data.status === "failed";
        // the server may replay the last scan's result on connect; only
        // report an end we saw running
        if (finished && doneReported) return;

        setProgress(data);
        setDismissed(false);

        if (finished) {
          doneReported = true;
          if (data.status === "done") onDoneRef.current?.();
        } else {
          doneReported = false;
        }
      };

      source.onerror = () => {
        source.close();
        if (!closed) retryTimer = setTimeout(connect, RECONNECT_MS);
      };
    };

    connect();
    return () => {
      closed = true;
      clearTimeout(retryTimer);
      source?.close();
    };
  }, []);

  const visible = progress && !dismissed && progress.status !== "queued";

  return {
    progress: visible ? progress : null,
    dismiss: () => setDismissed(true),
  };
};
