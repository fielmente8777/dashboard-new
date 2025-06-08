import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios';
import { Link } from 'react-router-dom';
import DataContext from '../../../context/DataContext';
import { Arrow, Filter, Search } from '../../../icons/icon';
import { MdRefresh } from 'react-icons/md';
const Request = () => {
    const { requestData,
        setRequestsData,
        howManyPendingRequest,
        howManyInProgressRequest,
        howManyCompletedRequest,
        live, host, getAllRequest,
        loading, setLoading
    } = useContext(DataContext);
    const [statusFilter, setStatusFilter] = useState("All");
    const [searchPhone, setSearchPhone] = useState("");
    const [searchRoom, setSearchRoom] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [active, setActive] = useState(0)
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState(requestData);

    // const filteredData = requestData?.filter((item) => {
    //     const matchesStatus =
    //         statusFilter === "All" || item.status === statusFilter;
    //     const matchesPhone =
    //         searchPhone === "" || item.guestPhoneNumber.includes(searchPhone);
    //     const matchesRoom =
    //         searchRoom === "" || item.roomNumber.includes(searchRoom);
    //     const matchesDate =
    //         searchDate === "" || new Date(item.createdAt).toLocaleDateString() === new Date(searchDate).toLocaleDateString();
    //     return matchesStatus && matchesPhone && matchesRoom && matchesDate;
    // }).reverse();


    // const handleStatusChange = async (requestId, newStatus) => {
    //     const updatedData = [...requestData];
    //     const requestIndex = updatedData.findIndex(request => request.requestId === requestId);
    //     if (requestIndex !== -1) {
    //         updatedData[requestIndex].status = newStatus;
    //     }
    //     try {
    //         const response = await axios.put(`${host}/api/request`, {
    //             requestId: requestId,
    //             status: newStatus
    //         });

    //         if (response.status === 200) {
    //             setRequestsData(updatedData);
    //             howManyPendingRequest(updatedData);
    //             howManyInProgressRequest(updatedData);
    //             howManyCompletedRequest(updatedData);
    //         } else {
    //             console.error('Failed to update status');
    //         }
    //     } catch (error) {
    //         console.error('Error:', error);
    //     }
    // };

    const header = ["All Requests", "Pending", "In Progress", "Completed", "Cancelled"]

    const handleTabClick = (index) => {
        setLoading(true)
        // alert(index)
        setActive(index);
        try {
            const response = index == 0 ? requestData : requestData?.filter(request => request.status === header[index])
            setFilteredData(response)
        } catch (error) {
            throw error
        }
        finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        getAllRequest()
    }, [])


    return (
        <div className='bg-white cardShadow mb-10'>
            <div className="flex">
                {header.map((item, index) => (
                    <button onClick={() => handleTabClick(index)} key={index} className={`text-[14px] ${active === index ? "border-b-2 border-[#575757]" : "border-b-2 border-transparent"} px-4 py-3 bg-white font-medium text-[#575757]`}>{item}</button>
                ))}
                <div onClick={getAllRequest} className={`flex justify-end items-center text-[#575757] px-3 cursor-pointer ${loading ? "animate-spin" : ""} `}><MdRefresh size={25} /></div>
            </div>
            <div className='flex flex-col gap-5 p-4 bg-white'>
                <div className="flex justify-between items-center gap-2">
                    <div className='w-3/4 relative'>
                        <span className='absolute top-3.5 left-2'>
                            <Search />
                        </span>
                        <input
                            type="text"
                            // placeholder="Search by name, phone, room"
                            placeholder="We will update it soon"
                            disabled
                            className=" px-3 pl-8 w-full py-2 text-[14px] border rounded-md outline-none"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button className="w-1/3 px-4 py-2 text-[#575757] text-[14px] font-medium bg-gray-200 rounded-md flex items-center justify-between">
                        <span className="flex items-center gap-2"><Filter className="w-2 h-2" /> Filter</span>
                        <span className="text-[#575757] text-[14px] font-semibold rotate-180"><Arrow /></span>
                    </button>
                </div>

                {/* <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4">
                <div className=''>
                    <label className="block mb-1 text-sm font-medium text-[#575757]">
                        Filter by Status:
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="  outline-none text-[#575757] rounded-sm py-1 w-full"
                    >
                        <option value="All" className='text-[#575757] '>All</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-[#575757]">
                        Search by Phone:
                    </label>
                    <input
                        type="text"
                        value={searchPhone}
                        onChange={(e) => setSearchPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="  outline-none w-full text-[#575757]  rounded-sm py-1"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-[#575757]">
                        Search by Room:
                    </label>
                    <input
                        type="text"
                        value={searchRoom}
                        onChange={(e) => setSearchRoom(e.target.value)}
                        placeholder="Enter room number"
                        className="  outline-none w-full text-[#575757]  rounded-sm py-1"
                    />
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-[#575757]">
                        Search by Date:
                    </label>
                    <input
                        type="date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        placeholder="Enter Date"
                        className="  outline-none w-full text-[#575757] rounded-sm py-1"
                    />
                </div>
            </div> */}

                <div className="overflow-x-auto">
                    {
                        !loading ?
                            <table className="min-w-full border-collapse text-[#575757]">
                                <thead className="whitespace-nowrap">
                                    <tr className='border-b'>
                                        <th className=" py-2 font-medium text-[14px] text-left">Guest Name</th>
                                        <th className="py-2  font-medium text-[14px] text-left">Phone Number</th>
                                        <th className="py-2  font-medium text-[14px] text-left">Room Number</th>
                                        {/* <th className=" py-2 font-medium text-[14px] text-left">Room Category</th> */}
                                        <th className=" py-2 font-medium text-[14px] text-left">Requested Items</th>
                                        <th className=" py-2 font-medium text-[14px] text-left">Special Request</th>
                                        <th className="py-2  font-medium text-[14px] text-left">Status</th>
                                        <th className="py-2  font-medium text-[14px] text-left">Requested Time</th>
                                        {/* <th className="  font-medium text-[14px] text-left">Actions</th> */}
                                    </tr>
                                </thead>

                                {filteredData.length > 0 ?
                                    <tbody className='text-[14px]'>
                                        {filteredData.map((row, index) => (
                                            <tr key={index}
                                                className={`odd:bg-blue-50/10 border-b even:bg-white ${row.status === "Pending" ? "bg-[#FF432A]/20" : row.status === "In Progress" ? "bg-[#F3A407]" : "bg-green-100"}`}>
                                                {/* className={` ${row.status === "Pending" ? "bg-[#F3A407]" : row.status === "In Progress" ? "bg-[#007AFF]" : row.status === "Cancelled" ? "bg-[#D91001]" : "bg-[#3CA703]"}`}> */}
                                                <td className="  py-3 capitalize font-medium">{row.guestName}</td>
                                                <td className="  py-3"><Link to={`tel:+${row.guestPhoneNumber}`}>{row.guestPhoneNumber}</Link></td>
                                                <td className="  py-3 capitalize">{row.roomNumber}</td>
                                                {/* <td className="  p-2 capitalize">
                                        {row.roomType}
                                    </td> */}
                                                <td className="  py-3 whitespace-nowrap">
                                                    <ul>
                                                        {row.requestedItems.map((item) => (
                                                            <li key={item._id} className='flex justify-between gap-3 '>
                                                                <p>{item.item}</p>
                                                                <p>{item.quantity}</p>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </td>
                                                <td className="  py-3 capitalize">{row.specialRequest.length < 30 ? row.specialRequest : `${row.specialRequest.slice(0, 30)}...`}</td>
                                                <td className={`  py-3 font-medium ${row.status === "Pending" ? "text-[#F3A407]" : row.status === "In Progress" ? "text-[#007AFF]" : row.status === "Completed" ? "text-[#3CA703]" : row.status === "Cancelled" ? "text-[#D91001]" : ""}`}>
                                                    {row.status === "Pending" ?
                                                        <span className='flex gap-2 items-center'>
                                                            <svg width="14" height="14" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M13.55 14.7L14.95 13.3L11.25 9.6V5H9.25V10.4L13.55 14.7ZM10.25 20C8.86667 20 7.56667 19.7375 6.35 19.2125C5.13333 18.6875 4.075 17.975 3.175 17.075C2.275 16.175 1.5625 15.1167 1.0375 13.9C0.5125 12.6833 0.25 11.3833 0.25 10C0.25 8.61667 0.5125 7.31667 1.0375 6.1C1.5625 4.88333 2.275 3.825 3.175 2.925C4.075 2.025 5.13333 1.3125 6.35 0.7875C7.56667 0.2625 8.86667 0 10.25 0C11.6333 0 12.9333 0.2625 14.15 0.7875C15.3667 1.3125 16.425 2.025 17.325 2.925C18.225 3.825 18.9375 4.88333 19.4625 6.1C19.9875 7.31667 20.25 8.61667 20.25 10C20.25 11.3833 19.9875 12.6833 19.4625 13.9C18.9375 15.1167 18.225 16.175 17.325 17.075C16.425 17.975 15.3667 18.6875 14.15 19.2125C12.9333 19.7375 11.6333 20 10.25 20Z" fill="#F3A407" />
                                                            </svg> <p>Pending</p></span> :
                                                        row.status === "In Progress" ?
                                                            <span className='flex gap-2 items-center'>
                                                                <svg width="14" height="14" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M9.34997 14.6L16.4 7.55L15 6.15L9.34997 11.8L6.49997 8.95L5.09997 10.35L9.34997 14.6ZM10.75 20C9.36664 20 8.06664 19.7375 6.84997 19.2125C5.6333 18.6875 4.57497 17.975 3.67497 17.075C2.77497 16.175 2.06247 15.1167 1.53747 13.9C1.01247 12.6833 0.749969 11.3833 0.749969 10C0.749969 8.61667 1.01247 7.31667 1.53747 6.1C2.06247 4.88333 2.77497 3.825 3.67497 2.925C4.57497 2.025 5.6333 1.3125 6.84997 0.7875C8.06664 0.2625 9.36664 0 10.75 0C12.1333 0 13.4333 0.2625 14.65 0.7875C15.8666 1.3125 16.925 2.025 17.825 2.925C18.725 3.825 19.4375 4.88333 19.9625 6.1C20.4875 7.31667 20.75 8.61667 20.75 10C20.75 11.3833 20.4875 12.6833 19.9625 13.9C19.4375 15.1167 18.725 16.175 17.825 17.075C16.925 17.975 15.8666 18.6875 14.65 19.2125C13.4333 19.7375 12.1333 20 10.75 20Z" fill="#007AFF" />
                                                                </svg>
                                                                <p>Progress</p>
                                                            </span>
                                                            :
                                                            row.status === "Completed" ?
                                                                <span className='flex gap-2 items-center'>
                                                                    <svg width="14" height="14" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M9.35 14.6L16.4 7.55L15 6.15L9.35 11.8L6.5 8.95L5.1 10.35L9.35 14.6ZM10.75 20C9.36667 20 8.06667 19.7375 6.85 19.2125C5.63333 18.6875 4.575 17.975 3.675 17.075C2.775 16.175 2.0625 15.1167 1.5375 13.9C1.0125 12.6833 0.75 11.3833 0.75 10C0.75 8.61667 1.0125 7.31667 1.5375 6.1C2.0625 4.88333 2.775 3.825 3.675 2.925C4.575 2.025 5.63333 1.3125 6.85 0.7875C8.06667 0.2625 9.36667 0 10.75 0C12.1333 0 13.4333 0.2625 14.65 0.7875C15.8667 1.3125 16.925 2.025 17.825 2.925C18.725 3.825 19.4375 4.88333 19.9625 6.1C20.4875 7.31667 20.75 8.61667 20.75 10C20.75 11.3833 20.4875 12.6833 19.9625 13.9C19.4375 15.1167 18.725 16.175 17.825 17.075C16.925 17.975 15.8667 18.6875 14.65 19.2125C13.4333 19.7375 12.1333 20 10.75 20Z" fill="#3CA703" />
                                                                    </svg>
                                                                    <p>Completed</p>
                                                                </span> :
                                                                row.status === "Cancelled" ?
                                                                    <span className='flex gap-2 items-center'>
                                                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M4.31427 10.3333L6.71427 7.93325L9.11427 10.3333L10.0476 9.39992L7.64761 6.99992L10.0476 4.59992L9.11427 3.66658L6.71427 6.06659L4.31427 3.66658L3.38094 4.59992L5.78094 6.99992L3.38094 9.39992L4.31427 10.3333ZM6.71427 13.6666C5.79205 13.6666 4.92538 13.4916 4.11427 13.1416C3.30316 12.7916 2.59761 12.3166 1.99761 11.7166C1.39761 11.1166 0.922607 10.411 0.572607 9.59992C0.222607 8.78881 0.0476074 7.92214 0.0476074 6.99992C0.0476074 6.0777 0.222607 5.21103 0.572607 4.39992C0.922607 3.58881 1.39761 2.88325 1.99761 2.28325C2.59761 1.68325 3.30316 1.20825 4.11427 0.858252C4.92538 0.508252 5.79205 0.333252 6.71427 0.333252C7.6365 0.333252 8.50316 0.508252 9.31427 0.858252C10.1254 1.20825 10.8309 1.68325 11.4309 2.28325C12.0309 2.88325 12.5059 3.58881 12.8559 4.39992C13.2059 5.21103 13.3809 6.0777 13.3809 6.99992C13.3809 7.92214 13.2059 8.78881 12.8559 9.59992C12.5059 10.411 12.0309 11.1166 11.4309 11.7166C10.8309 12.3166 10.1254 12.7916 9.31427 13.1416C8.50316 13.4916 7.6365 13.6666 6.71427 13.6666Z" fill="#D91001" />
                                                                        </svg>

                                                                        <p>Cancelled</p></span> : ""
                                                    }
                                                </td>
                                                <td className="  py-3 whitespace-nowrap">
                                                    {new Date(row.createdAt).toLocaleString()}
                                                </td>
                                                {/* <td className="  p-2">
                                        <select
                                            value={row.status}
                                            onChange={(e) => handleStatusChange(row.requestId, e.target.value)}
                                            // onChange={(e) => handleSocketUpdate(index, e.target.value)}
                                            className="  outline-none text-[#575757] rounded-sm p-1"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Cancelled">Cancelled</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </td> */}
                                            </tr>
                                        ))}
                                    </tbody>
                                    : (
                                        <tbody>
                                            <tr>
                                                <td colSpan="9" className="text-center py-4">No matching results found.</td>
                                            </tr>
                                        </tbody>
                                    )}
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
                </div >
            </div >
        </div>

    )
}

export default Request