import { useEffect, useState } from "react";

// below Tailwind's `sm`: too narrow for popovers, they open as bottom sheets
const PHONE_QUERY = "(max-width: 639px)";

// True on a phone; follows the phone turning, or the window being resized.
export const useIsPhone = () => {
  const [isPhone, setIsPhone] = useState(() => window.matchMedia(PHONE_QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(PHONE_QUERY);
    const onChange = () => setIsPhone(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return isPhone;
};

// Stops the page behind a sheet from scrolling along with it.
export const useLockBodyScroll = (locked) => {
  useEffect(() => {
    if (!locked) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [locked]);
};
