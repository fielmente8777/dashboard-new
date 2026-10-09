import { Check, MessageSquareWarning } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button";
import { Select, Textarea } from "../../../components/ui/Field";
import { CATEGORIES, DEFAULT_CATEGORY } from "../constants";
import Icon from "../../../components/ui/Icon";

const Quote = ({ label, children }) => (
  <div>
    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-amber-700/80 dark:text-amber-200/60">
      {label}
    </p>
    <p className="whitespace-pre-line text-sm text-app-text">{children}</p>
  </div>
);

// onApprove(item, rule) and onDismiss(item) resolve when the request is done.
const FlaggedReplyCard = ({ item, onApprove, onDismiss }) => {
  const [ruleText, setRuleText] = useState(item.suggestedRule || "");
  const [category, setCategory] = useState(item.category || DEFAULT_CATEGORY);
  const [pending, setPending] = useState(null); // "approve" | "dismiss"

  const act = async (action, request) => {
    setPending(action);
    await request();
    setPending(null);
  };

  return (
    <div className="space-y-3 rounded-xl border border-amber-500/40! bg-amber-500/5 p-4 sm:p-5">
      <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-200/80">
        <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/15">
          <Icon icon={MessageSquareWarning} />
        </span>
        Flagged
        {item.createdAt && ` ${new Date(item.createdAt).toLocaleString()}`}
      </div>

      <Quote label="AI said">{item.aiReply}</Quote>
      <Quote label="Correction">{item.clientCorrection}</Quote>

      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-amber-700/80 dark:text-amber-200/60">
          Suggested rule
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORIES}
            aria-label="Category"
            className="sm:w-48"
          />
          <Textarea
            rows={2}
            value={ruleText}
            onChange={(e) => setRuleText(e.target.value)}
            aria-label="Suggested rule"
            className="sm:flex-1"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          icon={Check}
          loading={pending === "approve"}
          disabled={!ruleText.trim() || Boolean(pending)}
          onClick={() =>
            act("approve", () =>
              onApprove(item, { ruleText: ruleText.trim(), category }),
            )
          }
        >
          Approve rule
        </Button>
        <Button
          variant="secondary"
          size="sm"
          loading={pending === "dismiss"}
          disabled={Boolean(pending)}
          onClick={() => act("dismiss", () => onDismiss(item))}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
};

export default FlaggedReplyCard;
