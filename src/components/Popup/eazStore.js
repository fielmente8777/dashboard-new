// EazStore is one popup, owned by the navbar. On phones its button moves out
// of the navbar (into the account menu and the sidebar), so those places open
// it through this event instead of holding the popup themselves.
const OPEN_EVENT = "eazstore:open";

export const openEazStore = () => window.dispatchEvent(new Event(OPEN_EVENT));

// returns the cleanup, for useEffect
export const onOpenEazStore = (handler) => {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
};
