
import { ArrowLeft, RefreshCw, Save } from "lucide-react";
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
import KnowledgeBaseSection from "./KnowledgeBaseSection";
import TabBar from "./TabBar";
import MediaTab from "./MediaTab";

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

  // Media is a permanent tab, not a dynamic KB section.
  const [selectedTab, setSelectedTab] = useState(null);

  const isMediaSelected = selectedTab === "__media__";

  // Update knowledge base fields.
  const handleChange = useCallback(
    (path, value) =>
      setKb((prev) => setValueAtPath(prev, path, value)),
    [setKb],
  );

  // Update media assets inside the same KB document.
  const handleMediaChange = useCallback(
    (mediaAssets) => {
      setKb((prev) => ({
        ...prev,
        media_assets: mediaAssets,
      }));
    },
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

  const mediaAssets = Array.isArray(kb?.media_assets)
    ? kb.media_assets
    : [];

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
        savedId ? (
          <Button
            variant="secondary"
            icon={ArrowLeft}
            onClick={onBack}
          >
            Back to list
          </Button>
        ) : (
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={onStartOver}
          >
            Start over
          </Button>
        )
      }
    >
      {/* TAB NAVIGATION */}

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
  <MediaTab
    mediaAssets={mediaAssets}
    onChange={handleMediaChange}
  />
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

      <div className="sticky bottom-0 -mx-4 flex justify-end border-t border-app-border! bg-app-bg px-4 py-3 sm:-mx-6 sm:px-6">
        <Button
          size="lg"
          icon={Save}
          loading={saving}
          onClick={onSave}
        >
          {savedId
            ? "Save changes"
            : "Publish knowledge base"}
        </Button>
      </div>
    </PageShell>
  );
};

export default EditableKnowledgeBase;
