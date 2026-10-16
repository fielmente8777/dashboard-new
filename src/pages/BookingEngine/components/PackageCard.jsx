import Badge from "../../../components/ui/Badge";
import MediaCard from "../../../components/ui/MediaCard";

// `status`: { label, tone } shown as a badge under the title (optional).
const PackageCard = ({
  title,
  images,
  description,
  price,
  start,
  end,
  status,
  onDelete,
}) => (
  <MediaCard images={images || []} title={title} onDelete={onDelete}>
    {status && (
      <div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>
    )}
    {description && <p className="line-clamp-3">{description}</p>}
    {(start || end) && (
      <p className="text-xs">
        {start} → {end}
      </p>
    )}
    <p className="mt-auto pt-2 text-base font-semibold text-app-text">
      ₹{Number(price || 0).toLocaleString("en-IN")}
    </p>
  </MediaCard>
);

export default PackageCard;
