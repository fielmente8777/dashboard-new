const ProgressBar = ({ value = 0, colorClass = "bg-green-500" }) => (
  <div className="h-2 w-full rounded-full bg-app-surface-secondary overflow-hidden">
    <div
      className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
      style={{ width: `${value}%` }}
    />
  </div>
);

export default ProgressBar;
