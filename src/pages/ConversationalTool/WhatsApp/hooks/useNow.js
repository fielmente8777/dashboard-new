import { useEffect, useState } from "react";

// The time now, refreshed every `everyMs` (a minute by default), for countdowns
// such as the 24-hour reply window. Runs only in the browser: nothing is asked
// of the server.
export const useNow = (everyMs = 60_000) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(timer);
  }, [everyMs]);
  return now;
};
