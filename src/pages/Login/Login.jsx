import { useState } from "react";
import { Link } from "react-router-dom";
import { ONBOARDING_SIGNUP_URL } from "../../config/env";
import AuthLayout from "./components/AuthLayout";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import { textLinkClassName } from "./components/formStyles";
import GoogleSignInButton from "./components/GoogleSignInButton";
import LoginForm from "./components/LoginForm";
import { useForgotPassword } from "./hooks/useForgotPassword";
import { useLogin } from "./hooks/useLogin";

const Login = () => {
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const { loginWithPassword, loginWithGoogle, handleGoogleError, isLoggingIn } =
    useLogin();
  const { sendResetEmail, isLoading: isSendingReset } = useForgotPassword({
    onSuccess: () => setIsForgotPassword(false),
  });

  if (isForgotPassword) {
    return (
      <AuthLayout
        title="Forgot password?"
        subtitle="Enter your email and we will send you a reset link."
      >
        <ForgotPasswordForm
          onSubmit={sendResetEmail}
          isSubmitting={isSendingReset}
          onBackToLogin={() => setIsForgotPassword(false)}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your account."
    >
      <LoginForm
        onSubmit={loginWithPassword}
        isSubmitting={isLoggingIn}
        onForgotPassword={() => setIsForgotPassword(true)}
      />

      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-(--app-border-strong)" />
        <span className="text-xs uppercase tracking-wide text-app-text-faint">
          or
        </span>
        <span className="h-px flex-1 bg-(--app-border-strong)" />
      </div>

      <GoogleSignInButton
        onSuccess={loginWithGoogle}
        onError={handleGoogleError}
      />

      <p className="text-sm text-center text-app-text-muted">
        Don&apos;t have an account?{" "}
        <Link to={ONBOARDING_SIGNUP_URL} className={textLinkClassName}>
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
