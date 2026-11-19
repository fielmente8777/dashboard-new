import { useKbPlacement } from "../../KnowledgeBase/hooks/useKbMediaPlacement";
import { useGetAssetLocationQuery } from "../../../redux/api/mediaApi";

const Row = ({ label, children }) => (
  <div className="grid grid-cols-[120px_1fr] gap-2 py-1.5">
    <dt className="text-app-text-muted">{label}</dt>
    <dd className="min-w-0 break-all text-app-text">{children}</dd>
  </div>
);

// Where this image is: its place in the Knowledge Base document, its
// collection in the Media library and the stored file.
const AssetLocation = ({ asset }) => {
  const { data: loc } = useGetAssetLocationQuery(asset.id);
  const kb = useKbPlacement();
  const kbPath = kb?.pathOf(asset);

  return (
    <section className="text-xs">
      <h4 className="mb-1 text-xs font-semibold text-app-text">Saved in</h4>
      <dl className="divide-y divide-app-border rounded-lg border border-app-border! px-3">
        <Row label="Knowledge Base">
          {kbPath ? kbPath.join(" › ") : asset.draft ? "Not saved yet: click Save changes" : "Not shown in a section (no item matches its title)"}
        </Row>
        <Row label="Media library">{loc?.collectionPath?.length ? loc.collectionPath.join(" › ") : "Needs review"}</Row>
        {loc?.storage && (
          <Row label="File">
            {loc.storage.backend === "s3" ? `s3://${loc.storage.bucket}/` : ""}
            {loc.storage.original}
          </Row>
        )}
      </dl>
    </section>
  );
};

export default AssetLocation;
