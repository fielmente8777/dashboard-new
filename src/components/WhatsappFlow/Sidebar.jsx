import { useState } from "react";
import { ArrowLeft, ChevronRight, CircleHelp, Plus } from "lucide-react";
import Icon from "../ui/Icon";
import { blockStyle } from "./blockStyles";

// what each question block is for, as shown in the palette
const QUESTION_BLOCKS = ["button", "list", "carousel"];

const BlockCard = ({ icon, tile, label, description, trailing, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="anim-lift group flex w-full items-start gap-3 rounded-xl border border-app-border! bg-app-surface p-3 text-left transition hover:border-blue-500!"
  >
    <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tile}`}>
      <Icon icon={icon} size="md" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-medium text-app-text">{label}</span>
      <span className="mt-0.5 block text-xs leading-snug text-app-text-muted">{description}</span>
    </span>
    <Icon
      icon={trailing}
      size="sm"
      className="mt-2 shrink-0 text-app-text-faint transition group-hover:text-blue-500"
    />
  </button>
);

export default function Sidebar({ addNode, addSendMessageNode }) {
  const [showQuestionMenu, setShowQuestionMenu] = useState(false);
  const message = blockStyle("sendMessage");

  return (
    <div className="scrollbar-hidden w-48 shrink-0 overflow-y-auto border-r border-app-border! bg-app-surface p-3 sm:w-64">
      {!showQuestionMenu ? (
        <>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-app-text-faint">
            Blocks
          </p>
          <p className="mb-3 text-xs text-app-text-muted">Click a block to add it to the canvas.</p>

          <div className="space-y-2">
            <BlockCard
              icon={message.icon}
              tile={message.tile}
              label="Send a message"
              description="No reply needed from the guest"
              trailing={Plus}
              onClick={() => addSendMessageNode("message")}
            />
            <BlockCard
              icon={CircleHelp}
              tile="bg-orange-500/15 text-orange-600 dark:text-orange-400"
              label="Ask a question"
              description="Buttons, a list or a carousel to choose from"
              trailing={ChevronRight}
              onClick={() => setShowQuestionMenu(true)}
            />
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setShowQuestionMenu(false)}
            className="-ml-1 mb-2 inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-medium text-app-text-muted transition hover:bg-app-surface-secondary hover:text-app-text"
          >
            <Icon icon={ArrowLeft} size="xs" /> All blocks
          </button>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-app-text-faint">
            Question blocks
          </p>

          <div className="space-y-2">
            {QUESTION_BLOCKS.map((type) => {
              const style = blockStyle(type);
              return (
                <BlockCard
                  key={type}
                  icon={style.icon}
                  tile={style.tile}
                  label={style.label}
                  description={style.description}
                  trailing={Plus}
                  onClick={() => addNode(type)}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
