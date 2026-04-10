const CreditUsage = ({title, value,used,total,color,icon}) => {
    const percentage = total && used ? Math.round((used / total) * 100) : 0;

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">{title}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {percentage}% Used
                </span>
            </div>
            <h2 className="text-2xl font-bold">{value}</h2>
            <p className="text-sm text-gray-400 mb-2">
                {used} of {total} credits used
            </p>
            <div className="w-full bg-gray-200 h-2 rounded">
                <div className={`h-2 rounded ${color}`} style={{ width: `${percentage}%` }}/>
            </div>
        </div>
    );
};

export default CreditUsage;