import React from 'react'

const Review = () => {

    const reviews = [
        { lable: 'Positive', value: 1 },
        { lable: 'Negative', value: 1 },
        { lable: 'Average', value: 1 },
    ];

    const total = reviews.reduce((acc, r) => acc + r.value, 0);

    const getColor = (index) => {
        const colors = ['#4339F2', '#A19EF0', '#C9C8FC'];
        return colors[index % colors.length];
    };

    const donutStyle = {
        background: `conic-gradient(
      ${getColor(0)} 0% ${reviews[0].value / total * 100}%,
      ${getColor(1)} ${reviews[0].value / total * 100}% ${(reviews[0].value + reviews[1].value) / total * 100}%,
      ${getColor(2)} ${(reviews[0].value + reviews[1].value) / total * 100}% 100%
    )`
    };

    return (
        <div className="lg:col-span-2 bg-white p-4 rounded-xl cardShadow w-full ">
            <h3 className="text-md font-semibold text-gray-600">Customer Reviews</h3>
            <p className="text-sm text-gray-500 mb-4">Overview of Reviews</p>

            <div className="flex justify-center items-center">
                <div className="relative w-40 h-40 rounded-full" style={donutStyle}>
                    <div className="absolute top-1/2 left-1/2 w-28 h-28 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
            </div>

            <div className="flex justify-around mt-6 text-sm text-gray-600">
                {reviews.map((r, i) => (
                    <div key={i} className="flex items-center space-x-3">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor(i) }}></span>
                        <span>{r.lable}</span>
                        <span className="font-medium text-gray-800">{r.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Review