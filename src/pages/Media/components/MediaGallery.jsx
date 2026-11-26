import { AlertTriangle, BookOpen, FolderInput, Images, RefreshCw, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { Input, Select } from "../../../components/ui/Field";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { useConfirm } from "../../../context/ConfirmContext";
import { useToast } from "../../../context/ToastContext";
import useDebounce from "../../../hooks/useDebounce";
import { useTenant } from "../../../hooks/useTenant";
import {
  useBulkMediaAssetsMutation,
  useGetMediaAssetsQuery,
  useGetMediaCollectionsQuery,
} from "../../../redux/api/mediaApi";
import AssetDrawer from "./AssetDrawer";
import { MediaThumbnail } from "./MediaPreview";
import { MEDIA_KIND_LABELS, mediaDetails } from "./mediaFormat";
import { ASSET_STATUS, collectionChoices, SOURCE_OPTIONS } from "./mediaUi";

const PAGE_SIZE = 40;

const SideItem = ({ active, onClick, label, count, depth = 0, tone }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition ${depth ? "pl-7 text-xs" : ""} ${
      active ? "bg-primary/10 font-medium text-primary dark:text-blue-300" : "text-app-text-muted hover:bg-app-surface-secondary hover:text-app-text"
    }`}
  >
    <span className={`truncate ${tone || ""}`}>{label}</span>
    <span className="text-xs">{count}</span>
  </button>
);



// Gallery grouped by collection, with filters, search and bulk actions.
const MediaGallery = ({ compact = false, draftId }) => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [scope, setScope] = useState({ collection: "", sub: "" });
  const [search, setSearch] = useState("");
  const [semantic, setSemantic] = useState(false);
  const [filters, setFilters] = useState({ source: "", status: "", tag: "", from: "", to: "", mediaKind: "" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());
  const [openId, setOpenId] = useState(null);
  const [moveTo, setMoveTo] = useState("");
  const q = useDebounce(search.trim(), 400);

  const { data: tree, refetch: refetchTree } = useGetMediaCollectionsQuery(draftId);
  const collections = tree?.collections || [];

  const { hid } = useTenant();
  const params = { ...scope, ...filters, hid, draft: draftId, q, semantic: q && semantic ? "1" : "", page, limit: PAGE_SIZE };
  // polls while any image on screen is being (re-)analyzed
  const [busy, setBusy] = useState(false);
  const { data, isFetching, isLoading, error, refetch } = useGetMediaAssetsQuery(params, { pollingInterval: busy ? 3000 : 0 });
  const assets = useMemo(() => data?.assets || [], [data]);
  useEffect(() => {
    setBusy(assets.some((a) => a.statusReason === "Re-analyzing…" || a.statusReason === "Waiting for analysis…"));
  }, [assets]);

  const openAsset = assets.find((a) => a.id === openId) || null;
  const [bulk, { isLoading: bulkBusy }] = useBulkMediaAssetsMutation();

  const choose = (next) => {
    setScope(next);
    setPage(1);
    setSelected(new Set());
  };
  const setFilter = (key) => (e) => {
    setFilters((f) => ({ ...f, [key]: e.target.value }));
    setPage(1);
  };
  const toggle = (id) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const runBulk = async (action) => {
    const assetIds = [...selected];
    if (!assetIds.length) return;
    if (action === "delete") {
      const ok = await confirm(`Delete ${assetIds.length} file${assetIds.length === 1 ? "" : "s"} from the library and the Knowledge Base?`, { title: "Delete files", confirmText: "Delete" });
      if (!ok) return;
    }
    let body = { action, assetIds };
    if (action === "move") {
      if (!moveTo) {
        showToast({ message: "Choose where to move the files.", type: "warning" });
        return;
      }
      body = { ...body, collectionId: moveTo };
    }
    try {
      const res = await bulk(body).unwrap();
      setSelected(new Set());
      setMoveTo("");
      showToast({ message: `${res.affected} file${res.affected === 1 ? "" : "s"} ${action === "move" ? "moved" : action === "delete" ? "deleted" : "sent for re-analysis"}.`, type: "success" });
    } catch (err) {
      showToast({ message: err?.data?.error || "The action failed.", type: "error" });
    }
  };

  return (
    <div className={`grid gap-4 ${compact ? "" : "lg:grid-cols-[220px_1fr]"}`}>
      {/* collections */}
      <nav aria-label="Collections" className={`space-y-0.5 ${compact ? "flex flex-wrap gap-1 space-y-0" : ""}`}>
        <SideItem active={!scope.collection} onClick={() => choose({ collection: "", sub: "" })} label="All media" count={tree?.total ?? "–"} />
        <SideItem active={scope.collection === "needs_review"} onClick={() => choose({ collection: "needs_review", sub: "" })} label="Needs review" count={tree?.needsReview ?? 0} tone={tree?.needsReview ? "text-amber-600 dark:text-amber-400" : ""} />
        {collections.map((c) => (
          <div key={c.id}>
            <SideItem active={scope.collection === c.id && !scope.sub} onClick={() => choose({ collection: c.id, sub: "" })} label={c.name} count={c.count} />
            {!compact &&
              c.children.map((s) => (
                <SideItem key={s.id} depth={1} active={scope.sub === s.id} onClick={() => choose({ collection: c.id, sub: s.id })} label={s.name} count={s.count} />
              ))}
          </div>
        ))}
      </nav>

      <div className="min-w-0 space-y-3">
        {/* search + filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-50 flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-app-text-faint" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={semantic ? "Describe what you are looking for…" : "Search titles, tags and extracted text…"}
              className="pl-9"
              aria-label="Search media"
            />
          </div>
          <label className="flex items-center gap-1.5 text-xs text-app-text-muted">
            <input type="checkbox" checked={semantic} onChange={(e) => setSemantic(e.target.checked)} /> By meaning
          </label>
          <Select value={filters.mediaKind} onChange={setFilter("mediaKind")} options={[{ value: "", label: "All types" }, ...Object.entries(MEDIA_KIND_LABELS).map(([value, label]) => ({ value, label: value === "other" ? label : label + "s" }))]} aria-label="Media type" className="w-36" />
          {!compact && (
            <>
              <Select value={filters.source} onChange={setFilter("source")} options={SOURCE_OPTIONS} aria-label="Source" className="w-36" />
              <Select
                value={filters.status}
                onChange={setFilter("status")}
                options={[{ value: "", label: "Any status" }, ...Object.entries(ASSET_STATUS).map(([value, s]) => ({ value, label: s.label }))]}
                aria-label="Status"
                className="w-36"
              />
              <Input value={filters.tag} onChange={setFilter("tag")} placeholder="Tag" className="w-28" aria-label="Tag" />
              <Input type="date" value={filters.from} onChange={setFilter("from")} className="w-36" aria-label="Imported from" />
              <Input type="date" value={filters.to} onChange={setFilter("to")} className="w-36" aria-label="Imported until" />
            </>
          )}
          <Button variant="ghost" size="sm" icon={RefreshCw} loading={isFetching} onClick={() => (refetch(), refetchTree())} aria-label="Refresh" />
        </div>

        {/* bulk actions */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-500/30! bg-blue-500/5 p-2 text-sm">
            <span className="px-1 font-medium text-app-text">{selected.size} selected</span>
            <Select value={moveTo} onChange={(e) => setMoveTo(e.target.value)} options={[{ value: "", label: "Move to…" }, ...collectionChoices(collections)]} aria-label="Move to collection" className="w-48" />
            <Button size="sm" variant="secondary" icon={FolderInput} loading={bulkBusy} onClick={() => runBulk("move")}>
              Move
            </Button>
            <Button size="sm" variant="secondary" icon={RefreshCw} loading={bulkBusy} onClick={() => runBulk("reanalyze")}>
              Re-analyze
            </Button>
            <Button size="sm" variant="danger" icon={Trash2} loading={bulkBusy} onClick={() => runBulk("delete")}>
              Delete
            </Button>
            <button type="button" className="ml-auto text-xs text-app-text-muted hover:text-app-text" onClick={() => setSelected(new Set())}>
              Clear
            </button>
          </div>
        )}

        {/* grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="aspect-4/3" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error?.data?.error || "Media could not be loaded."} onRetry={refetch} />
        ) : !assets.length ? (
          <EmptyState icon={Images} title={q ? "No matching files" : "No files here yet"} description={q ? "Try other words, or search by meaning." : "Import a link to fill your library."} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {assets.map((asset) => {
              const status = ASSET_STATUS[asset.status];
              const checked = selected.has(asset.id);
              return (
                <article
                  key={asset.id}
                  className={`group relative overflow-hidden rounded-xl border bg-app-surface transition ${checked ? "border-blue-500! ring-1 ring-blue-500" : "border-app-border!"}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(asset.id)}
                    aria-label={`Select ${asset.title}`}
                    className={`absolute left-2 top-2 z-10 size-4 ${checked ? "" : "opacity-0 group-hover:opacity-100 focus:opacity-100"}`}
                  />
                  <button type="button" onClick={() => setOpenId(asset.id)} className="block w-full text-left">
                    <div className="aspect-4/3 bg-app-surface-secondary">
                      <MediaThumbnail asset={asset} className="h-full w-full" />
                    </div>
                    <div className="space-y-1 p-2">
                      <p className="truncate text-sm font-medium text-app-text" title={asset.title}>
                        {asset.title}
                      </p>
                      <p className="truncate text-xs text-app-text-muted" title={asset.sourceName}>{asset.sourceName} · {mediaDetails(asset)}</p>
                      <div className="flex items-center gap-1.5">
                        {status && <Badge tone={status?.tone}>{asset.statusReason === "Re-analyzing…" ? "Analyzing…" : status?.label}</Badge>}
                        <span className="truncate text-xs text-app-text-muted">
                          {[asset.category, asset.subCategory].filter(Boolean).join(" › ") || "Unsorted"}
                          {asset.roomInfo?.identifier ? ` · ${asset.roomInfo.identifier}` : ""}
                        </span>
                      </div>
                    </div>
                  </button>
                  {asset.draft && (
                    <span title="Not saved yet: click Save changes" className="absolute right-2 top-2 rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800">
                      Unsaved
                    </span>
                  )}
                  {asset.inKnowledgeBase && (
                    <span title="In Knowledge Base" className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
                      <BookOpen size={12} aria-hidden="true" /> KB
                    </span>
                  )}
                  {asset.status === "failed" && <AlertTriangle size={14} className="absolute right-2 top-2 text-red-500" aria-label="Analysis failed" />}
                </article>
              );
            })}
          </div>
        )}

        {data?.pages > 1 && (
          <div className="flex items-center justify-center gap-2 text-sm">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-app-text-muted">
              Page {page} of {data.pages}
            </span>
            <Button variant="secondary" size="sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>

      {openAsset && <AssetDrawer asset={openAsset} collections={collections} onClose={() => setOpenId(null)} />}
    </div>
  );
};

export default MediaGallery;
