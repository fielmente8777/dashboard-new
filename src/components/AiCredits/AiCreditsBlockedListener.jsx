import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { PAGES, dashboardPath } from "../../routes/paths";
import { AI_CREDITS_BLOCKED_EVENT } from "../../utils/aiCreditsEvents";
import { formatCredits } from "./aiCredits";

// One notice, wherever an AI request was refused for lack of AI credits (or a
// suspended wallet): the reason, the balance and a way to recharge. Several
// refusals at once (e.g. a page firing two AI calls) show it only once.
const QUIET_MS = 8000;

const AiCreditsBlockedListener = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const lastShown = useRef(0);

  useEffect(() => {
    const onBlocked = (event) => {
      if (Date.now() - lastShown.current < QUIET_MS) return;
      lastShown.current = Date.now();
      const { code, message, availableCredits } = event.detail || {};
      const suspended = code === "WALLET_SUSPENDED";

      showToast({
        type: "error",
        title: suspended ? "AI wallet suspended" : "AI features are paused",
        message:
          (message || "Your AI credits are exhausted. Please recharge your wallet to continue using AI features.") +
          (!suspended && availableCredits != null ? ` Available balance: ${formatCredits(availableCredits)} credits.` : ""),
        duration: 8000,
        action: suspended
          ? undefined
          : { label: "Recharge AI wallet", onClick: () => navigate(dashboardPath(PAGES.AI_WALLET)) },
      });
    };
    window.addEventListener(AI_CREDITS_BLOCKED_EVENT, onBlocked);
    return () => window.removeEventListener(AI_CREDITS_BLOCKED_EVENT, onBlocked);
  }, [navigate, showToast]);

  return null;
};

export default AiCreditsBlockedListener;
