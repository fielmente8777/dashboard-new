import Icon from "./Icon";

// One block of a settings page: a header saying what it is, the body, and an
// optional footer strip for a hint and the action that saves it.
//   id     - lets an in-page menu scroll to it
//   footer - left: a hint, right: buttons (put the hint first, then the buttons)
const SettingsCard = ({
  id,
  icon,
  title,
  description,
  actions,
  footer,
  className = "",
  bodyClassName = "",
  children,
}) => (
  <section
    id={id}
    className={`scroll-mt-4 overflow-hidden rounded-xl border border-app-border! bg-app-surface ${className}`}
  >
    <header className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-app-border! bg-app-surface-secondary text-app-text-muted">
            <Icon icon={icon} size="sm" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-app-text">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm leading-5 text-app-text-muted">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>

    {children ? (
      <div className={`px-4 py-4 sm:px-6 sm:py-5 ${bodyClassName}`}>{children}</div>
    ) : (
      <div className="pb-4 sm:pb-5" />
    )}

    {footer && (
      <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-app-border! bg-app-surface-secondary/50 px-4 py-3 text-xs text-app-text-muted sm:px-6 [&>*:first-child:not(button)]:mr-auto">
        {footer}
      </footer>
    )}
  </section>
);

export default SettingsCard;
