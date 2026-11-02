const RELOAD_KEY = "eazotel_chunk_reload";

// After a deploy the old page chunks are gone; an open tab then fails to load them.
export const isStaleChunk = (error) =>
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    error?.message ?? "",
  );

// reload to pick up the new build, but not again if that reload just failed too
export const reloadForNewVersion = () => {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY));
    if (Date.now() - last < 10_000) return;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return;
  }
  window.location.reload();
};
