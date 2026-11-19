import { BookOpen, Clock, Hash, Lock, Pencil, Sparkles, Trash2 } from "lucide-react";
import Button from "../../../components/ui/Button";
import IconButton from "../../../components/ui/IconButton";
import PageShell from "../../../components/ui/PageShell";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../../components/ui/States";
import Icon from "../../../components/ui/Icon";

const getName = (item) =>
  item.knowledge_base?.kb_meta?.kb_name ||
  item.knowledge_base?.business?.brand ||
  item.client_name ||
  "Untitled";

// Step 1: the saved knowledge base(s). An account may only have one, so
// "Generate new" is only offered while the list is empty.
const SavedListStep = ({
  items,
  loading,
  error,
  openingId,
  onRetry,
  onEdit,
  onDelete,
  onCreateNew,
}) => {
  const hasSavedKb = items.length > 0;
  const generateButton = (
    <Button icon={Sparkles} onClick={onCreateNew}>
      Generate new
    </Button>
  );

  return (
    <PageShell
      title="Knowledge Base"
      description={
        hasSavedKb
          ? "What your AI knows about your property. Edit it below."
          : "Generate a knowledge base so your AI can answer guests about your property."
      }
      actions={
        hasSavedKb ? (
          <span
            title="Delete the existing knowledge base to generate a new one."
            className="flex items-center gap-1.5 rounded-lg border border-app-border! px-3 py-2 text-xs text-app-text-muted"
          >
            <Icon icon={Lock} size="xs" /> One knowledge base per account
          </span>
        ) : (
          !loading && !error && generateButton
        )
      }
    >
      {loading && <LoadingState label="Loading saved knowledge bases..." />}

      {!loading && error && <ErrorState message={error} onRetry={onRetry} />}

      {!loading && !error && !hasSavedKb && (
        <EmptyState
          icon={BookOpen}
          title="No knowledge base yet"
          description="Give us your website link and we will build one you can review and edit."
          action={generateButton}
        />
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {items.map((item) => {
            const domain =
              item.knowledge_base?.kb_meta?.source_domain || item.url;

            return (
              <div
                key={item._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-app-border! bg-app-surface p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-app-text">
                    {getName(item)}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-app-text-muted">
                    {domain && <span className="truncate">{domain}</span>}
                    {item.updatedAt && (
                      <span className="flex items-center gap-1">
                        <Icon icon={Clock} size="xs" />
                        {new Date(item.updatedAt).toLocaleString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-mono">
                      <Icon icon={Hash} size="xs" /> {item._id}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="secondary"
                    icon={Pencil}
                    loading={openingId === item._id}
                    onClick={() => onEdit(item._id)}
                  >
                    Edit
                  </Button>
                  <IconButton
                    icon={Trash2}
                    label="Delete knowledge base"
                    tone="danger"
                    onClick={() => onDelete(item)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
};

export default SavedListStep;
