const InfoRow = ({ label, value, icon }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-app-border last:border-0">
    <div>
      <p className="text-sm font-medium text-gray-700 dark:text-app-text">
        {label}
      </p>
      <p className="text-sm text-gray-600 dark:text-app-text-faint">{value}</p>
    </div>

    <div className="text-primary dark:text-white">{icon}</div>
  </div>
);

export default InfoRow;
