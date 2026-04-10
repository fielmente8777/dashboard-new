import { IoCheckmarkSharp } from "react-icons/io5";
const FeatureTable = ({ features }) => {
  return (
    <div className="mt-20 text-primary bg-white rounded-2xl">
      
      <div className="grid grid-cols-4 gap-4 border-b border-gray-200 pb-4 font-semibold">
        <span>Features</span>
        <span className="flex justify-center">Starter</span>
        <span className="flex justify-center">Growth</span>
        <span className="flex justify-center">Elite</span>
      </div>

      {features.map((feature, index) => (
        <div
          key={index}
          className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100"
        >
          <span className="text-primary">{feature.name}</span>

          <span className="flex justify-center">{feature.Starter ?  <IoCheckmarkSharp className="text-ternary" />: "-"}</span>
          <span className="flex justify-center">{feature.Growth ?<IoCheckmarkSharp className="text-ternary"/>  : "-"}</span>
          <span className="flex justify-center">{feature.Elite ? <IoCheckmarkSharp className="text-ternary"/> : "-"}</span>
        </div>
      ))}
    </div>
  );
};

export default FeatureTable;