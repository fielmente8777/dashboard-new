import { useEffect, useState } from "react";

// Breakpoints match Tailwind: md = 768px, lg = 1024px
export const MOBILE_QUERY = "(max-width: 767px)";
export const DESKTOP_QUERY = "(min-width: 1024px)";

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);

    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return matches;
};

export default useMediaQuery;
