import { useRef, useState, useEffect } from "react";
import { BsFillPlayFill, BsFillPauseFill } from "react-icons/bs";

export default function AudioMessage({ src }) {
  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  const updateProgress = () => {
    if (!audioRef.current) return;

    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration;

    setProgress((current / total) * 100);

    if (current === total) {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const metadata = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", metadata);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", metadata);
    };
  }, []);

  return (
    <div className="flex items-center gap-3 bg-gray-200 px-3 py-2 rounded-full w-[260px]">
      {/* Play Button */}
      <button
        onClick={togglePlay}
        className="bg-green-500 text-white rounded-full p-2"
      >
        {isPlaying ? (
          <BsFillPauseFill size={16} />
        ) : (
          <BsFillPlayFill size={16} />
        )}
      </button>

      {/* Progress Bar */}
      <div className="flex-1 h-1 bg-gray-400 rounded relative">
        <div
          className="absolute top-0 left-0 h-1 bg-green-500 rounded"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Hidden Audio */}
      <audio ref={audioRef} src={src} />
    </div>
  );
}
