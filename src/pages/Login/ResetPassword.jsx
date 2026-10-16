import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CircleCheck } from "lucide-react";
import { ROUTES } from "../../routes/paths";
import AuthLayout from "./components/AuthLayout";
import ResetPasswordForm from "./components/ResetPasswordForm";
import { primaryButtonClassName } from "./components/formStyles";
import { useForgotPassword } from "./hooks/useForgotPassword";
import { useResetPassword } from "./hooks/useResetPassword";

// Opened from the link in the reset email: /reset-password?email=you@hotel.com
// The user enters the code from that email and picks a new password.
const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromLink = searchParams.get("email")?.trim() || "";
  const [isDone, setIsDone] = useState(false);

  const { resetPassword, isLoading } = useResetPassword({
    onSuccess: () => setIsDone(true),
  });
  // "Resend code" uses the existing forgot-password email endpoint.
  const { sendResetEmail, isLoading: isResending } = useForgotPassword();

  const goToLogin = () => navigate(ROUTES.LOGIN);

  if (isDone) {
    return (
      <AuthLayout
        title="Password updated"
        subtitle="Your password has been changed. Sign in with your new password."
      >
        <div className="flex justify-center">
          <span className="size-16 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center">
            <CircleCheck className="size-8" />
          </span>
        </div>
        <button type="button" onClick={goToLogin} className={primaryButtonClassName}>
          Back to sign in
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      compact
      title="Reset your password"
      subtitle={
        emailFromLink
          ? "Enter the 6-digit code we emailed you and choose a new password."
          : "Enter your email, the 6-digit code we sent you, and a new password."
      }
    >
      <ResetPasswordForm
        defaultEmail={emailFromLink}
        onSubmit={resetPassword}
        isSubmitting={isLoading}
        onResendCode={sendResetEmail}
        isResending={isResending}
        onBackToLogin={goToLogin}
      />
    </AuthLayout>
  );
};

export default ResetPassword;
