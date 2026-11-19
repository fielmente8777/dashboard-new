import { Coins, Plus } from "lucide-react";
import { useState } from "react";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import { Field, Textarea } from "../ui/Field";
import Icon from "../ui/Icon";
import { parseKeywordList } from "./seoUtils";

// Paste a list of keywords to track, with the credit cost against the
// balance. `onAdd(keywords)` resolves true when they were added.
const AddKeywordsDialog = ({
  open,
  onClose,
  onAdd,
  saving,
  description,
  placeholder,
  balance,
  costPerKeyword,
}) => {
  const [text, setText] = useState("");
  const keywords = parseKeywordList(text);
  const cost = keywords.length * costPerKeyword;
  const canAfford = balance == null || balance >= cost;

  const close = () => {
    setText("");
    onClose();
  };

  const submit = async () => {
    if (await onAdd(keywords)) close();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Track new keywords"
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button
            icon={Plus}
            loading={saving}
            disabled={!keywords.length || !canAfford}
            onClick={submit}
          >
            {keywords.length > 1 ? `Track ${keywords.length} keywords` : "Track keyword"}
          </Button>
        </>
      }
    >
      <Field label="Keywords" hint="One per line, or separated by commas.">
        <Textarea
          autoFocus
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
        />
      </Field>

      <div
        className={`mt-4 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${
          canAfford
            ? "bg-app-surface-secondary text-app-text-muted"
            : "bg-red-500/10 text-red-600 dark:text-red-400"
        }`}
      >
        <Icon icon={Coins} tone={canAfford ? "warning" : "danger"} />
        <span className="flex-1">
          {keywords.length ? (
            <>
              <span className="font-semibold text-app-text">{cost} credits</span>{" "}
              for {keywords.length} keyword{keywords.length === 1 ? "" : "s"} (
              {costPerKeyword} each)
            </>
          ) : (
            `${costPerKeyword} credits per keyword`
          )}
        </span>
        {balance != null && (
          <span className="tabular-nums">
            {canAfford ? `Balance ${balance}` : `Only ${balance} left`}
          </span>
        )}
      </div>
    </Dialog>
  );
};

export default AddKeywordsDialog;
