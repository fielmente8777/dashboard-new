import React from 'react'
import { useSelector } from 'react-redux';

const Newsletter = () => {
    const { currentLoactionWebsiteData, loading } = useSelector(
        (state) => state?.hotelsWebsiteData
    );


    // console.log(currentLoactionWebsiteData)

    const data = [
        {
            _id: "734236482384382",
            email: "test@gmail.com"
        },
        {
            _id: "734236482384383",
            email: "test@eazotel.com"
        }

    ];
    return (
        <div className="bg-white">
            <div className="bg-white p-4">
                <h2 className="text-md font-semibold text-[#575757]">
                    Newsletters
                </h2>
            </div>

            <div className="bg-white p-4 ">
                {!loading ? (
                    <div className="overflow-auto">
                        <table className="w-full text-left bg-[#0a3a75] text-white/90 rounded-sm shadow-md shadow-black/20">
                            <thead>
                                <tr className="border-b">

                                    <th className="py-3 px-2 text-[14px] font-medium capitalize whitespace-nowrap">
                                        ID
                                    </th>
                                    <th className="py-3 px-2 text-[14px] font-medium capitalize">
                                        Email
                                    </th>
                                </tr>
                            </thead>

                            {/* {data?.length > 0 ? ( */}
                            {currentLoactionWebsiteData?.NewsletterData?.length > 0 ? (
                                <tbody>
                                    {/* {data?.map((subs, index) => ( */}
                                    {currentLoactionWebsiteData?.NewsletterData?.map((subs, index) => (
                                        <tr
                                            key={index}
                                            className={`py-1 border-b odd:bg-gray-50 even:bg-gray-100 border-gray-200 hover:bg-[#f8f8fb] transition duration-300 cursor-pointer `}
                                        >
                                            <td className="py-3 px-2 text-[14px] text-[#575757]">
                                                {subs?._id}
                                            </td>
                                            <td className="py-3 px-2 text-[14px] text-[#575757]">
                                                {subs?.email}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            ) : (
                                <tbody>
                                    <tr className="bg-white text-gray-600 text-center border">
                                        <td colSpan={9} className="py-2">
                                            Data not found!
                                        </td>
                                    </tr>
                                </tbody>
                            )}
                        </table>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((_, index) => (
                            <div key={index}>
                                <p className="py-[1.35rem] animate-pulse bg-gray-100"></p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Newsletter