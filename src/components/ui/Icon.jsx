// The one way to draw an icon. Works with any icon component from
// lucide-react or react-icons:
//
//   <Icon icon={Phone} />                       16px, colour of the text around it
//   <Icon icon={Phone} size="xl" tone="muted" />
//   <Icon icon={Phone} size={28} className="text-emerald-500" />
//
// Both libraries draw with `currentColor`, so an icon always takes the text
// colour of its parent unless `tone` (or a text-* class, or `color`) says
// otherwise. `size="1em"` makes it scale with the font size instead.
const SIZES = { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, "2xl": 24 };

const TONES = {
  current: "",
  muted: "text-app-text-muted",
  faint: "text-app-text-faint",
  primary: "text-blue-500",
  success: "text-emerald-500",
  warning: "text-amber-500",
  danger: "text-red-500",
};

const Icon = ({
  icon,
  size = "md",
  tone = "current",
  className = "",
  ...props
}) => {
  const Glyph = icon;

  return (
    <Glyph
      size={SIZES[size] ?? size}
      aria-hidden="true"
      focusable="false"
      // never squashed by a flex parent
      className={`shrink-0 ${TONES[tone] || ""} ${className}`}
      {...props}
    />
  );
};

export default Icon;
