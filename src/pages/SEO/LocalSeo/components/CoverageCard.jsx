import { AlertCircle, CheckCircle2, Clock, Crosshair, Loader2, RefreshCw } from "lucide-react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import Icon from "../../../../components/ui/Icon";
import Segmented from "../../../../components/ui/Segmented";
import SelectMenu from "../../../../components/ui/SelectMenu";
import { EmptyState, Skeleton } from "../../../../components/ui/States";
import { RADIUS_OPTIONS, RANK_BANDS, UNRANKED, formatDate } from "../localSeoUtils";
import GeoGridMap from "./GeoGridMap";

const RADIUS_CHOICES = RADIUS_OPTIONS.map((r) => ({ value: r, label: `${r} km` }));

const StatusBadge = ({ status, isScanning }) => {
  if (isScanning) {
    return (
      <Badge tone="amber" className="gap-1">
        <Icon icon={Loader2} size="xs" className="animate-spin" /> Scanning
      </Badge>
    );
  }
  if (status === "failed") {
    return (
      <Badge tone="red" className="gap-1">
        <Icon icon={AlertCircle} size="xs" /> Last scan failed
      </Badge>
    );
  }
  if (status === "done") {
    return (
      <Badge tone="green" className="gap-1">
        <Icon icon={CheckCircle2} size="xs" /> Up to date
      </Badge>
    );
  }
  return null;
};

const ScanningOverlay = ({ gridSize }) => (
  <div className="anim-fade absolute inset-0 z-[1000] flex flex-col items-center justify-center gap-3 bg-app-surface/80 text-center backdrop-blur-sm">
    <span className="relative flex size-14 items-center justify-center">
      <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
      <span className="relative flex size-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
        <Icon icon={Crosshair} size="2xl" />
      </span>
    </span>
    <div>
      <p className="text-sm font-semibold text-app-text">Scanning your area</p>
      <p className="mt-1 max-w-xs text-xs text-app-text-muted">
        Checking your rank at all {gridSize * gridSize} points. This takes a
        few minutes; you can leave this page.
      </p>
    </div>
  </div>
);

const Legend = () => (
  <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-app-text-muted">
    {[...RANK_BANDS, UNRANKED].map((band) => (
      <li key={band.label} className="flex items-center gap-1.5">
        <span className="size-2.5 rounded-full" style={{ backgroundColor: band.color }} />
        {band.label}
      </li>
    ))}
  </ul>
);

// Map of the geo-grid with its settings (radius, keyword) and the scan button.
const CoverageCard = ({
  data,
  keywords,
  scan,
  scanCost,
  busy,
  onRadiusChange,
  onKeywordChange,
}) => {
  const { localConfig, gridMeta, geoGrid } = data;
  const gridSize = gridMeta?.gridSize || 5;
  const hasPoints = geoGrid.length > 0 && geoGrid[0]?.lat != null;
  const hasLocation = Boolean(localConfig?.lat && localConfig?.lng);
  const place = [localConfig?.district, localConfig?.city].filter(Boolean).join(", ");

  const keywordOptions = keywords.map((k) => ({ value: k.keyword, label: k.keyword }));

  return (
    <Card
      className="flex flex-col"
      title="Map coverage"
      description={`Your Maps rank across a ${gridSize}×${gridSize} grid around ${place || "your property"}`}
      actions={
        <div className="flex items-center gap-2">
          <StatusBadge status={scan.status} isScanning={scan.isScanning} />
          <Button
            size="sm"
            variant="secondary"
            icon={RefreshCw}
            loading={scan.starting}
            disabled={scan.isScanning}
            onClick={scan.start}
            title={`Uses ${scanCost} credits`}
          >
            {hasPoints ? "Re-scan" : "Scan now"}
            <span className="text-app-text-faint">· {scanCost} cr</span>
          </Button>
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-app-text-muted">Radius</span>
          <Segmented
            label="Scan radius"
            options={RADIUS_CHOICES}
            value={localConfig?.radiusKm}
            onChange={onRadiusChange}
            disabled={busy.savingRadius || scan.isScanning}
          />
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-xs text-app-text-muted">Keyword</span>
          <SelectMenu
            label="Map keyword"
            options={keywordOptions}
            value={gridMeta?.keyword || null}
            onChange={onKeywordChange}
            placeholder="Choose a keyword"
            disabled={busy.savingGridKeyword || scan.isScanning || !keywords.length}
            className="h-8 w-64 max-w-full"
          />
        </div>
      </div>

      <div className="local-seo-map relative min-h-[420px] flex-1 overflow-hidden rounded-lg border border-app-border! bg-app-surface-secondary">
        {!hasLocation ? (
          <Skeleton className="absolute inset-0 rounded-none" />
        ) : hasPoints ? (
          <div className="absolute inset-0">
            <GeoGridMap
              points={geoGrid}
              center={[localConfig.lat, localConfig.lng]}
              gridSize={gridSize}
              businessName={localConfig.businessName}
              place={place}
            />
          </div>
        ) : (
          !scan.isScanning && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <EmptyState
                icon={Crosshair}
                title="Your area hasn't been scanned yet"
                description="A scan checks where you rank on Google Maps at each point around your property."
                action={
                  <Button icon={RefreshCw} loading={scan.starting} onClick={scan.start}>
                    Run first scan ({scanCost} credits)
                  </Button>
                }
              />
            </div>
          )
        )}
        {scan.isScanning && <ScanningOverlay gridSize={gridSize} />}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <Legend />
        {gridMeta?.lastScanned && (
          <span className="flex items-center gap-1 text-xs text-app-text-muted">
            <Icon icon={Clock} size="xs" />
            Scanned {formatDate(gridMeta.lastScanned, { day: "numeric", month: "short", year: "numeric" })}
          </span>
        )}
      </div>
    </Card>
  );
};

export default CoverageCard;
