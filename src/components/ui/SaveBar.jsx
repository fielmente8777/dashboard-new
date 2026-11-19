import Button from "./Button";

// Sticks to the bottom of the page while a form has unsaved changes.
// pr-24 keeps the buttons clear of the AI assistant launcher, which is fixed
// at the bottom right corner (chatbot/ChatbotWidget.jsx: bottom-6 right-6, 56px).
const SaveBar = ({
  show,
  message = "You have unsaved changes.",
  saveLabel = "Save changes",
  onSave,
  onDiscard,
  saving = false,
  disabled = false,
}) =>
  show ? (
    <div className="anim-fade sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-app-border! bg-app-surface py-3 pl-4 pr-24 shadow-lg">
      <span className="mr-auto text-sm text-app-text-muted">{message}</span>
      <Button variant="secondary" onClick={onDiscard} disabled={saving}>
        Discard
      </Button>
      <Button onClick={onSave} loading={saving} disabled={disabled}>
        {saveLabel}
      </Button>
    </div>
  ) : null;

export default SaveBar;
