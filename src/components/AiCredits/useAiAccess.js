import { useGetAiStatusQuery } from "../../redux/api/aiCreditsApi";

// Whether this account's AI features run right now (gian /ai-credits/status).
// Refreshed every minute, when the tab regains focus, and right after any
// recharge, admin top-up or blocked AI request (they invalidate the AiWallet
// tag), so AI buttons turn back on without a reload or logout.
//
// The backend is the real gate: if this can't load, AI actions stay enabled
// and gian still refuses a request the wallet can't cover.
export const useAiAccess = () => {
  const { data, isLoading } = useGetAiStatusQuery(undefined, {
    pollingInterval: 60_000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: 30,
  });

  return {
    loading: isLoading,
    paused: Boolean(data?.paused),
    reason: data?.reason ?? null, // "insufficient_credits" | "wallet_suspended" | null
    availableCredits: data?.availableCredits ?? null,
    requiredCredits: data?.requiredCredits ?? null,
  };
};
