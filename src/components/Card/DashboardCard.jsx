import { VscGraphLine } from "react-icons/vsc";

const DashboardCard = ({ amount = 0, label = "Label", progress = 0 }) => {
  const getColor = (progress) => {
    if (progress <= 25) {
      return "bg-red-600/50";
    } else if (progress > 25 && progress <= 50) {
      return "bg-violet-600/50";
    } else if (progress > 50 && progress <= 75) {
      return "bg-yellow-600/50";
    } else {
      return "bg-green-600/50";
    }
  };

  return (
    <div className=" h-[100px] md:h-auto p-4 rounded md:rounded-lg md:cardShadow overflow-hidden bg-white flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-2xl font-bold text-primary/90">{amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</p>
          {/* <p className="text-2xl md:text-4xl font-bold text-primary/90">{amount}</p> */}
          <p className="text-sm md:text-lg font-medium text-gray-500  mt-0 md:mt-5">{label}</p>
        </div>
        <div className="md:p-2 block md:hidden font-bold rounded-md">
          <VscGraphLine  color="green" />
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className={`h-2 ${getColor(progress)} rounded-full`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="ml-2 text-sm text-gray-600">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
