import { useToast } from "../../../context/ToastContext";
import { useForgotPasswordMutation } from "../../../redux/api/authApi";
import { getApiErrorMessage } from "../../../redux/api/baseApi";

const RESET_FAILED = "There was an error sending the email. Please try again.";

export const useForgotPassword = ({ onSuccess } = {}) => {
  const { showToast } = useToast();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const sendResetEmail = async (values) => {
    try {
      const data = await forgotPassword(values).unwrap();
      if (data?.Status !== true) {
        showToast({ message: data?.Message || RESET_FAILED, type: "error" });
        return;
      }

      showToast({
        message: "Please check your email to reset your password.",
        type: "success",
      });
      onSuccess?.();
    } catch (error) {
      showToast({
        message: getApiErrorMessage(error, RESET_FAILED),
        type: "error",
      });
    }
  };

  return { sendResetEmail, isLoading };
};
