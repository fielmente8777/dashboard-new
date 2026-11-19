// Standard page frame: padding and the page header. The header and each
// section below it fade in one after another. Pages fill the available
// width; pass maxWidth (e.g. "max-w-2xl") for a narrow, centred one.
const PageShell = ({
  title,
  description,
  actions,
  maxWidth = "max-w-none",
  children,
}) => (
  <div className="min-h-full p-4 sm:p-6">
    <div className={`anim-stagger mx-auto space-y-5 ${maxWidth}`}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-app-text">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-app-text-muted">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </header>
      {children}
    </div>
  </div>
);

export default PageShell;
