import Button from "../../../components/ui/Button";

// Bottom bar of the review screens: what will be imported and what it costs.
const ReviewFooter = ({ selectedCount, total, credits, confirming, onDiscard, onConfirm, confirmLabel }) => (
  // pr-24: keeps the buttons clear of the floating AI assistant button (fixed bottom-6 right-6)
  <footer className="flex flex-wrap items-center gap-3 border-t border-app-border! bg-app-surface py-3 pl-4 pr-24 sm:pl-6 sm:pr-24">
    <span className="text-sm font-semibold text-app-text">
      {selectedCount} of {total} selected
    </span>
    <span className="text-xs text-app-text-muted">
      {total - selectedCount} left out{credits > 0 ? ` · about ${credits} AI credits` : ""}
    </span>
    <div className="ml-auto flex gap-2">
      <Button variant="ghost" disabled={confirming} onClick={onDiscard}>
        Discard all
      </Button>
      <Button loading={confirming} disabled={!selectedCount} onClick={onConfirm}>
        {confirmLabel || `Import ${selectedCount} image${selectedCount === 1 ? "" : "s"}`}
      </Button>
    </div>
  </footer>
);

export default ReviewFooter;
