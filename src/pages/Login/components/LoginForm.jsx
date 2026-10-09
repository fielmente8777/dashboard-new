import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Loader from "../../../components/Loader";
import { loginSchema } from "../../../schema/authSchema";
import FormField from "./FormField";
import {
  inputClassName,
  primaryButtonClassName,
  textLinkClassName,
} from "./formStyles";
import PasswordInput from "./PasswordInput";

const LoginForm = ({ onSubmit, isSubmitting, onForgotPassword }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <FormField label="Email" htmlFor="email" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@hotel.com"
          aria-invalid={Boolean(errors.email)}
          className={inputClassName}
          {...register("email")}
        />
      </FormField>

      <FormField
        label="Password"
        htmlFor="password"
        error={errors.password?.message}
      >
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
      </FormField>

      <div className="flex justify-between items-center">
        <label
          htmlFor="remember"
          className="flex items-center gap-2 text-sm text-app-text-muted cursor-pointer"
        >
          <input
            type="checkbox"
            id="remember"
            className="size-4 accent-ternary"
          />
          Remember me
        </label>

        <button
          type="button"
          onClick={onForgotPassword}
          className={`text-sm ${textLinkClassName}`}
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={primaryButtonClassName}
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
        {isSubmitting ? <Loader size={18} color="white" /> : <SignInIcon />}
      </button>
    </form>
  );
};

export default LoginForm;

const SignInIcon = () => {
  return (
    <svg
      width="18"
      height="19"
      viewBox="0 0 18 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M9 18.5V16.5H16V2.5H9V0.5H16C16.55 0.5 17.0208 0.695833 17.4125 1.0875C17.8042 1.47917 18 1.95 18 2.5V16.5C18 17.05 17.8042 17.5208 17.4125 17.9125C17.0208 18.3042 16.55 18.5 16 18.5H9ZM7 14.5L5.625 13.05L8.175 10.5H0V8.5H8.175L5.625 5.95L7 4.5L12 9.5L7 14.5Z"
        fill="white"
      />
    </svg>
  );
};
