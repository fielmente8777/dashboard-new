import { AlertCircle, Loader2 } from "lucide-react";
import Icon from "../../../../components/ui/Icon";

// Shown over a Google map while the script loads, or if it fails.
const MapStatus = ({ loadError }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-app-surface-secondary px-4 text-center text-xs text-app-text-muted">
    {loadError ? (
      <>
        <Icon icon={AlertCircle} size="md" className="text-red-500" />
        <span className="font-medium text-app-text">Google Maps could not load</span>
        <span>Check the Google Maps key (VITE_GOOGLE_MAPS_API_KEY).</span>
      </>
    ) : (
      <span className="flex items-center gap-2">
        <Icon icon={Loader2} size="sm" className="animate-spin" /> Loading map…
      </span>
    )}
  </div>
);

export default MapStatus;
