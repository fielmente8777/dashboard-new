import { Images } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Field, Input } from "../../../components/ui/Field";
import { PAGES, dashboardPath } from "../../../routes/paths";

// How photos / videos / documents go out when a guest asks for them
// (gian: config.mediaReplies, action send_media). Part of the agent draft.
const MODES = [
  { value: "match_request", label: "As the guest asks", hint: "Photos, videos and PDFs are sent as files. If the guest asks for a link, they get a link." },
  { value: "files", label: "Always send files", hint: "Always attach the photo, video or PDF itself (a file the channel can't carry goes as a link)." },
  { value: "links", label: "Always send links", hint: "Always reply with links to the files instead of attaching them." },
];
const DEFAULTS = { deliveryMode: "match_request", maxItems: 3 };

const MediaRepliesCard = ({ agent, hid }) => {
  const [, setParams] = useSearchParams();
  const settings = { ...DEFAULTS, ...(agent.draft.mediaReplies || {}) };
  const set = (key, value) => agent.set("mediaReplies", { ...settings, [key]: value });

  return (
    <section aria-labelledby="media-replies-title" className="rounded-xl border border-app-border! bg-app-surface p-4">
      <h2 id="media-replies-title" className="flex items-center gap-2 text-sm font-semibold text-app-text">
        <Images className="size-4 text-app-text-muted" aria-hidden="true" /> Media replies
      </h2>
      <p className="mt-0.5 text-xs text-app-text-muted">When a guest asks for photos, videos, a menu or a PDF, the agent sends them from your media library.</p>

      <fieldset className="mt-3 space-y-2">
        <legend className="sr-only">How media is sent</legend>
        {MODES.map((mode) => (
          <label key={mode.value} className={`flex cursor-pointer gap-3 rounded-lg border p-2.5 ${settings.deliveryMode === mode.value ? "border-app-accent! bg-app-accent-soft" : "border-app-border! hover:bg-app-surface-secondary"}`}>
            <input
              type="radio"
              name="media-delivery"
              className="mt-0.5 accent-blue-600"
              value={mode.value}
              checked={settings.deliveryMode === mode.value}
              onChange={() => set("deliveryMode", mode.value)}
            />
            <span>
              <span className="block text-sm font-medium text-app-text">{mode.label}</span>
              <span className="block text-xs text-app-text-muted">{mode.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <Field label="Most files per reply" className="mt-3" hint="1 to 10. Keeps the chat tidy.">
        <Input
          type="number"
          min={1}
          max={10}
          value={settings.maxItems}
          onChange={(e) => {
            const n = Math.round(Number(e.target.value));
            if (Number.isFinite(n)) set("maxItems", Math.min(10, Math.max(1, n)));
          }}
        />
      </Field>

      <p className="mt-3 text-xs text-app-text-muted">
        Uses the files in your{" "}
        <Link className="text-blue-600 hover:underline dark:text-blue-400" to={dashboardPath(PAGES.KNOWLEDGE_BASE, { hid })}>media library (Knowledge Base)</Link>
        . Turn the{" "}
        <button type="button" className="text-blue-600 hover:underline dark:text-blue-400" onClick={() => setParams((p) => { p.set("tab", "actions"); return p; })}>
          “Send photos, videos &amp; documents”
        </button>
        {" "}action off to stop sending media. You can also add a rule (e.g. “Only send links for videos”) with Add rule.
      </p>
    </section>
  );
};

export default MediaRepliesCard;
