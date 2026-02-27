const InfoRow = ({ label, value, icon }) => (
  <div className="flex justify-between items-center py-2 border-b last:border-0">
    <div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-sm text-gray-600">{value}</p>
    </div>
    <div className="text-primary">{icon}</div>
  </div>
);

export default InfoRow;
