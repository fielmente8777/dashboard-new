import React, { useEffect, useState } from 'react';
import { MdRefresh } from 'react-icons/md';
import LeadPopup from '../../components/Popup/LeadPopup';
import { Search } from '../../icons/icon';
import { getAllClientEnquires } from '../../services/api';
import { formatDateTime } from '../../services/formateDate';
// import FilterPopup from '../../components/Popup/FilterPopup';

const Leads = () => {
    const [active, setActive] = useState(0)
    const header = ["All Enquires", "Open Queries", "Contacted", "Converted"]
    const [enquires, setEnquires] = useState([]);
    const [filteredEnquires, setFilteredEnquires] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [open, setOpen] = useState(false)


    const fetchEnquires = async (token) => {
        setLoading(true);
        try {
            const response = await getAllClientEnquires(token);
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
    // const fetchFilteredClientQuery = async (e) => {
    //     console.log(e)
    //     const response = await getAllClientEnquires(localStorage.getItem("token"), e)
    //     console.log(response)
    //     setEnquires(response);
    // }

    useEffect(() => {
        if (searchTerm.length > 0) {
            const filtered = enquires.filter((enquery) =>
                enquery.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                enquery.Contact.includes(searchTerm) ||
                enquery.Message.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredEnquires(filtered);
        } else {
            // Restore full list if search is empty
            setFilteredEnquires(enquires);
        }
    }, [searchTerm, enquires]);

    // useEffect(() => {

    //     const delayDebounce = setTimeout(() => {
    //         const fetchData = async () => {
    //             try {
    //                 const token = localStorage.getItem("token");
    //                 const response = await getAllClientEnquires(token, searchTerm);
    //                 setEnquires(response);
    //             } catch (error) {
    //                 console.error("Failed to fetch client enquiries:", error);
    //             }
    //         };

    //         fetchData();
    //     }, 500);

    //     return () => clearTimeout(delayDebounce);
    // }, [searchTerm]);

    const handleTabClick = async (index) => {
        setSearchTerm('')
        setLoading(true)
        setActive(index);
        const token = localStorage.getItem("token");
        try {
            if (index === 0) {
                const response = await getAllClientEnquires(token, searchTerm);
                setEnquires(response);
            } else if (index === 1) {
                const response = await getAllClientEnquires(token, searchTerm, "Open");
                setEnquires(response);
            } else if (index === 2) {
                const response = await getAllClientEnquires(token, searchTerm, "Contacted");
                setEnquires(response);
            } else if (index === 3) {
                const response = await getAllClientEnquires(token, searchTerm, "Converted");
                setEnquires(response);
            }
        } catch (error) {
            throw error;
        }
        finally {
            setLoading(false)
        }

    };



    // console.log(enquires,)
    // console.log(filteredEnquires,)



    return (
        <div>
            <div className="flex mt-4">
                {header.map((item, index) => (
                    <button onClick={() => handleTabClick(index)} key={index} className={`text-[14px] ${active === index ? "border-b-2 border-[#575757]" : "border-b-2 border-transparent"} px-4 py-3 bg-white font-medium text-[#575757]`}>{item}</button>
                ))}
                <div onClick={() => fetchEnquires(localStorage.getItem("token"))} className={`flex justify-end items-center text-[#575757] px-3 cursor-pointer ${loading ? "animate-spin" : ""} `}><MdRefresh size={25} /></div>
            </div>
            <div className="bg-white p-4">
                <div className="flex justify-between items-center mb-4 gap-2">
                    <div className='w-full relative'>
                        <span className='absolute top-3.5 left-2'>
                            <Search />
                        </span>
                        <input
                            type="text"
                            placeholder="Search clients by name, contact or message"
                            className=" px-3 pl-8 w-full py-2 text-[14px] border rounded-md outline-none"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* <button onClick={() => setOpen(!open)} className="w-1/3 px-4 py-2 text-[#575757] text-[14px] font-medium bg-gray-200 rounded-md flex items-center justify-between">
                        <span className="flex items-center gap-2"><Filter className="w-2 h-2" /> Filter</span>
                        <span className="text-[#575757] text-[14px] font-semibold rotate-180"><Arrow /></span>
                    </button> */}
                    {/* <button onClick={() => setOpen(!open)} className="w-1/3 px-4 py-2 text-[#575757] text-[14px] font-medium bg-gray-200 rounded-md flex items-center justify-between">
                        <span className="flex items-center gap-2"><Filter className="w-2 h-2" /> Filter</span>
                        <span className="text-[#575757] text-[14px] font-semibold rotate-180"><Arrow /></span>
                    </button> */}
                </div>

                {!loading ?
                    <table className="w-full text-left ">
                        <thead>
                            <tr className="border-b">
                                <th className="py-2 text-[14px] font-medium text-[#575757] capitalize">Name</th>
                                <th className="py-2 text-[14px] font-medium text-[#575757] capitalize">Contact</th>
                                <th className="py-2 text-[14px] font-medium text-[#575757] capitalize">Email</th>
                                <th className="py-2 text-[14px] font-medium text-[#575757] capitalize lg:w-[400px]">Details</th>
                                <th className="py-2 text-[14px] font-medium text-[#575757] capitalize">status</th>
                                <th className="py-2 text-[14px] font-medium text-[#575757] capitalize resize">Date Added</th>
                            </tr>
                        </thead>
                        {filteredEnquires &&
                            <tbody>
                                {filteredEnquires.map((enquery, index) => (
                                    <tr key={index} className={`border-b cursor-pointer py-1 ${enquery?.status === "Open" ? " text-purple-500" : "text-[#575757]"}`} onClick={() => {
                                        setSelectedLead(enquery);
                                        setIsPopupOpen(true);
                                    }}>
                                        <td className="py-3 text-[14px] text-purple-500 font-semibold flex items-center">
                                            <span className="w-1.5 h-1.5 text-[14px] bg-purple-500 rounded-full mr-2"></span>
                                            {enquery.Name}
                                        </td>
                                        <td className="py-3 text-[14px]   capitalize">{enquery?.Contact}</td>
                                        <td className="py-2 text-[14px]  text-[#575757]  md:w-[13rem] lg:w-[20rem]">{enquery.Email}</td>
                                        <td className="py-3 text-[14px]  "><span className='font-medium text-[14px]'>Lead Via {enquery?.created_from}:</span> {enquery?.Message.slice(0, 25)} {enquery?.Message.length > 30 ? <span className="text-blue-600">...read more</span> : ""}</td>
                                        <td className="py-2 text-[14px] font-medium   capitalize">{enquery?.status}</td>
                                        <td className="py-3 text-[14px] whitespace-nowrap   capitalize">{enquery?.Created_at ? formatDateTime(enquery?.Created_at) : "Dec 05 - 02:34 PM"}</td>
                                    </tr>
                                )).reverse()}
                            </tbody>
                        }

                    </table>
                    :
                    <div className='space-y-2'>
                        {[1, 2, 3, 4, 5, 6, 7].map(index => (
                            <div key={index}>
                                <p className='py-5 animate-pulse bg-gray-100'></p>
                            </div>
                        ))}
                    </div>
                }
            </div>
            {/* <FilterPopup open={open} setOpen={setOpen} /> */}
            <LeadPopup
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                lead={selectedLead}
                fetchEnquires={fetchEnquires}
                handleTabClick={handleTabClick}
                activeIndex={active}
            />
        </div>
    )
}

export default Leads
