import { useState } from "react";
import { useLocation } from "react-router-dom";
import ChatbotWindow from "./ChatbotWindow";
// import { BASE_PATH } from "../../routes/paths";
export default function ChatbotWidget() {
  const BASE_PATH = "/dashboard/client";
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  // only show inside the dashboard (hidden on login, signup, onboarding, plans, etc.)
  if (!pathname.startsWith(BASE_PATH)) return null;
  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Ask Eazotel AI"
          title="Ask Eazotel AI"
          className="fixed bottom-6 right-6 z-[9998] flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-3xl text-white shadow-xl transition hover:scale-105"
        >
          ✧
        </button>
      )}
      {isOpen && <ChatbotWindow onClose={() => setIsOpen(false)} />}
    </>
  );
}
