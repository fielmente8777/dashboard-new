import { Lock } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Drawer from "../../../components/ui/Drawer";
import { ErrorState, Skeleton } from "../../../components/ui/States";

// The system prompt with the settings on screen, block by block.
const PromptPreviewDrawer = ({ open, onClose, preview, loading, error, onRetry }) => (
  <Drawer
    open={open}
    onClose={onClose}
    title="Prompt preview"
    description="What your assistant reads before every reply, with the settings on screen (saved skills and actions, unsaved agent edits). Working hours are not applied here."
  >
    {loading && <Skeleton className="h-96" />}
    {error && !loading && <ErrorState message="Could not build the preview." onRetry={onRetry} />}
    {preview && !loading && (
      <div className="space-y-3">
        <p className="text-sm text-app-text-muted">
          About <span className="font-semibold text-app-text">{preview.totalTokens.toLocaleString()} tokens</span> ({preview.totalChars.toLocaleString()} characters)
          {preview.tools.length > 0 && <> · {preview.tools.length} action{preview.tools.length > 1 ? "s" : ""}</>}
          {preview.skills.length > 0 && <> · {preview.skills.length} skill{preview.skills.length > 1 ? "s" : ""}</>}
        </p>
        <ol className="space-y-2">
          {preview.parts.map((part, i) => (
            <li key={part.id} className="rounded-lg border border-app-border! bg-app-surface">
              <details>
                <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm">
                  <span className="w-5 text-right text-xs text-app-text-faint">{i + 1}</span>
                  {part.type === "fixed" && <Lock className="size-3.5 text-app-text-faint" aria-label="Fixed" />}
                  <span className="min-w-0 flex-1 truncate font-medium text-app-text">{part.title}</span>
                  {part.type === "custom" && <Badge tone="purple">My rule</Badge>}
                  <span className="shrink-0 text-xs text-app-text-muted">~{part.tokens.toLocaleString()} tokens</span>
                </summary>
                <pre className="max-h-80 overflow-auto border-t border-app-border! px-3 py-2 text-xs whitespace-pre-wrap text-app-text-muted">{part.text}</pre>
              </details>
            </li>
          ))}
        </ol>
      </div>
    )}
  </Drawer>
);

export default PromptPreviewDrawer;
