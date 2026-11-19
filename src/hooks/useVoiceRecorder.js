// src/hooks/useVoiceRecorder.js
import { useCallback, useEffect, useRef, useState } from "react";

// Chrome/Edge/Firefox record webm; Safari (macOS/iOS) records mp4.
const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

const pickMimeType = () => {
  if (typeof MediaRecorder === "undefined") return "";
  return MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t)) || "";
};

export default function useVoiceRecorder({ maxSeconds = 300 } = {}) {
  const [status, setStatus] = useState("idle"); // idle | recording | stopped
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState(null);
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(null);

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const urlRef = useRef(null);

  const isSupported =
    typeof window !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined";

  const clearTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop()); // turns off the mic light
    streamRef.current = null;
  };

  const setPreviewUrl = (next) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = next;
    setUrl(next);
  };

  const start = useCallback(async () => {
    setError(null);
    if (!isSupported) {
      setError("Voice recording isn't supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      const mimeType = pickMimeType();
      const rec = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      chunksRef.current = [];

      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const b = new Blob(chunksRef.current, {
          type: rec.mimeType || "audio/webm",
        });
        setBlob(b);
        setPreviewUrl(URL.createObjectURL(b));
        setStatus("stopped");
        stopTracks();
        clearTimer();
      };

      rec.start(250);
      recorderRef.current = rec;
      setBlob(null);
      setPreviewUrl(null);
      setSeconds(0);
      setStatus("recording");
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err) {
      stopTracks();
      setError(
        err?.name === "NotAllowedError"
          ? "Microphone permission denied. Allow mic access in your browser settings."
          : "Couldn't access the microphone.",
      );
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  // Discard current recording (or cancel one in progress)
  const reset = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state === "recording") {
      rec.onstop = () => stopTracks(); // don't produce a blob
      rec.stop();
    }
    recorderRef.current = null;
    chunksRef.current = [];
    clearTimer();
    stopTracks();
    setBlob(null);
    setPreviewUrl(null);
    setSeconds(0);
    setStatus("idle");
  }, []);

  // Auto-stop at the limit
  useEffect(() => {
    if (status === "recording" && seconds >= maxSeconds) stop();
  }, [seconds, status, maxSeconds, stop]);

  // Cleanup when the modal unmounts
  useEffect(
    () => () => {
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.onstop = null;
        recorderRef.current.stop();
      }
      clearTimer();
      stopTracks();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  return { status, seconds, blob, url, error, isSupported, start, stop, reset };
}
