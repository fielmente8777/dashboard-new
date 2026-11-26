import { useState } from "react";
import { useConfirm } from "../../../context/ConfirmContext";
import { useToast } from "../../../context/ToastContext";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import {
  useGetAdsAccessQuery,
  useSetAdsBudgetMutation,
  useSetAdsStatusMutation,
} from "../../../redux/api/googleAdsApi";

const NOUN = { campaign: "campaign", adgroup: "ad group", ad: "ad" };

// Changing Google Ads from the page (owners and admins; gian checks again).
// Returns { access, canManage, isAdmin, reason, busyId, toggle(level, row),
// budgetFor, setBudgetFor, saveBudget(amount), savingBudget }.
export const useAdsManage = (accountId) => {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const access = useGetAdsAccessQuery(accountId, { skip: !accountId });
  const [setStatus] = useSetAdsStatusMutation();
  const [setBudget, { isLoading: savingBudget }] = useSetAdsBudgetMutation();
  const [busyId, setBusyId] = useState(null);
  const [budgetFor, setBudgetFor] = useState(null);

  const toggle = async (level, row) => {
    const resume = row.paused;
    const ok = await confirm(
      resume
        ? `“${row.name}” will start showing ads and spending again.`
        : `“${row.name}” will stop showing ads and spending until you switch it on.`,
      {
        title: resume ? `Switch on this ${NOUN[level]}?` : `Pause this ${NOUN[level]}?`,
        confirmText: resume ? "Switch on" : "Pause",
        variant: resume ? "primary" : "danger",
      },
    );
    if (!ok) return;
    setBusyId(row.id);
    try {
      await setStatus({ accountId, level, ids: [row.id], status: resume ? "ENABLED" : "PAUSED" }).unwrap();
      showToast({ message: resume ? "Switched on in Google Ads" : "Paused in Google Ads", type: "success" });
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Google Ads refused the change."), type: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const saveBudget = async (amount) => {
    try {
      await setBudget({ accountId, campaignId: budgetFor.id, dailyBudget: amount }).unwrap();
      showToast({ message: "Daily budget changed in Google Ads", type: "success" });
      setBudgetFor(null);
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Google Ads refused the budget."), type: "error" });
    }
  };

  const doc = access.data || {};
  return {
    access,
    canManage: Boolean(doc.canManage),
    isAdmin: Boolean(doc.isAdmin),
    reason: doc.reason || null,
    busyId,
    toggle,
    budgetFor,
    setBudgetFor,
    saveBudget,
    savingBudget,
  };
};
