const FeatureTable = ({ features }) => {
  return (
    <div className="mt-20 text-gray-800 bg-white rounded-2xl p-8 shadow-md">
      
      <div className="grid grid-cols-4 gap-4 border-b border-gray-200 pb-4 font-semibold">
        <span>Features</span>
        <span>Starter</span>
        <span>Growth</span>
        <span>Elite</span>
      </div>

      {features.map((feature, index) => (
        <div
          key={index}
          className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100"
        >
          <span className="text-gray-600">{feature.name}</span>

          <span>{feature.Starter ? "✔️" : "-"}</span>
          <span>{feature.Growth ? "✔️" : "-"}</span>
          <span>{feature.Elite ? "✔️" : "-"}</span>
        </div>
      ))}
    </div>
  );
};

export default FeatureTable;