import { useCallback, useEffect, useRef, useState } from "react";
import { transcribeAudio } from "../services/chatbot.service";

// gian's speech-to-text takes about 30 seconds of audio per request
const MAX_SECONDS = 30;

// the first format this browser can record (Safari has no webm)
const pickMimeType = () =>
  ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find(
    (type) => window.MediaRecorder?.isTypeSupported?.(type),
  ) || "";

export const isVoiceInputSupported = () =>
  typeof window !== "undefined" &&
  Boolean(navigator.mediaDevices?.getUserMedia) &&
  typeof window.MediaRecorder !== "undefined";

// Press to talk: records from the microphone, then sends the recording to
// gian for text. onText(text) gets the result; onError(message) a reason to show.
//   status: "idle" | "recording" | "transcribing"
export const useVoiceInput = ({ onText, onError }) => {
  const [status, setStatus] = useState("idle");
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const cancelledRef = useRef(false);

  const releaseMic = () => {
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  // closing the chat mid-recording must free the microphone
  useEffect(() => () => {
    cancelledRef.current = true;
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    releaseMic();
  }, []);

  const stop = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  const start = useCallback(async () => {
    if (!isVoiceInputSupported()) {
      onError?.("This browser can't record audio.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks = [];
      cancelledRef.current = false;

      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onstop = async () => {
        releaseMic();
        if (cancelledRef.current) return;
        setStatus("transcribing");
        try {
          const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || "audio/webm" });
          const { text } = await transcribeAudio(blob);
          onText?.(text);
        } catch (error) {
          onError?.(error.message);
        } finally {
          setStatus("idle");
        }
      };

      recorderRef.current = recorder;
      recorder.start();
      setSeconds(0);
      setStatus("recording");
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) recorder.state === "recording" && recorder.stop();
          return s + 1;
        });
      }, 1000);
    } catch (error) {
      releaseMic();
      setStatus("idle");
      onError?.(
        error?.name === "NotAllowedError"
          ? "Microphone access is blocked. Allow it in the browser's site settings."
          : "Could not start the microphone.",
      );
    }
  }, [onText, onError]);

  // drop the recording without sending it
  const cancel = useCallback(() => {
    cancelledRef.current = true;
    stop();
    setStatus("idle");
  }, [stop]);

  return { status, seconds, maxSeconds: MAX_SECONDS, start, stop, cancel };
};
