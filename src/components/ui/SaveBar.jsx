import Button from "./Button";

// Sticks to the bottom of the page while a form has unsaved changes.
// pr-24 keeps the buttons clear of the AI assistant launcher, which is fixed
// at the bottom right corner (chatbot/ChatbotWidget.jsx: bottom-6 right-6, 56px; 48px on phones).
// Optional: onDiscard (no Discard button without it), saveIcon, `actions`
// (extra buttons before Save) and `children` (a notice above the row).
const SaveBar = ({
  show,
  message = "You have unsaved changes.",
  saveLabel = "Save changes",
  saveIcon,
  onSave,
  onDiscard,
  saving = false,
  disabled = false,
  actions,
  children,
}) =>
  show ? (
    <div className="anim-fade sticky bottom-0 z-10 space-y-3 rounded-xl border border-app-border! bg-app-surface py-3 pl-4 pr-4 shadow-lg sm:pr-24">
      {children}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <span className="mr-auto min-w-0 basis-40 grow text-sm text-app-text-muted" aria-live="polite">{message}</span>
        {onDiscard && (
          <Button variant="secondary" onClick={onDiscard} disabled={saving}>
            Discard
          </Button>
        )}
        {actions}
        {onSave && (
          <Button icon={saveIcon} onClick={onSave} loading={saving} disabled={disabled}>
            {saveLabel}
          </Button>
        )}
      </div>
    </div>
  ) : null;

export default SaveBar;
