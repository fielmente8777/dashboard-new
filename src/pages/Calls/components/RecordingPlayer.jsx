import { Loader2, Play, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "../../../components/ui/Button";
import { API_URLS } from "../../../config/env";
import { getToken } from "../../../utils/session";
import { voiceCleaner } from "../../../utils/voiceCleaner";
import Icon from "../../../components/ui/Icon";

// Plays the recording of one call. The audio is behind our API (it needs
// the login token), so it is downloaded first and played from memory.
// With `autoLoad` it starts loading straight away, otherwise on click.
// "Clear voice" (a trial, see utils/voiceCleaner.js) plays a cleaned copy:
// less background noise, the quiet side louder. It is made in the browser
// the first time it is switched on, and the original stays one click away.
const RecordingPlayer = ({ callSid, autoLoad = false }) => {
  const [started, setStarted] = useState(autoLoad);
  const [original, setOriginal] = useState(null); // { blob, url }
  const [failed, setFailed] = useState(false);
  const [clear, setClear] = useState(false);
  const [cleanUrl, setCleanUrl] = useState(null);
  const [cleaning, setCleaning] = useState(false);
  const [cleanFailed, setCleanFailed] = useState(false);
  const audioRef = useRef(null);
  const resumeRef = useRef(null); // where to carry on after switching

  useEffect(() => {
    if (!started || !callSid) return;

    const controller = new AbortController();
    let objectUrl = null;
    setOriginal(null);
    setFailed(false);

    fetch(`${API_URLS.node}/api/v1/call/recording/${callSid}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to fetch recording");
        return response.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setOriginal({ blob, url: objectUrl });
      })
      .catch((error) => {
        if (error.name !== "AbortError") setFailed(true);
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [started, callSid]);

  // the cleaned copy, made once per recording
  useEffect(() => {
    if (!clear || !original || cleanUrl || cleanFailed) return;
    let cancelled = false;
    setCleaning(true);
    voiceCleaner
      .clean(original.blob)
      .then((blob) => {
        if (!cancelled) setCleanUrl(URL.createObjectURL(blob));
      })
      .catch(() => {
        if (!cancelled) {
          setCleanFailed(true);
          setClear(false);
        }
      })
      .finally(() => {
        if (!cancelled) setCleaning(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clear, original, cleanUrl, cleanFailed]);

  useEffect(
    () => () => {
      if (cleanUrl) URL.revokeObjectURL(cleanUrl);
    },
    [cleanUrl],
  );

  if (!started) {
    return (
      <Button variant="secondary" icon={Play} onClick={() => setStarted(true)}>
        Play recording
      </Button>
    );
  }

  if (failed) {
    return (
      <p className="text-sm text-red-500">
        Could not load the recording. Please try again later.
      </p>
    );
  }

  if (!original) {
    return (
      <p className="flex items-center gap-2 py-3 text-sm text-app-text-muted">
        <Icon icon={Loader2} className="animate-spin" /> Loading recording...
      </p>
    );
  }

  const src = clear && cleanUrl ? cleanUrl : original.url;

  const toggleClear = () => {
    const audio = audioRef.current;
    resumeRef.current = audio
      ? { time: audio.currentTime, playing: !audio.paused }
      : null;
    setClear((on) => !on);
  };

  return (
    <div className="space-y-2">
      <audio
        ref={audioRef}
        key={src}
        controls
        autoPlay={!resumeRef.current}
        src={src}
        className="w-full"
        onLoadedMetadata={(e) => {
          const resume = resumeRef.current;
          if (!resume) return;
          e.currentTarget.currentTime = resume.time;
          if (resume.playing) e.currentTarget.play().catch(() => {});
          resumeRef.current = null;
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={clear}
          disabled={cleaning}
          onClick={toggleClear}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
            clear
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-app-surface-secondary text-app-text-muted hover:text-app-text"
          }`}
        >
          <Icon
            icon={cleaning ? Loader2 : Sparkles}
            size="xs"
            className={cleaning ? "animate-spin" : ""}
          />
          {cleaning ? "Cleaning..." : "Clear voice"}
        </button>
        <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
          Beta
        </span>
        {clear && cleanUrl && (
          <span className="text-xs text-app-text-muted">
            Less background noise, the quiet side louder
          </span>
        )}
        {cleanFailed && (
          <span className="text-xs text-red-500">
            Could not clean this recording. Playing the original.
          </span>
        )}
      </div>
    </div>
  );
};

export default RecordingPlayer;
