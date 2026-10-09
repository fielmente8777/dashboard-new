import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Loader from "../../../components/Loader";
import { forgotPasswordSchema } from "../../../schema/authSchema";
import FormField from "./FormField";
import {
  inputClassName,
  primaryButtonClassName,
  textLinkClassName,
} from "./formStyles";

const ForgotPasswordForm = ({ onSubmit, isSubmitting, onBackToLogin }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormField
        label="Email"
        htmlFor="forgot-email"
        error={errors.email?.message}
      >
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          placeholder="you@hotel.com"
          aria-invalid={Boolean(errors.email)}
          className={inputClassName}
          {...register("email")}
        />
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting}
        className={primaryButtonClassName}
      >
        {isSubmitting ? "Sending..." : "Send reset link"}
        {isSubmitting && <Loader size={18} color="white" />}
      </button>

      <p className="text-sm text-center text-app-text-muted">
        Remember your password?{" "}
        <button
          type="button"
          onClick={onBackToLogin}
          className={textLinkClassName}
        >
          Back to sign in
        </button>
      </p>
    </form>
  );
};

export default ForgotPasswordForm;
