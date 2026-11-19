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
      if (data?.success !== true) {
        showToast({
          message: data?.responseMessage || RESET_FAILED,
          type: "error",
        });
        return;
      }

      showToast({
        message: "Please check your email for the reset code.",
        type: "success",
      });
      onSuccess?.(values);
    } catch (error) {
      showToast({
        message: getApiErrorMessage(error, RESET_FAILED),
        type: "error",
      });
    }
  };

  return { sendResetEmail, isLoading };
};
