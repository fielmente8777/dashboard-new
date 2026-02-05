import React, { useContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import DataContext from '../../../context/DataContext'
import EmergencyCard from "../../../components/Card/EmergencyCard"
import DataCard from '../../../components/Card/DataCard'
const Emergency = () => {

    const location = useLocation();
    const { emergencyRequestData, setEmergencyNotifications } = useContext(DataContext)

    useEffect(() => {
        if (location.pathname === "/emergency-request") {
            setEmergencyNotifications([])
        }
    }, [])


    return (
        <div className='flex flex-col gap-5'>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 '>
                <DataCard count={emergencyRequestData?.length ? emergencyRequestData?.length : "0"} heading={"Total Emergency Requests"} />
            </div>
            {/* <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-200 text-[#575757]">
                    <thead className="bg-gray-100 whitespace-nowrap">
                        <tr>
                            <th className="border border-gray-300 p-2 text-left">Guest Name</th>
                            <th className="border border-gray-300 p-2 text-left">Phone Number</th>
                            <th className="border border-gray-300 p-2 text-left">Room Number</th>
                            <th className="border border-gray-300 p-2 text-left ">Room Category</th>
                            <th className="border border-gray-300 p-2 text-left">Location</th>
                            <th className="border border-gray-300 p-2 text-left">Requested Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {emergencyRequestData?.map((row, index) => (
                            <tr key={index}
                                className={`odd:bg-blue-50/10 even:bg-white ${row.status === "Pending" ? "bg-[#FF432A]/20" : row.status === "In Progress" ? "bg-[#F3A407]" : "bg-green-100"}`}>
                                <td className="border border-gray-300 p-2 capitalize">{row.guestName}</td>
                                <td className="border border-gray-300 p-2"><Link to={`tel:+${row.guestPhoneNumber}`}>{row.guestPhoneNumber}</Link> </td>
                                <td className="border border-gray-300 p-2 capitalize">{row.roomNumber}</td>
                                <td className="border border-gray-300 p-2 capitalize">
                                    {row.roomType}
                                </td>
                                <td className="border border-gray-300 p-2 whitespace-nowrap">
                                    <Link to={row.request} target="_blank">{row.request}</Link>
                                </td>

                                <td className="border border-gray-300 p-2 whitespace-nowrap">
                                    {new Date(row.createdAt).toLocaleString()}
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>


            </div > */}
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4'>

                {emergencyRequestData.map((item, index) => (
                    <EmergencyCard key={index} data={item} />

                ))}
            </div>

        </div>
    )
}

export default Emergency