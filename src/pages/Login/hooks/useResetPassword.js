import { useState } from "react";
import { useToast } from "../../../context/ToastContext";

// UI only for now: the backend has no reset-password endpoint yet.
// To connect it:
//   1. add a `resetPassword` mutation to redux/api/authApi.js
//      (body: { email, otp, password }),
//   2. call it in `resetPassword` below and call `options.onSuccess()` when
//      the server confirms, which shows the "Password updated" screen.
export const useResetPassword = (options = {}) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const resetPassword = async (values) => {
    setIsLoading(true);
    try {
      // TODO: replace with the API call, for example:
      // const data = await resetPasswordMutation(values).unwrap();
      // if (data?.Status !== true) {
      //   showToast({ message: data?.Message || "Could not reset password.", type: "error" });
      //   return;
      // }
      // options.onSuccess?.();
      console.info("Reset password submitted (not connected yet)", {
        email: values.email,
        hasCallback: Boolean(options.onSuccess),
      });
      showToast({
        message: "Password reset is not connected to the server yet.",
        type: "info",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { resetPassword, isLoading };
};
