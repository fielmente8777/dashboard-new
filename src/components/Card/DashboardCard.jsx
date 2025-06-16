import React from 'react'
import { BsFillBagCheckFill } from "react-icons/bs";
const DashboardCard = ({ amount = 0, label = 'Label', progress = 0 }) => {

    const getColor = (progress) => {
        if (progress <= 25) {
            return "bg-red-600/50"
        }
        else if (progress > 25 && progress <= 50) {
            return "bg-violet-600/50"
        }
        else if (progress > 50 && progress <= 75) {
            return "bg-yellow-600/50"
        }
        else {
            return "bg-green-600/50"
        }
    }

    return (
        <div className=" h-[156px] p-4 rounded-xl md:cardShadow overflow-hidden bg-white flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div>
                    {/* <p className="text-2xl font-bold text-primary/90">₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p> */}
                    <p className="text-4xl font-bold text-primary/90">{amount}</p>
                    <p className="text-lg font-medium text-gray-500">{label}</p>
                </div>
                <div className="bg-violet-500 p-2 rounded-md">
                    <BsFillBagCheckFill size={20} color="white" />
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
}

export default DashboardCard