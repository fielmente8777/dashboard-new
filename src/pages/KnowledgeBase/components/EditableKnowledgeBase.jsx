import { ArrowLeft, FileUp, RefreshCw, Save } from "lucide-react";
import { useCallback, useState } from "react";

import Button from "../../../components/ui/Button";
import PageShell from "../../../components/ui/PageShell";
import { useConfirm } from "../../../context/ConfirmContext";
import { useToast } from "../../../context/ToastContext";

import {
  HIDDEN_FIELDS,
  TOP_LEVEL_LEGACY_KEYS,
  deleteValueAtPath,
  setValueAtPath,
  slugifyKey,
} from "../utils/kbHelpers";

import { toSectionTab } from "../utils/sectionConfig";
import ImportDocumentsDialog from "./ImportDocumentsDialog";
import KnowledgeBaseSection from "./KnowledgeBaseSection";
import TabBar from "./TabBar";
import MediaTab from "./MediaTab";
import useKbMediaDraft from "../hooks/useKbMediaDraft";
import useKbMediaPlacement, { KbPlacementContext } from "../hooks/useKbMediaPlacement";

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
  const { confirm } = useConfirm();
  // imported images wait for "Save changes" (removed if the editor is left without saving)
  const media = useKbMediaDraft();
  // ...and each one is placed in the document by its title (Rooms › Inventory › Deluxe Room)
  const placement = useKbMediaPlacement({ draftId: media.draftId, count: media.count, kb, setKb });

  const handleSave = async () => {
    const saved = await onSave();
    if (!saved || !media.count) return;
    try {
      const n = await media.publish();
      showToast({ message: `${n} image${n === 1 ? "" : "s"} added to the Knowledge Base.`, type: "success" });
    } catch (error) {
      showToast({ message: error?.data?.error || "The knowledge base was saved, but the new images could not be added. Click Save changes again.", type: "error" });
    }
  };

  // Media is a permanent tab, not a dynamic KB section.
  const [selectedTab, setSelectedTab] = useState(null);
  const [importOpen, setImportOpen] = useState(false);

  const isMediaSelected = selectedTab === "__media__";

  // Update knowledge base fields.
  const handleChange = useCallback(
    (path, value) =>
      setKb((prev) => setValueAtPath(prev, path, value)),
    [setKb],
  );

  // Delete a knowledge base field.
  const handleDelete = useCallback(
    async (path) => {
      const name = String(path[path.length - 1]);

      const label = /^\d+$/.test(name)
        ? "this entry"
        : `"${name.replace(/_/g, " ")}"`;

      const confirmed = await confirm(
        `Remove ${label} from the knowledge base? It is gone once you save.`,
        {
          title: "Remove from knowledge base",
          confirmText: "Remove",
        },
      );

      if (confirmed) {
        setKb((prev) => deleteValueAtPath(prev, path));
      }

      return confirmed;
    },
    [setKb, confirm],
  );

  // Keep media_assets out of the dynamic Knowledge Base sections.
  const sectionEntries = Object.entries(kb || {}).filter(
    ([key]) =>
      key !== "media_assets" &&
      !HIDDEN_FIELDS.has(key) &&
      !TOP_LEVEL_LEGACY_KEYS.has(key),
  );

  const activeEntry =
    sectionEntries.find(([key]) => key === selectedTab) ||
    sectionEntries[0];

  // Add a normal Knowledge Base section.
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
          ? `Last saved ${
              updatedAt
                ? new Date(updatedAt).toLocaleString()
                : "-"
            }. Update anything below, then save your changes.`
          : "We generated this from your source. Edit anything below, then publish when it looks right."
      }
      actions={
        <div className="flex flex-wrap gap-2">
          {/* adds the content of the hotel's documents to this knowledge base */}
          <Button variant="secondary" icon={FileUp} onClick={() => setImportOpen(true)}>
            Import documents
          </Button>
          {/* A saved knowledge base cannot be started over: the account is
              limited to one, so it is edited in place or deleted from the list. */}
          {savedId ? (
            <Button variant="secondary" icon={ArrowLeft} onClick={onBack}>
              Back to list
            </Button>
          ) : (
            <Button variant="secondary" icon={RefreshCw} onClick={onStartOver}>
              Start over
            </Button>
          )}
        </div>
      }
    >
      <ImportDocumentsDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        kb={kb}
        setKb={setKb}
        // the imported content lives under knowledge_base: show that tab
        onSectionsChanged={(sections) => {
          if (sections.length && Object.hasOwn(kb, "knowledge_base")) setSelectedTab("knowledge_base");
        }}
      />
      <TabBar
  sections={sectionEntries
    .filter(([key]) => key !== "media_assets")
    .map(toSectionTab)}
  activeKey={isMediaSelected ? "__media__" : activeEntry?.[0]}
  onSelect={(key) => setSelectedTab(key)}
  onAddSection={handleAddSection}
  mediaActive={isMediaSelected}
  onMediaSelect={() => setSelectedTab("__media__")}
/>

      {/* NORMAL KNOWLEDGE BASE SECTION */}

     
{/* CONTENT RENDERING */}

{isMediaSelected ? (
  // images live in the Media library (and the KB index), not in this document
  <KbPlacementContext.Provider value={placement}>
    <MediaTab draftId={media.draftId} unsavedCount={media.count} />
  </KbPlacementContext.Provider>
) : (
  activeEntry && (
    <KnowledgeBaseSection
      sectionKey={activeEntry[0]}
      value={activeEntry[1]}
      onChange={handleChange}
      onDelete={handleDelete}
    />
  )
)}


      {/* SAVE CHANGES */}

      {/* pr-24: keeps the button clear of the floating AI assistant button (fixed bottom-6 right-6, 56px) */}
      <div className="sticky bottom-0 -mx-4 flex justify-end border-t border-app-border! bg-app-bg py-3 pl-4 pr-24 sm:-mx-6 sm:pl-6 sm:pr-24">
        <Button
          size="lg"
          icon={Save}
          loading={saving || media.publishing}
          onClick={handleSave}
        >
          {savedId
            ? "Save changes"
            : "Publish knowledge base"}
          {media.count > 0 && ` (+${media.count} image${media.count === 1 ? "" : "s"})`}
        </Button>
      </div>
    </PageShell>
  );
};

export default EditableKnowledgeBase;
