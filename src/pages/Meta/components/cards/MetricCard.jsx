import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const indexColorValue = {
  0: "blue",
  1: "purple",
  2: "green",
  3: "orange",
  4: "pink",
};

const colors = {
  blue: {
    border: "bg-blue-500",
    glow: "from-blue-500/30",
  },
  purple: {
    border: "bg-purple-500",
    glow: "from-purple-500/30",
  },
  green: {
    border: "bg-emerald-500",
    glow: "from-emerald-500/30",
  },
  orange: {
    border: "bg-amber-500",
    glow: "from-amber-500/30",
  },
  pink: {
    border: "bg-pink-500",
    glow: "from-pink-500/30",
  },
};

const MetricCard = ({ title, value, growth, trend, index }) => {
  const isUp = trend === "up";
  const isDown = trend === "down";

  const selected = colors[indexColorValue[index]] || colors.blue;

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:bg-black/40 bg-white px-5 py-2 shadow-sm">
      {/* <div className="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent pointer-events-none" /> */}
      {/* Left Accent */}
      <div className={`absolute left-0 top-0 h-full w-1 ${selected.border}`} />

      {/* Top Right Glow */}
      <div
        className={`absolute -right-8 -top-2 size-20 rounded-full bg-linear-to-tr ${selected.glow} blur-xl`}
      />

      <div className="relative z-10">
        <p className="text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wide">
          {title}
        </p>

        <h3 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
          {Number(value || 0).toLocaleString()}
        </h3>

        <div
          className={`mt-3 flex items-center gap-1 text-sm font-medium ${
            isUp ? "text-green-600" : isDown ? "text-red-600" : "text-gray-500"
          }`}
        >
          {isUp && <TrendingUp size={16} />}
          {isDown && <TrendingDown size={16} />}
          {!isUp && !isDown && <Minus size={16} />}
          {Math.abs(growth || 0)}%
        </div>
      </div>
    </div>
  );
};

export default MetricCard;

// import React from "react";
// import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// const MetricCard = ({ title, value, growth, trend }) => {
//   const isUp = trend === "up";
//   const isDown = trend === "down";

//   return (
//     <div className="bg-white border rounded-xl p-5 shadow-sm">
//       <p className="text-sm text-gray-500">{title}</p>

//       <h3 className="mt-2 text-3xl font-bold text-gray-900">
//         {Number(value || 0).toLocaleString()}
//       </h3>

//       <div
//         className={`mt-3 flex items-center gap-1 text-sm font-medium ${
//           isUp ? "text-green-600" : isDown ? "text-red-600" : "text-gray-500"
//         }`}
//       >
//         {isUp && <TrendingUp size={16} />}
//         {isDown && <TrendingDown size={16} />}
//         {!isUp && !isDown && <Minus size={16} />}
//         {Math.abs(growth || 0)}%
//       </div>
//     </div>
//   );
// };

// export default MetricCard;
