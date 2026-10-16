import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import { Input } from "../../../components/ui/Field";
import IconButton from "../../../components/ui/IconButton";
import { EMAIL_REGEX } from "../emailUtils";

// rows shown for review; the rest are still sent
const SHOWN = 300;

// Review the addresses found in an imported file before writing the email.
// `emails` is null while closed.
const ExcelRecipientsDialog = ({ emails, onClose, onContinue, preparing }) => {
  const [list, setList] = useState([]);

  useEffect(() => {
    if (emails) setList(emails);
  }, [emails]);

  const cleaned = [...new Set(list.map((e) => e.trim().toLowerCase()).filter(Boolean))];
  const valid = cleaned.filter((e) => EMAIL_REGEX.test(e));
  const invalidCount = cleaned.length - valid.length;

  const update = (index, value) => setList((prev) => prev.map((e, i) => (i === index ? value : e)));
  const remove = (index) => setList((prev) => prev.filter((_, i) => i !== index));

  return (
    <Dialog
      open={Boolean(emails)}
      onClose={onClose}
      size="lg"
      title="Check the imported list"
      description={`${valid.length.toLocaleString("en-IN")} valid ${valid.length === 1 ? "address" : "addresses"}${invalidCount ? `, ${invalidCount} to fix or remove` : ""}.`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={preparing}>
            Cancel
          </Button>
          <Button onClick={() => onContinue(valid)} loading={preparing} disabled={!valid.length}>
            Write email to {valid.length.toLocaleString("en-IN")}
          </Button>
        </>
      }
    >
      <div className="max-h-[50vh] space-y-1.5 overflow-y-auto pr-1">
        {list.slice(0, SHOWN).map((email, index) => {
          const bad = email.trim() && !EMAIL_REGEX.test(email.trim());
          return (
            <div key={index} className="flex items-center gap-2">
              <span className="w-8 shrink-0 text-right text-xs text-app-text-faint">{index + 1}</span>
              <Input
                type="email"
                value={email}
                onChange={(e) => update(index, e.target.value)}
                aria-invalid={bad}
                className={bad ? "border-red-500!" : ""}
              />
              <IconButton icon={X} label="Remove" tone="danger" onClick={() => remove(index)} />
            </div>
          );
        })}
      </div>
      {list.length > SHOWN && (
        <p className="mt-2 text-xs text-app-text-muted">
          Showing the first {SHOWN}. The other {(list.length - SHOWN).toLocaleString("en-IN")} are included too.
        </p>
      )}
      <Button
        variant="dashed"
        size="sm"
        icon={Plus}
        className="mt-3"
        onClick={() => setList((prev) => ["", ...prev])}
      >
        Add address
      </Button>
    </Dialog>
  );
};

export default ExcelRecipientsDialog;
