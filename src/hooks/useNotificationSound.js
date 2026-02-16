import { useEffect, useRef } from "react";

export default function useNotificationSound(src) {
  const audioRef = useRef(null);
  const unlockedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.preload = "auto";
    audioRef.current = audio;

    // 🔓 Unlock autoplay after first user interaction (browser policy)
    const unlock = () => {
      if (!audioRef.current || unlockedRef.current) return;

      audioRef.current
        .play()
        .then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          unlockedRef.current = true;
        })
        .catch(() => {});

      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };

    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);

    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [src]);

  const play = () => {
    if (!audioRef.current || !unlockedRef.current) return;

    audioRef.current.currentTime = 0; // allow rapid play
    audioRef.current.play().catch(() => {});
  };

  return play;
}
