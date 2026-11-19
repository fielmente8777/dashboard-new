import { useToast } from "../../../context/ToastContext";
import { useResetPasswordMutation } from "../../../redux/api/authApi";
import { getApiErrorMessage } from "../../../redux/api/baseApi";

const RESET_FAILED = "Could not reset your password. Please try again.";

export const useResetPassword = ({ onSuccess } = {}) => {
  const { showToast } = useToast();
  const [resetPasswordMutation, { isLoading }] = useResetPasswordMutation();

  const resetPassword = async ({ email, otp, password }) => {
    try {
      const data = await resetPasswordMutation({ email, otp, password }).unwrap();
      if (data?.success !== true) {
        showToast({
          message: data?.responseMessage || RESET_FAILED,
          type: "error",
        });
        return;
      }
      onSuccess?.();
    } catch (error) {
      showToast({
        message: getApiErrorMessage(error, RESET_FAILED),
        type: "error",
      });
    }
  };

  return { resetPassword, isLoading };
};
