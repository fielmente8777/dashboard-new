import { useState } from "react";
import ChatbotWindow from "./ChatbotWindow";
export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  return <>
    {!isOpen && <button type="button" onClick={() => setIsOpen(true)} aria-label="Ask Eazotel AI" title="Ask Eazotel AI" className="fixed bottom-6 right-6 z-[9998] flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 text-3xl text-white shadow-xl transition hover:scale-105">✧</button>}
    {isOpen && <ChatbotWindow onClose={() => setIsOpen(false)} />}
  </>;
}