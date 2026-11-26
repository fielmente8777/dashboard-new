import { useRef, useState } from "react";
import Button from "../../components/ui/Button";
import Dialog from "../../components/ui/Dialog";
import { Field, Input } from "../../components/ui/Field";
import SuggestionMenu from "../../components/ui/SuggestionMenu";
import { useSuggestions } from "../../components/ui/useSuggestions";
import TagInput from "../../components/ui/TagInput";
import { useToast } from "../../context/ToastContext";
import { newsletterError, useAddSubscriberMutation } from "../../redux/api/newsletterApi";
import { EMAIL_REGEX } from "./newsletterUtils";

// Add one person by hand, e.g. a guest who asked at the front desk.
export default function AddSubscriberDialog({ open, onClose }) {
  const { showToast } = useToast();
  const [add, { isLoading }] = useAddSubscriberMutation();
  const [email, setEmail] = useState("");
  // suggestions from saved contacts and leads while the address is typed
  const emailWrapRef = useRef(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const suggestions = useSuggestions({ type: "email", query: email, open: emailFocused });
  const pick = (s) => {
    setEmail(s.value);
    setError("");
    // a contact's or lead's name fills the name box when it is still empty
    if (["contact", "lead"].includes(s.source) && s.label) setName((n) => n || s.label);
    setEmailFocused(false);
  };
  const [name, setName] = useState("");
  const [tags, setTags] = useState([]);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    setEmail("");
    setName("");
    setTags([]);
    setConsent(false);
    setError("");
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      await add({ email: email.trim(), name: name.trim() || null, tags }).unwrap();
      showToast({ message: `${email.trim()} added` });
      close();
    } catch (err) {
      setError(newsletterError(err));
    }
  };

  return (
    <Dialog
      open={open}
      title="Add subscriber"
      description="They'll get your newsletters from now on, each with a link to unsubscribe."
      onClose={close}
      sheetOnPhone
      footer={
        <>
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button type="submit" form="add-subscriber" loading={isLoading} disabled={!email.trim() || !consent}>
            Add subscriber
          </Button>
        </>
      }
    >
      <form id="add-subscriber" onSubmit={submit} className="space-y-4">
        <Field label="Email" error={error}>
          <div ref={emailWrapRef}>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              onKeyDown={(e) => suggestions.onKeyDown(e, pick)}
              autoComplete="off"
              autoFocus
              required
              placeholder="guest@example.com"
            />
          </div>
          <SuggestionMenu state={suggestions} anchorRef={emailWrapRef} onPick={pick} />
        </Field>
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="Optional" />
        </Field>
        <Field as="div" label="Groups" hint="Optional, e.g. Past guests, Corporate">
          <TagInput value={tags} onChange={setTags} placeholder="Add a group and press Enter" />
        </Field>
        <label className="flex items-start gap-2 text-sm text-app-text">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 size-4 accent-blue-600"
          />
          This person agreed to get emails from us.
        </label>
      </form>
    </Dialog>
  );
}
