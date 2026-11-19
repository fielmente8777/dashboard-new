import { ArrowRight, ClipboardList, MessageSquareHeart } from "lucide-react";
import Icon from "../../../../components/ui/Icon";

const ICONS = { "lead-generation": ClipboardList, "feedback-form": MessageSquareHeart };

// One template to start a flow from.
const FlowCard = ({ data, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(data)}
    className="group flex w-full items-start gap-4 rounded-xl border border-app-border! bg-app-surface p-4 text-left transition hover:border-blue-500! hover:shadow-sm"
  >
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
      <Icon icon={ICONS[data.id] || ClipboardList} size="lg" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold text-app-text">{data.title}</span>
      <span className="mt-0.5 block text-xs text-app-text-muted">{data.description}</span>
    </span>
    <Icon
      icon={ArrowRight}
      size="sm"
      tone="faint"
      className="mt-1 transition-transform group-hover:translate-x-0.5"
    />
  </button>
);

export default FlowCard;
