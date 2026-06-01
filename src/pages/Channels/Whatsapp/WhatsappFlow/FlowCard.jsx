const FlowCard = ({ data, onClick }) => {
  return (
    <div
      onClick={() => onClick(data)}
      className="flex items-center gap-4 p-4 border border-gray-900! rounded-lg cursor-pointer hover:bg-primary/70! transition"
    >
      <div className="w-10 h-10 bg-green-500 text-white flex items-center justify-center rounded-md font-bold">
        {data.icon}
      </div>

      <div>
        <p className="font-medium">{data.title}</p>
        <p className="text-sm text-gray-800 dark:text-app-text-faint">{data.desc}</p>
      </div>
    </div>
  );
};

export default FlowCard;
