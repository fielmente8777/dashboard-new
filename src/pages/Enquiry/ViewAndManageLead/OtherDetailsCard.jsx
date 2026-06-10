const formatLabel = (key) => {
  return key
    .replace(/\?/g, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const OtherDetailsCard = ({ otherDetails }) => {
  if (!otherDetails || Object.keys(otherDetails).length === 0) {
    return (
      <div className="bg-app-surface-secondary rounded-md p-4 text-gray-400 text-sm">
        No additional details available
      </div>
    );
  }

  return (
    <div className="bg-app-surface-secondary rounded-md md:border md:shadow-xs border-primary/10 p-4">
      <h3 className="text-sm font-semibold text-app-text mb-3">
        Other Details
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(otherDetails).map(([key, value]) => (
          <div key={key}>
            <p className="text-sm text-app-text  mb-0.5">{formatLabel(key)}</p>
            <p className="text-sm font-medium text-app-text-faint break-words">
              {String(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OtherDetailsCard;
