import { ROUTES } from "../../../routes/paths";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../context/ToastContext";
import {
  useGoogleLoginMutation,
  useLoginMutation,
} from "../../../redux/api/authApi";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { setSession } from "../../../utils/session";

const LOGIN_FAILED = "Login failed. Please enter correct username and password";
const GOOGLE_LOGIN_FAILED = "Failed to authenticate. Please try again.";

export const useLogin = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [googleLogin, { isLoading: isGoogleLoggingIn }] =
    useGoogleLoginMutation();

  const loginWithPassword = async (credentials) => {
    try {
      const data = await login(credentials).unwrap();
      if (!data?.Status || !data?.Token) {
        showToast({ message: LOGIN_FAILED, type: "error" });
        return;
      }

      setSession(data.Token);
      showToast({
        message: data.Message || "Logged in Successfully",
        type: "success",
      });
      navigate(ROUTES.ROOT);
    } catch (error) {
      showToast({
        message: getApiErrorMessage(error, LOGIN_FAILED),
        type: "error",
      });
    }
  };

  const loginWithGoogle = async ({ credential }) => {
    try {
      const data = await googleLogin(credential).unwrap();
      if (!data?.status || !data?.token) {
        showToast({ message: GOOGLE_LOGIN_FAILED, type: "error" });
        return;
      }

      setSession(data.token);
      showToast({ message: "Logged in Successfully", type: "success" });
      navigate(
        data.onboarding ? ROUTES.ROOT : ROUTES.ONBOARDING_FORM,
      );
    } catch (error) {
      showToast({
        message: getApiErrorMessage(error, GOOGLE_LOGIN_FAILED),
        type: "error",
      });
    }
  };

  const handleGoogleError = () => {
    showToast({ message: "Login failed. Please try again", type: "error" });
  };

  return {
    loginWithPassword,
    loginWithGoogle,
    handleGoogleError,
    isLoggingIn,
    isGoogleLoggingIn,
  };
};
