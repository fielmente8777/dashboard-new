import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { BASE_PATH } from "../../routes/paths";
import { useTenant } from "../../hooks/useTenant";
import { ASK_ASSISTANT_EVENT } from "./askAssistant";
import { isFullScreenPage } from "./fullScreenPages";

// Loaded on first open, so react-markdown etc. stay out of the main bundle.
const ChatbotWindow = lazy(() => import("./ChatbotWindow"));

// Where the launcher sits: smaller and clear of the home bar on phones. Under dialogs and
// drawers (z 9995), so it never covers their buttons.
const placeClass =
  "fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] sm:right-6 sm:bottom-6 z-[9994]";
const faceClass =
  "rounded-2xl bg-gradient-to-br from-primary to-blue-600 dark:from-blue-600 dark:to-indigo-500 text-white shadow-xl";
const launcherClass = `${placeClass} ${faceClass} flex size-12 sm:size-14 items-center justify-center`;

const INTRO_KEY = "eazotel-ai-fab-intro";
const INTRO_MS = 4500;

/**
 * true while the page is being scrolled down: the launcher slides out of the way, so it
 * never sits on top of what the user is reading. It comes back on any scroll up, and at the
 * end of a page (pages keep empty room there for it, see PageShell). Only page-sized scroll
 * areas count, not small lists inside a page.
 */
function useHideWhileScrollingDown() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const last = new WeakMap();
    const onScroll = (event) => {
      const el = event.target === document ? document.scrollingElement : event.target;
      if (!(el instanceof Element) || el.clientHeight < window.innerHeight * 0.5) return;
      const top = el.scrollTop;
      const before = last.get(el) ?? top;
      last.set(el, top);
      const atEnd = top + el.clientHeight >= el.scrollHeight - 8;
      if (atEnd || top < 40) setHidden(false);
      else if (top > before + 6) setHidden(true);
      else if (top < before - 6) setHidden(false);
    };
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", onScroll, { capture: true });
  }, []);
  return hidden;
}

/**
 * The closed assistant: a sparkle button with an "AI" badge, a soft glow and a label
 * ("Ask Eazotel AI") that opens out on hover / keyboard focus, and by itself once per
 * session so new users learn what it is. Animations stop for reduced-motion users.
 */
function Launcher({ onOpen, docked }) {
  const hidden = useHideWhileScrollingDown();
  const [intro, setIntro] = useState(() => {
    try {
      return !sessionStorage.getItem(INTRO_KEY);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!intro) return undefined;
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // private mode: the intro just shows again next time
    }
    const timer = setTimeout(() => setIntro(false), INTRO_MS);
    return () => clearTimeout(timer);
  }, [intro]);

  // full-screen chat pages: a slim tab on the right edge, clear of the message box
  if (docked) {
    return (
      <button
        type="button"
        data-chatbot-fab
        onClick={onOpen}
        aria-label="Ask Eazotel AI assistant"
        title="Ask Eazotel AI"
        className={`group fixed right-0 top-1/2 z-[9994] flex -translate-y-1/2 flex-col items-center gap-1.5 rounded-l-xl py-3 pl-1.5 pr-1 transition-all duration-300 hover:pr-2.5 ${faceClass} ai-fab-glow`}
      >
        <Sparkles size={18} className="ai-fab-twinkle" />
        <span className="text-[11px] font-bold tracking-wide [writing-mode:vertical-rl]">Ask AI</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      data-chatbot-fab
      onClick={onOpen}
      aria-label="Ask Eazotel AI assistant"
      title="Ask Eazotel AI"
      className={`group ${placeClass} ${faceClass} ai-fab-glow flex h-12 items-center transition-all duration-300 ease-out hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 sm:h-14 ${
        hidden ? "pointer-events-none translate-y-[calc(100%+2rem)] opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <span className="flex size-12 shrink-0 items-center justify-center sm:size-14">
        <Sparkles size={24} className="ai-fab-twinkle" />
      </span>
      <span
        className={`ai-fab-shine relative overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 ease-out ${
          intro
            ? "max-w-44 pr-4 opacity-100"
            : "max-w-0 opacity-0 group-hover:max-w-44 group-hover:pr-4 group-hover:opacity-100 group-focus-visible:max-w-44 group-focus-visible:pr-4 group-focus-visible:opacity-100"
        }`}
      >
        Ask Eazotel AI
      </span>
      <span
        aria-hidden="true"
        className="absolute -right-1.5 -top-1.5 rounded-full bg-amber-400 px-1.5 py-px text-[10px] font-bold leading-4 text-gray-900 shadow ring-2 ring-app-bg"
      >
        AI
      </span>
    </button>
  );
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  // a question sent from elsewhere (see askAssistant), asked once in a new chat
  const [question, setQuestion] = useState(null);
  const { pathname } = useLocation();
  const { hid } = useTenant();

  useEffect(() => {
    const onAsk = (event) => {
      const text = String(event.detail?.question ?? "").trim();
      if (!text) return;
      setQuestion({ text, id: Date.now() });
      setIsOpen(true);
    };
    window.addEventListener(ASK_ASSISTANT_EVENT, onAsk);
    return () => window.removeEventListener(ASK_ASSISTANT_EVENT, onAsk);
  }, []);

  const close = () => {
    setIsOpen(false);
    setQuestion(null);
  };

  // only show inside the dashboard (hidden on login, signup, onboarding, plans, etc.)
  if (!pathname.startsWith(BASE_PATH)) return null;

  if (!isOpen) {
    return <Launcher onOpen={() => setIsOpen(true)} docked={isFullScreenPage(pathname)} />;
  }

  return (
    <Suspense
      fallback={
        <div className={launcherClass} aria-busy="true">
          <Loader2 size={24} className="animate-spin" />
        </div>
      }
    >
      {/* keyed by hotel: switching location starts that hotel's chat instead of showing the previous one */}
      <ChatbotWindow key={hid || "none"} hid={hid} question={question} onClose={close} />
    </Suspense>
  );
}
