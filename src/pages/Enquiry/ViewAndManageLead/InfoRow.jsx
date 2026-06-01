const InfoRow = ({ label, value, icon }) => (
  <div className="bg-app-surfaceflex justify-between items-center py-2 border-b border-gray-200 dark:border-app-border last:border-0">
    <div>
      <p className="text-sm font-medium text-gray-700 dark:text-app-text">
        {label}
      </p>
      <p className="text-sm text-gray-600 dark:text-app-text-muted">
        {value}
      </p>
    </div>

    <div className="text-primary dark:text-primary">
      {icon}
    </div>
  </div>
);

export default InfoRow;