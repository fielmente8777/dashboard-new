// src/components/Notes/VoiceRecorder.jsx
import { useEffect } from "react";
import { FaMicrophone, FaStop, FaTrash } from "react-icons/fa";
import useVoiceRecorder from "../hooks/useVoiceRecorder";

export const formatDuration = (s = 0) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * Sits in the bottom-left of the textarea.
 * - existingAudio: { url, duration } when editing a note that already has a voice note
 * - onChange(recording | null): recording = { blob, duration, mimeType }
 * - onRecordingChange(bool): lets the modal disable Save while recording
 */
export default function VoiceRecorder({
  existingAudio,
  onChange,
  onRecordingChange,
  disabled,
  maxSeconds = 300,
}) {
  const { status, seconds, blob, url, error, isSupported, start, stop, reset } =
    useVoiceRecorder({ maxSeconds });

  useEffect(() => {
    onRecordingChange?.(status === "recording");
    if (status === "stopped" && blob) {
      onChange?.({ blob, duration: seconds, mimeType: blob.type });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, blob]);

  const handleDiscard = () => {
    reset();
    onChange?.(null);
  };

  // 1) Recording in progress
  if (status === "recording") {
    return (
      <div className="flex items-center gap-2 w-full">
        <span className="relative flex size-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
          <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
        </span>
        <span className="text-xs font-medium text-red-600 tabular-nums">
          Recording {formatDuration(seconds)} / {formatDuration(maxSeconds)}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDiscard}
            aria-label="Cancel recording"
            className="size-8 rounded-full bg-app-surface-secondary hover:bg-gray-200 dark:hover:bg-white/10 text-app-text-faint flex items-center justify-center transition-colors"
          >
            <FaTrash size={11} />
          </button>
          <button
            type="button"
            onClick={stop}
            aria-label="Stop recording"
            className="size-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
          >
            <FaStop size={10} />
          </button>
        </div>
      </div>
    );
  }

  // 2) New recording or saved voice note -> preview player
  const previewUrl = url || existingAudio?.url;
  if (previewUrl) {
    return (
      <div className="flex items-center gap-2 w-full">
        <audio
          controls
          src={previewUrl}
          preload="metadata"
          className="h-8 flex-1 min-w-0"
        />
        <button
          type="button"
          onClick={handleDiscard}
          disabled={disabled}
          aria-label="Delete voice note"
          className="size-8 shrink-0 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <FaTrash size={11} />
        </button>
      </div>
    );
  }

  // 3) Idle -> mic button
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={start}
        disabled={disabled || !isSupported}
        aria-label="Record voice note"
        title={
          isSupported
            ? "Record voice note"
            : "Recording not supported in this browser"
        }
        className="size-8 rounded-full bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <FaMicrophone size={13} />
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
