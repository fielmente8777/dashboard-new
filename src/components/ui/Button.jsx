import { Loader2 } from "lucide-react";
import Icon from "./Icon";

const VARIANTS = {
  primary:
    "bg-primary text-white hover:bg-primary/90 dark:bg-blue-600 dark:hover:bg-blue-500",
  secondary:
    "border border-app-border! bg-app-surface text-app-text hover:bg-app-surface-secondary",
  danger: "bg-red-600 text-white hover:bg-red-500",
  ghost:
    "text-app-text-muted hover:bg-app-surface-secondary hover:text-app-text",
  dashed:
    "border border-dashed border-app-border! text-app-text-muted hover:border-blue-500! hover:text-blue-500",
};

const SIZES = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-6 text-sm",
};

const Button = ({
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  children,
  ...props
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium transition active:scale-[0.97] disabled:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    {...props}
  >
    {loading ? (
      <Icon icon={Loader2} className="animate-spin" />
    ) : (
      icon && <Icon icon={icon} />
    )}
    {children}
  </button>
);

export default Button;
