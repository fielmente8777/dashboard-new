import React from "react";

const TrashBin = () => {
  return (
    <div className="w-[20px] flex flex-col items-center justify-center group">
      <div className="w-full group-hover:rotate-6 group-hover:-translate-y-px transition-all easy-in-out duration-300 mb-px bg-gray-900 h-[3px] rounded-xl relative after:absolute after:left-1/2 after:-translate-x-1/2 after:w-[8px] after:h-px after:rounded-t-md after:bottom-full after:bg-gray-900"></div>
      <div className="w-[95%] h-[18px] border-2 !border-gray-900 flex items-center justify-center gap-px rounded-sm">
        <div className="w-1 h-[80%] bg-gray-900"></div>
        <div className="w-1 h-[80%] bg-gray-900"></div>
        <div className="w-1 h-[80%] bg-gray-900"></div>
      </div>
    </div>
  );
};

export default TrashBin;
