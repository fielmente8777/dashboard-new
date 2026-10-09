import { useCallback } from "react";
import { useToast } from "../context/ToastContext";
import { getApiErrorMessage } from "../redux/api/baseApi";

// some endpoints answer 200 with a "failed" flag instead of an error status
const isRejected = (result) =>
  result?.Status === false ||
  result?.status === false ||
  result?.success === false;

// Runs one mutation (or several in parallel) and shows a toast for the
// outcome. Resolves with the response, or null when it failed:
//
//   const run = useApiAction();
//   const saved = await run(saveRule(body), { success: "Rule saved" });
//   if (saved) closeForm();
export const useApiAction = () => {
  const { showToast } = useToast();

  return useCallback(
    async (
      request,
      { success, error = "Something went wrong. Please try again." } = {},
    ) => {
      const requests = Array.isArray(request) ? request : [request];

      try {
        const results = await Promise.all(requests.map((r) => r.unwrap()));
        const rejected = results.find(isRejected);

        if (rejected) {
          showToast({
            message: getApiErrorMessage({ data: rejected }, error),
            type: "error",
          });
          return null;
        }

        if (success) showToast({ message: success });
        return Array.isArray(request) ? results : (results[0] ?? true);
      } catch (err) {
        showToast({ message: getApiErrorMessage(err, error), type: "error" });
        return null;
      }
    },
    [showToast],
  );
};
