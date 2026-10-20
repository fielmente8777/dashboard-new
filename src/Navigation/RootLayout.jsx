import { useEffect } from "react";
import { Outlet, useNavigation, useRouteError } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ToastProvider } from "../context/ToastContext.jsx";
import { ConfirmProvider } from "../context/ConfirmContext.jsx";
import ChatbotWidget from "../components/chatbot/ChatbotWidget.jsx";

// Wraps every route. Anything that needs the router (useNavigate, useLocation)
// has to live in here rather than in main.jsx.
export default function RootLayout() {
  const navigation = useNavigation();

  return (
    <>
      {/* a page's code is downloaded on its first visit: show that something is happening */}
      {navigation.state === "loading" && (
        <div className="fixed inset-x-0 top-0 z-9999 h-0.5 animate-pulse bg-linear-to-r from-pink-500 to-violet-600" />
      )}
      <ToastProvider>
        <ConfirmProvider>
          <Outlet />
        </ConfirmProvider>
      </ToastProvider>
      <ChatbotWidget />
    </>
  );
}

// Shown while the first page's code loads.
export function RootFallback() {
  return (
    <div className="flex h-dvh items-center justify-center bg-app-bg">
      <Loader2 size={28} className="animate-spin text-violet-600" />
    </div>
  );
}

const RELOAD_KEY = "eazotel_chunk_reload";

// After a deploy the old page chunks are gone; an open tab then fails to load them.
const isStaleChunk = (error) =>
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    error?.message ?? "",
  );

export function RouteError() {
  const error = useRouteError();
  const staleChunk = isStaleChunk(error);

  useEffect(() => {
    if (!staleChunk) return;
    // reload to pick up the new build, but not again if that reload just failed too
    try {
      const last = Number(sessionStorage.getItem(RELOAD_KEY));
      if (Date.now() - last < 10_000) return;
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    } catch {
      return;
    }
    window.location.reload();
  }, [staleChunk]);

  useEffect(() => {
    if (!staleChunk) console.error(error);
  }, [error, staleChunk]);

  return (
    <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-lg font-semibold">
        {staleChunk ? "A new version is available" : "Something went wrong"}
      </p>
      <p className="max-w-md text-sm opacity-70">
        {staleChunk
          ? "Reload the page to continue."
          : "This page failed to load. Try again, or go back to the dashboard."}
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
      >
        Reload
      </button>
    </div>
  );
}
