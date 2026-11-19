const Card = ({ title, description, actions, className = "", children }) => (
  <section
    className={`rounded-xl border border-app-border! bg-app-surface p-4 sm:p-5 ${className}`}
  >
    {(title || actions) && (
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-app-text">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-app-text-muted">{description}</p>
          )}
        </div>
        {actions}
      </div>
    )}
    {children}
  </section>
);

export default Card;
