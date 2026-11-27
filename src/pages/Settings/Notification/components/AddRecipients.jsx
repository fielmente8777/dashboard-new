import { UserPlus } from "lucide-react";
import TagInput from "../../../../components/ui/TagInput";
import { useToast } from "../../../../context/ToastContext";

const EMAIL = /^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]+$/;

// Under the alert table: add a WhatsApp number or email of someone who isn't on the team (a
// manager, the owner's personal number). While typing, the hotel's own addresses, team and
// contacts are suggested; anything else can be typed. Once added it can be chosen in every
// lead source above; nothing is saved until Save.
//   phones   offer the WhatsApp field (the plan includes WhatsApp)
//   onAdd(kind, value) -> the value as saved, or null when it isn't valid
const AddRecipients = ({ phones = true, onAdd }) => {
  const { showToast } = useToast();

  const add = (kind) => (list) => {
    const raw = list[list.length - 1];
    if (!raw) return;
    if (kind === "email" && !EMAIL.test(String(raw).trim())) {
      showToast({ type: "error", message: `"${raw}" isn't an email address.` });
      return;
    }
    const saved = onAdd(kind, raw);
    if (!saved) {
      showToast({ type: "error", message: `"${raw}" needs the full number with country code, e.g. +91 98765 43210.` });
      return;
    }
    showToast({
      type: "success",
      message: `${kind === "phone" ? `+${saved}` : saved} added. Choose it in the lead sources above, then save.`,
    });
  };

  return (
    <div className="border-t border-app-border! bg-app-surface-secondary/30 px-4 py-4 sm:px-6">
      <p className="flex items-center gap-2 text-sm font-medium text-app-text">
        <UserPlus className="size-4 text-app-text-muted" aria-hidden />
        Someone else should get alerts?
      </p>
      <p className="mt-0.5 text-xs text-app-text-muted">
        Pick from the suggestions or type any number or email. It then appears in every list above.
      </p>
      <div className={`mt-3 grid gap-3 ${phones ? "sm:grid-cols-2" : ""}`}>
        {phones && <TagInput suggest="phone" value={[]} onChange={add("phone")} placeholder="WhatsApp number, e.g. +91 98765 43210" />}
        <TagInput suggest="email" value={[]} onChange={add("email")} placeholder="Email address" />
      </div>
    </div>
  );
};

export default AddRecipients;
