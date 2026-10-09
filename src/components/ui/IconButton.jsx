import Icon from "./Icon";

const TONES = {
  default:
    "text-app-text-muted hover:bg-app-surface-secondary hover:text-app-text",
  danger: "text-red-500 hover:bg-red-500/10",
  success: "text-emerald-500 hover:bg-emerald-500/10",
};

// `label` is required: it is the tooltip and the accessible name.
// `icon` is any lucide-react or react-icons component; `size` as in Icon.
const IconButton = ({
  icon,
  label,
  tone = "default",
  size = "md",
  className = "",
  ...props
}) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition active:scale-90 disabled:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 ${TONES[tone]} ${className}`}
    {...props}
  >
    <Icon icon={icon} size={size} />
  </button>
);

export default IconButton;
