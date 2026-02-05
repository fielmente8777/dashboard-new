import React from "react";

const TrashBin = () => {
  return (
    <div className="w-[14px] flex flex-col items-center justify-center group">
      <div className="w-full group-hover:rotate-6 group-hover:-translate-y-px transition-transform easy-in-out duration-300 mb-px bg-red-900 h-[3px] rounded-xl relative after:absolute after:left-1/2 after:-translate-x-1/2 after:w-[8px] after:h-px after:rounded-t-md after:bottom-full after:bg-red-900"></div>
      <div className="w-[95%] h-[18px] border-2 !border-red-900 flex items-center justify-center gap-px rounded-b-[2px]">
        {/* <div className="w-1 h-[80%] bg-red-900"></div>
        <div className="w-1 h-[80%] bg-red-900"></div>
        <div className="w-1 h-[80%] bg-red-900"></div> */}
      </div>
    </div>
  );
};

export default TrashBin;
