import React from 'react';

const MiniLineChartCard = ({ title, value, changePercent, isPositive, currentData, lastWeekData }) => {
    const max = Math.max(...currentData, ...lastWeekData);
    const min = Math.min(...currentData, ...lastWeekData);
    const scale = 60; // max height in px

    const getY = (val) => scale - ((val - min) / (max - min)) * scale;

    return (
        <div className="bg-white rounded-xl cardShadow p-4 w-full h-full">
            <h3 className="text-md font-semibold text-gray-600">{title}</h3>
            <div className="text-2xl font-bold text-[#5A6ACF] mt-1">{value}</div>
            <div className={`text-sm mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '▲' : '▼'} {Math.abs(changePercent)}% vs last week
            </div>

            {/* Custom Line Chart */}
            <div className="relative mt-4 h-[120px] w-full">
                {/* last week - gray line */}
                <svg className="absolute w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
                    <polyline
                        fill="none"
                        stroke="#E0E0E0"
                        strokeWidth="2"
                        points={lastWeekData.map((val, i) => `${i * 20},${getY(val)}`).join(' ')}
                    />
                </svg>

                {/* this week - blue line */}
                <svg className="absolute w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
                    <polyline
                        fill="none"
                        stroke="#4339F2"
                        strokeWidth="2"
                        points={currentData.map((val, i) => `${i * 20},${getY(val)}`).join(' ')}
                    />
                </svg>
            </div>

            {/* Labels */}
            <div className="flex justify-between text-xs text-gray-500 mt-2">
                {[1, 2, 3, 4, 5, 6].map((d) => <span key={d}>0{d}</span>)}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-5 text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-blue-600 rounded-full inline-block"></span>
                    <span>Last 6 days</span>
                </div>
                <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-gray-300 rounded-full inline-block"></span>
                    <span>Last Week</span>
                </div>
            </div>
        </div>
    );
};

export default MiniLineChartCard;
