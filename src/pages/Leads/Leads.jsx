import React, { useEffect, useState } from 'react'
import { Arrow, Filter, Search } from '../../icons/icon';
import { MdRefresh } from 'react-icons/md';
import { getAllClientEnquires } from '../../services/api';

const Leads = () => {
    const [active, setActive] = useState(0)
    // const header = ["All Enquires", "Uncontacted", "Follow Ups", "Converted", "Not Converted"]
    const header = ["All Enquires"]

    const [enquires, setEnquires] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchEnquires = async (token) => {
        setLoading(true);
        try {
            const response = await getAllClientEnquires(token);
            console.log(response)
            setEnquires(response);
        } catch (error) {
            console.error("Error fetching enquires:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquires(localStorage.getItem("token"));
    }, [])
    const clients = [
        { name: "abhijeet", details: "Lead via Webhooks Name: abhijeet Phone: +9163457...", dateAdded: "Dec 05 - 02:34 PM" },
        { name: "Abhijeet", details: "Lead via Webhooks Name: Abhijeet Phone: +9195282...", dateAdded: "Dec 05 - 02:32 PM" },
        { name: "test", details: "Lead via Webhooks Name: test Phone: +91789456123...", dateAdded: "Nov 30 - 10:16 PM" },
    ];
    return (
        <div>
            <div className="flex mt-4">
                {header.map((item, index) => (
                    <button onClick={() => setActive(index)} key={index} className={`text-[14px] ${active === index ? "border-b-2 border-[#575757]" : "border-b-2 border-transparent"} px-4 py-3 bg-white font-medium text-[#575757]`}>{item}</button>
                ))}
                <div onClick={() => fetchEnquires(localStorage.getItem("token"))} className='flex justify-end items-center text-[#575757] px-3 cursor-pointer'><MdRefresh size={25} /></div>
            </div>
            <div className="bg-white p-4">
                <div className="flex justify-between items-center mb-4 gap-2">
                    <div className='w-3/4 relative'>
                        <span className='absolute top-3.5 left-2'>
                            <Search />
                        </span>
                        <input
                            type="text"
                            placeholder="Search Clients"
                            className=" px-3 pl-8 w-full py-2 text-[14px] border rounded-md outline-none"
                        />
                    </div>

                    <button className="w-1/3 px-4 py-2 text-[#575757] text-[14px] font-medium bg-gray-200 rounded-md flex items-center justify-between">
                        <span className="flex items-center gap-2"><Filter className="w-2 h-2" /> Filter</span>
                        <span className="text-[#575757] text-[14px] font-semibold rotate-180"><Arrow /></span>
                    </button>
                </div>

                {enquires && <table className="w-full text-left">
                    <thead>
                        <tr className="border-b">
                            <th className="py-2 text-[14px] font-medium text-[#575757] capitalize">Name</th>
                            <th className="py-2 text-[14px] font-medium text-[#575757] capitalize">Details</th>
                            <th className="py-2 text-[14px] font-medium text-[#575757] capitalize">Contact</th>
                            <th className="py-2 text-[14px] font-medium text-[#575757] capitalize">status</th>
                            <th className="py-2 text-[14px] font-medium text-[#575757] capitalize">Date Added</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enquires.map((enquery, index) => (
                            <tr key={index} className="border-b">
                                <td className="py-2 text-[14px] text-purple-500 font-semibold flex items-center">
                                    <span className="w-1.5 h-1.5 text-[14px] bg-purple-500 rounded-full mr-2"></span>
                                    {enquery.Name}
                                </td>
                                <td className="py-2 text-[14px] text-[#575757] capitalize md:w-[13rem] lg:w-[20rem]">{enquery.Message}...</td>
                                <td className="py-2 text-[14px]  text-[#575757] capitalize">{enquery.Contact}</td>
                                <td className="py-2 text-[14px] font-medium  text-[#575757] capitalize">Done</td>
                                <td className="py-2 text-[14px]  text-[#575757] capitalize">{enquery?.dateAdded ? "" : "Dec 05 - 02:34 PM"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>}
            </div>
        </div>
    )
}

export default Leads
