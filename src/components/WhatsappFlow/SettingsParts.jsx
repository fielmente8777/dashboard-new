import Button from "../ui/Button";

// Pieces shared by the block settings forms in the settings drawer.

// A titled group of fields.
export function SettingsSection({ title, description, actions, children }) {
  return (
    <section className="space-y-3 rounded-xl border border-app-border! bg-app-surface p-4">
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-semibold text-app-text">{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-app-text-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

// Cancel + Save, kept in view at the bottom of the drawer.
export function SettingsFooter({ onCancel, onSave, saving = false, saveLabel = "Save" }) {
  return (
    <div className="sticky -bottom-4 z-10 -mx-4 -mb-4 mt-5 sm:-bottom-5 flex justify-end gap-2 border-t border-app-border! bg-app-bg/95 px-4 py-3 backdrop-blur sm:-mx-5 sm:-mb-5 sm:px-5">
      <Button variant="secondary" onClick={onCancel} disabled={saving}>
        Cancel
      </Button>
      <Button onClick={onSave} loading={saving}>
        {saveLabel}
      </Button>
    </div>
  );
}
