import { CheckCircle2, Circle, MessageCircle, ShieldCheck } from "lucide-react";
import Card from "../../../components/ui/Card";
import Icon from "../../../components/ui/Icon";
import { SectionTitle } from "../components/sections/PersonaSection";
import { checklist, hasSimpleSidePanel, sampleChat } from "./simpleModel";

const Panel = ({ title, help, icon, children }) => (
  <Card aria-label={title} title={<SectionTitle icon={icon}>{title}</SectionTitle>} description={help}>
    {children}
  </Card>
);

// A WhatsApp-style sample chat made from the form
export const GuestChat = ({ lines, copy }) => (
  <ol className="space-y-2 rounded-xl bg-app-surface-secondary p-3" aria-label={copy.right.preview}>
    {lines.filter((l) => l.text).map((line, i) => {
      const guest = line.from === "guest";
      return (
        <li key={i} className={`flex ${guest ? "justify-end" : "justify-start"}`}>
          <p className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm shadow-sm ${guest ? "rounded-br-sm bg-app-accent-soft text-app-text" : "rounded-bl-sm bg-app-surface text-app-text"}`}>
            <span className="sr-only">{guest ? copy.right.guest : copy.right.assistant}: </span>
            {line.text}
          </p>
        </li>
      );
    })}
  </ol>
);

const SimpleSidePanel = ({ config, copy, tried, isBuiltIn, readOnly }) => {
  if (!hasSimpleSidePanel({ isBuiltIn, readOnly })) return null;
  const items = checklist(config, tried);
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Panel title={copy.right.preview} help={copy.right.previewHelp} icon={MessageCircle}>
        <GuestChat lines={sampleChat(config, copy)} copy={copy} />
      </Panel>
      <Panel title={copy.right.ready} icon={ShieldCheck}>
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.id} className="flex min-h-8 items-center gap-2 text-sm text-app-text">
                {item.done ? <Icon icon={CheckCircle2} className="text-app-success" /> : <Icon icon={Circle} tone="faint" />}
                <span className={item.done ? "" : "text-app-text-muted"}>
                  {copy.right.items[item.id]} {item.optional && !item.done && <span className="text-xs">{copy.right.optional}</span>}
                  <span className="sr-only">{item.done ? " ✓" : ""}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
    </div>
  );
};

export default SimpleSidePanel;
