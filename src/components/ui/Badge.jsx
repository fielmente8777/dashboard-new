const TONES = {
  gray: "bg-gray-500/10 text-gray-600 dark:text-gray-300",
  green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  red: "bg-red-500/10 text-red-600 dark:text-red-400",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

const Badge = ({ tone = "gray", className = "", children }) => (
  <span
    className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium ${TONES[tone] || TONES.gray} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
