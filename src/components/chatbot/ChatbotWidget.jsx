import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { BASE_PATH } from "../../routes/paths";
import { useTenant } from "../../hooks/useTenant";
import { ASK_ASSISTANT_EVENT } from "./askAssistant";

// Loaded on first open, so react-markdown etc. stay out of the main bundle.
const ChatbotWindow = lazy(() => import("./ChatbotWindow"));

const launcherClass =
  // under dialogs and drawers (z 9995), so it never covers their buttons
  "fixed bottom-6 right-6 z-[9994] flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 dark:from-blue-600 dark:to-indigo-500 text-white shadow-xl transition hover:scale-105";

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
    return (
      <button type="button" onClick={() => setIsOpen(true)} aria-label="Ask Eazotel AI" title="Ask Eazotel AI" className={launcherClass}>
        <Sparkles size={26} />
      </button>
    );
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
