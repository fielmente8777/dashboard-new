import { ChevronDown, Eye, EyeOff, MessageSquareText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";
import IconButton from "../../../components/ui/IconButton";
import { EmptyState } from "../../../components/ui/States";
import Switch from "../../../components/ui/Switch";

const isShown = (item) => item.active ?? true;
const CHOICE_TYPES = ["select", "radio", "checkbox"];

// The questions the bot asks, in order. The question text can be reworded
// and choice questions can have their options edited; the key and answer
// type are set by Eazotel.
const QuestionsSection = ({ flow, setQuestion, setOption, addOption, removeOption }) => {
  const [open, setOpen] = useState(null);

  if (flow.length === 0) {
    return (
      <EmptyState
        icon={MessageSquareText}
        title="No questions yet"
        description="The questions your bot asks are set up by the Eazotel team. Contact support to add them."
      />
    );
  }

  return (
    <ol className="space-y-2">
      {flow.map((question, index) => {
        const shown = isShown(question);
        const options = question.options || [];
        const hasChoices = CHOICE_TYPES.includes(question.type) || options.length > 0;
        const expanded = open === index;

        return (
          <li
            key={question.key || index}
            className={`rounded-lg border border-app-border! transition ${shown ? "" : "opacity-60"}`}
          >
            <div className="flex items-center gap-3 px-3 py-2.5">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-app-surface-secondary text-xs font-medium text-app-text-muted">
                {index + 1}
              </span>
              <Input
                aria-label={`Question ${index + 1}`}
                value={question.question || ""}
                onChange={(e) => setQuestion(index, { question: e.target.value })}
                className="flex-1"
              />
              <Badge className="hidden sm:inline-flex">{question.type}</Badge>
              {hasChoices && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setOpen(expanded ? null : index)}
                  aria-expanded={expanded}
                >
                  {options.length} {options.length === 1 ? "option" : "options"}
                  <Icon
                    icon={ChevronDown}
                    size="sm"
                    className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </Button>
              )}
              <Switch
                label={shown ? "Ask this question" : "Question is skipped"}
                checked={shown}
                onChange={(value) => setQuestion(index, { active: value })}
              />
            </div>

            {expanded && (
              <div className="space-y-2 border-t border-app-border! bg-app-surface-secondary/40 p-3">
                <div className="hidden grid-cols-[1fr_1fr_auto] gap-2 px-1 text-xs font-medium text-app-text-muted sm:grid">
                  <span>Shown to visitor</span>
                  <span>Saved as</span>
                  <span className="w-16" />
                </div>
                {options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`grid gap-2 sm:grid-cols-[1fr_1fr_auto] ${isShown(option) ? "" : "opacity-60"}`}
                  >
                    <Input
                      aria-label="Option label"
                      value={option.label || ""}
                      onChange={(e) => setOption(index, optionIndex, { label: e.target.value })}
                    />
                    <Input
                      aria-label="Option value"
                      value={option.value || ""}
                      onChange={(e) => setOption(index, optionIndex, { value: e.target.value })}
                      className="font-mono text-xs"
                    />
                    <div className="flex w-16 justify-end">
                      <IconButton
                        icon={isShown(option) ? Eye : EyeOff}
                        label={isShown(option) ? "Hide this option" : "Show this option"}
                        onClick={() => setOption(index, optionIndex, { active: !isShown(option) })}
                      />
                      <IconButton
                        icon={Trash2}
                        label="Remove option"
                        tone="danger"
                        onClick={() => removeOption(index, optionIndex)}
                      />
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="dashed" icon={Plus} onClick={() => addOption(index)}>
                  Add option
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default QuestionsSection;
