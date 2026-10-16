// One labelled value. Put several inside a <dl> (usually a grid).
const Detail = ({ label, children }) => (
  <div className="min-w-0">
    <dt className="text-xs text-app-text-muted">{label}</dt>
    <dd className="mt-0.5 break-words text-sm font-medium text-app-text">
      {children || "—"}
    </dd>
  </div>
);

export default Detail;
