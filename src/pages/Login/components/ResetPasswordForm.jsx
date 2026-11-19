import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Check } from "lucide-react";
import Loader from "../../../components/Loader";
import {
  OTP_LENGTH,
  PASSWORD_RULES,
  resetPasswordSchema,
} from "../../../schema/authSchema";
import FormField from "./FormField";
import OtpInput from "./OtpInput";
import PasswordInput from "./PasswordInput";
import {
  inputClassName,
  primaryButtonClassName,
  textLinkClassName,
} from "./formStyles";

const RESEND_COOLDOWN_SECONDS = 30;

const ResetPasswordForm = ({
  defaultEmail = "",
  onSubmit,
  isSubmitting,
  onResendCode,
  isResending,
  onBackToLogin,
}) => {
  const {
    register,
    control,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: defaultEmail,
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = useWatch({ control, name: "password" }) || "";
  const emailLocked = Boolean(defaultEmail);

  // Countdown before the code can be sent again.
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!(await trigger("email"))) return;
    await onResendCode({ email: getValues("email") });
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormField label="Email" htmlFor="reset-email" error={errors.email?.message}>
        <input
          id="reset-email"
          type="email"
          autoComplete="email"
          placeholder="you@hotel.com"
          readOnly={emailLocked}
          aria-invalid={Boolean(errors.email)}
          className={`${inputClassName} ${emailLocked ? "opacity-70 cursor-not-allowed" : ""}`}
          {...register("email")}
        />
      </FormField>

      <FormField
        label="Verification code"
        htmlFor="reset-otp"
        error={errors.otp?.message}
      >
        <Controller
          name="otp"
          control={control}
          render={({ field }) => (
            <OtpInput
              id="reset-otp"
              length={OTP_LENGTH}
              value={field.value}
              onChange={field.onChange}
              invalid={Boolean(errors.otp)}
            />
          )}
        />
        <div className="flex items-center justify-between text-sm">
          <span className="text-app-text-muted">
            Sent to your email. Didn&apos;t get it?
          </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className={`${textLinkClassName} disabled:text-app-text-faint disabled:no-underline disabled:cursor-not-allowed`}
          >
            {isResending
              ? "Sending..."
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend code"}
          </button>
        </div>
      </FormField>

      <FormField
        label="New password"
        htmlFor="reset-password"
        error={errors.password?.message}
      >
        <PasswordInput
          id="reset-password"
          autoComplete="new-password"
          placeholder="Create a new password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs">
          {PASSWORD_RULES.map((rule) => {
            const passed = rule.test(password);
            return (
              <li
                key={rule.label}
                className={`flex items-center gap-1.5 transition-colors ${passed ? "text-green-600" : "text-app-text-faint"}`}
              >
                <span
                  className={`size-4 rounded-full flex items-center justify-center shrink-0 ${passed ? "bg-green-500/15" : "bg-app-text/5"}`}
                >
                  <Check className="size-2.5" strokeWidth={3} />
                </span>
                {rule.label}
              </li>
            );
          })}
        </ul>
      </FormField>

      <FormField
        label="Confirm new password"
        htmlFor="reset-confirm-password"
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          id="reset-confirm-password"
          autoComplete="new-password"
          placeholder="Re-enter the new password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting}
        className={primaryButtonClassName}
      >
        {isSubmitting ? "Updating..." : "Reset password"}
        {isSubmitting && <Loader size={18} color="white" />}
      </button>

      <p className="text-sm text-center text-app-text-muted">
        Remember your password?{" "}
        <button type="button" onClick={onBackToLogin} className={textLinkClassName}>
          Back to sign in
        </button>
      </p>
    </form>
  );
};

export default ResetPasswordForm;
