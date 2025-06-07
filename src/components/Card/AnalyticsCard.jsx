import React from 'react'

const AnalyticsCard = () => {
    const chartData = {
        current: [80, 65, 70, 60, 90, 95, 80, 75, 65, 70, 85, 90],
        previous: [50, 95, 50, 40, 60, 55, 45, 65, 50, 60, 55, 50],
        labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
    };


    const maxHeight = 100;
    return (
        <div className="p-4 bg-white cardShadow rounded-xl">
            <h2 className="text-md font-semibold text-gray-600">Revenue or Google analytics here</h2>
            <p className="text-xl font-bold text-[#5A6ACF] mt-1">INR 00.00</p>
            <p className="text-sm text-green-600 font-semibold mt-1">▲ 0.0% vs last week</p>
            <p className="text-sm text-gray-500 mt-1">Sales from 1–12 June, 2025</p>

            {/* Chart */}
            <div className=" flex justify-between items-end space-x-2 h-[120px] mt-4 border-b-2 border-gray-200">
                {chartData.labels.map((label, i) => (
                    <div key={i} className="flex gap-1.5 items-end justify-end w-5">
                        {/* Bars */}
                        <div className="w-2.5 bg-[#5A6ACF]"
                            style={{ height: `${(chartData.current[i] / 100) * maxHeight}px` }}
                        ></div>
                        <div className="w-2.5 bg-gray-200"
                            style={{ height: `${(chartData.previous[i] / 100) * maxHeight}px` }}
                        ></div>

                    </div>
                ))}
            </div>

            {/* Labels */}
            <div className="flex justify-between mt-2 text-xs text-gray-500 px-1">
                {chartData.labels.map((label, i) => (
                    <span key={i} className="w-5 text-center">{label}</span>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-blue-600 inline-block rounded-full"></span>
                    <span>Last 12 days</span>
                </div>
                <div className="flex items-center space-x-1">
                    <span className="w-3 h-3 bg-gray-300 inline-block rounded-full"></span>
                    <span>Last Month</span>
                </div>
            </div>
        </div>
    )
}

export default AnalyticsCard