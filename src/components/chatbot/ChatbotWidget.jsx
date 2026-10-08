import { useState } from "react";
import ChatbotWindow from "./ChatbotWindow";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] =
    useState(false);

  return (
    <>
      {isOpen && (
        <ChatbotWindow
          onClose={() =>
            setIsOpen(false)
          }
        />
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() =>
            setIsOpen(true)
          }
          aria-label="Open AI assistant"
          className="
            fixed
            bottom-6
            right-6
            z-[9999]

            flex
            h-14
            w-14
            items-center
            justify-center

            rounded-full
            bg-black
            text-white

            shadow-xl

            transition-all
            duration-200

            hover:scale-105
            hover:shadow-2xl

            focus:outline-none
          "
        >
          <span className="text-2xl">
            🤖
          </span>
        </button>
      )}
    </>
  );
}