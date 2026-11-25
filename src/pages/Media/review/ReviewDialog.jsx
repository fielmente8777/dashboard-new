import { X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import Button from "../../../components/ui/Button";
import IconButton from "../../../components/ui/IconButton";
import { useConfirm } from "../../../context/ConfirmContext";
import { useToast } from "../../../context/ToastContext";
import { useGetMediaCollectionsQuery } from "../../../redux/api/mediaApi";
import AiBriefForm from "./AiBriefForm";
import AiResults from "./AiResults";
import EditPanel from "./EditPanel";
import ReviewFooter from "./ReviewFooter";
import ReviewProgress from "./ReviewProgress";
import SelectGrid from "./SelectGrid";
import useReviewSession from "./useReviewSession";

const errorOf = (e, fallback) => e?.data?.error || e?.message || fallback;

// Full-screen review of an import: scenario 1 (select + edit) or scenario 2 (AI scan + verify).
const ReviewDialog = ({ jobIds, mode, draftId, onClose }) => {
  const session = useReviewSession(jobIds, draftId);
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { data: tree } = useGetMediaCollectionsQuery();
  const [view, setView] = useState(mode); // "manual" | "ai"
  const [activeId, setActiveId] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [imported, setImported] = useState(null); // images this review sent for import (null = nothing to review)
  const { assets, selected, edits, phase, scanned } = session;

  const active = assets.find((a) => a.id === activeId) || null;
  const scanCredits = assets.reduce((sum, asset) => sum + (asset.analysisCredits ?? session.creditsPerImage), 0);
  const credits = Math.ceil(assets.filter((asset) => selected.has(asset.id)).reduce((sum, asset) => {
    const edit = edits[asset.id];
    const analyze = asset.needsAnalysis ?? !scanned;
    return sum + (analyze || edit?.rotate || edit?.crop ? (asset.analysisCredits ?? session.creditsPerImage) : 0)
      + (draftId ? 0 : (asset.indexingCredits ?? 0));
  }, 0));

  const runScan = async (brief) => {
    setScanning(true);
    try {
      await session.scan(brief);
    } catch (e) {
      showToast({ message: errorOf(e, "The AI scan could not start."), type: "error" });
    } finally {
      setScanning(false);
    }
  };

  const submit = async (discard = false) => {
    if (discard && !(await confirm("Discard all files from this import? Nothing will be added.", { title: "Discard import", confirmText: "Discard" }))) return;
    try {
      // discarding: confirm with nothing included (deletes the previews)
      await (discard ? session.confirmNone() : session.confirm());
      setImported(discard ? 0 : selected.size);
    } catch (e) {
      showToast({ message: errorOf(e, "The import could not be started."), type: "error" });
    }
  };

  const openForEdit = (id) => {
    setActiveId(id);
    setView("manual");
  };

  const title =
    phase === "busy" ? "Preparing your files" : phase === "finished" ? "Import finished" : view === "ai" && !scanned ? "Let AI choose the files" : view === "ai" ? `AI found ${assets.filter((a) => a.scan?.verdict === "include").length} matching files` : `${assets.length} files found`;

  return createPortal(
    <div className="anim-fade fixed inset-0 z-[9990] flex flex-col bg-app-bg text-app-text" role="dialog" aria-modal="true" aria-label={title}>
      <header className="flex items-center gap-3 border-b border-app-border! bg-app-surface px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="truncate text-xs text-app-text-muted">Pick what goes into your Knowledge Base. Previews you don't import are deleted.</p>
        </div>
        {phase === "review" && (
          <Button variant="ghost" size="sm" onClick={() => setView(view === "ai" ? "manual" : "ai")}>
            {view === "ai" ? "Choose manually" : "Let AI choose"}
          </Button>
        )}
        <IconButton icon={X} label="Close (you can continue from Imports)" onClick={() => onClose(phase)} />
      </header>

      <div className="flex min-h-0 flex-1">
        {phase === "busy" && <div className="flex-1 overflow-y-auto"><ReviewProgress jobs={session.jobs} /></div>}
        {phase === "finished" && (
          <div className="flex-1 overflow-y-auto">
            <ReviewProgress jobs={session.jobs} />
            <p className="mb-4 text-center text-sm text-app-text">
              {imported === null
                ? "Nothing new at these links: every image is already in your library."
                : imported === 0
                  ? "Nothing was imported."
                  : `${imported} file${imported === 1 ? " was" : "s were"} imported. Click Save changes to add ${imported === 1 ? "it" : "them"} to your Knowledge Base.`}
            </p>
            <div className="flex justify-center"><Button onClick={() => onClose("finished")}>View in Library</Button></div>
          </div>
        )}
        {phase === "review" && view === "ai" && !scanned && (
          <AiBriefForm fileCount={assets.length} credits={Math.ceil(scanCredits)} busy={scanning} onSubmit={runScan} onManual={() => setView("manual")} />
        )}
        {phase === "review" && view === "ai" && scanned && <AiResults session={session} onOpen={openForEdit} />}
        {phase === "review" && view === "manual" && (
          <>
            <SelectGrid session={session} activeId={activeId} onOpen={setActiveId} />
            <EditPanel
              asset={active}
              edit={edits[activeId]}
              collections={tree?.collections || []}
              selectedCount={selected.size}
              onChange={(patch) => session.setEdit(activeId, patch)}
              onApplyToSelected={(patch) => [...selected].forEach((id) => session.setEdit(id, patch))}
            />
          </>
        )}
      </div>

      {phase === "review" && !(view === "ai" && !scanned) && (
        <ReviewFooter
          selectedCount={selected.size}
          total={assets.length}
          credits={credits}
          confirming={session.confirming}
          onDiscard={() => submit(true)}
          onConfirm={() => submit(false)}
          confirmLabel={view === "ai" && scanned ? `Verify & import ${selected.size} files` : undefined}
        />
      )}
    </div>,
    document.body,
  );
};

export default ReviewDialog;
