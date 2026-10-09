import { ArrowLeft, RefreshCw, Save } from "lucide-react";
import { useCallback, useState } from "react";
import Button from "../../../components/ui/Button";
import PageShell from "../../../components/ui/PageShell";
import { useToast } from "../../../context/ToastContext";
import {
  HIDDEN_FIELDS,
  TOP_LEVEL_LEGACY_KEYS,
  deleteValueAtPath,
  setValueAtPath,
  slugifyKey,
} from "../utils/kbHelpers";
import { toSectionTab } from "../utils/sectionConfig";
import KnowledgeBaseSection from "./KnowledgeBaseSection";
import TabBar from "./TabBar";

// Step 3: review and edit the knowledge base, one section (tab) at a time.
// `savedId` is null for a freshly generated one that has not been saved yet.
const EditableKnowledgeBase = ({
  kb,
  setKb,
  savedId,
  updatedAt,
  saving,
  onSave,
  onStartOver,
  onBack,
}) => {
  const { showToast } = useToast();
  const [selectedTab, setSelectedTab] = useState(null);

  // stable, so the memoised editor fields only re-render when their value changes
  const handleChange = useCallback(
    (path, value) => setKb((prev) => setValueAtPath(prev, path, value)),
    [setKb],
  );
  const handleDelete = useCallback(
    (path) => setKb((prev) => deleteValueAtPath(prev, path)),
    [setKb],
  );

  const sectionEntries = Object.entries(kb).filter(
    ([key]) => !HIDDEN_FIELDS.has(key) && !TOP_LEVEL_LEGACY_KEYS.has(key),
  );
  // falls back to the first section if the selected one was deleted
  const activeEntry =
    sectionEntries.find(([key]) => key === selectedTab) || sectionEntries[0];

  const handleAddSection = (name) => {
    const key = slugifyKey(name);
    if (!key) return;

    if (Object.hasOwn(kb, key)) {
      showToast({
        message: "A section with that name already exists",
        type: "warning",
      });
      return;
    }

    handleChange([key], {});
    setSelectedTab(key);
  };

  return (
    <PageShell
      title="Review Knowledge Base"
      description={
        savedId
          ? `Last saved ${updatedAt ? new Date(updatedAt).toLocaleString() : "-"}. Update anything below, then save your changes.`
          : "We generated this from your source. Edit anything below, then publish when it looks right."
      }
      actions={
        // A saved knowledge base cannot be started over: the account is
        // limited to one, so it is edited in place or deleted from the list.
        savedId ? (
          <Button variant="secondary" icon={ArrowLeft} onClick={onBack}>
            Back to list
          </Button>
        ) : (
          <Button variant="secondary" icon={RefreshCw} onClick={onStartOver}>
            Start over
          </Button>
        )
      }
    >
      <TabBar
        sections={sectionEntries.map(toSectionTab)}
        activeKey={activeEntry?.[0]}
        onSelect={setSelectedTab}
        onAddSection={handleAddSection}
      />

      {activeEntry && (
        <KnowledgeBaseSection
          key={activeEntry[0]}
          sectionKey={activeEntry[0]}
          value={activeEntry[1]}
          onChange={handleChange}
          onDelete={handleDelete}
        />
      )}

      {/* stays in view while scrolling a long section */}
      <div className="sticky bottom-0 -mx-4 flex justify-end border-t border-app-border! bg-app-bg px-4 py-3 sm:-mx-6 sm:px-6">
        <Button size="lg" icon={Save} loading={saving} onClick={onSave}>
          {savedId ? "Save changes" : "Publish knowledge base"}
        </Button>
      </div>
    </PageShell>
  );
};

export default EditableKnowledgeBase;
