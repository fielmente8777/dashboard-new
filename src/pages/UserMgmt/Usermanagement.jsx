import React, { useEffect, useState } from 'react';
import { fetchUserManagementData } from '../../services/api';
import { IoClose } from "react-icons/io5";
import { IoMdCheckmark } from "react-icons/io";
const Usermanagement = () => {

    const [userManagementData, setUserManagementData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            const usersData = await fetchUserManagementData(token);
            setUserManagementData(usersData);
        };

        fetchData();
    }, []);
    const accessRoles = ["bookingEngine", "channelManager", "cms", "foodManager",
        "frontDesk", "gatewayManager", "reservationDesk", "seoManager", "socialMedia", "themes", "PMS", "GRM", "HRM",];

    console.log("user data", userManagementData)
    // console.log("user data", userManagementData[0].accessScope[accessRoles[1]])

    if (!userManagementData) return <div>Loading...</div>
    return (
        <div className="flex flex-col justify-center  bg-white  text-white">

            <div className="px-4">
                <table className="w-full text-left bg-white ">
                    <thead >

                        <tr className="border-b whitespace-nowrap">
                            <th className="py-3 text-[14px] font-medium text-[#575757] capitalize">Name</th>
                            <th className="py-2 text-[14px] font-medium text-[#575757] capitalize">Email</th>
                            {accessRoles?.slice(0, 4).map((role) => (
                                <th key={role} className="py-2 px-2 text-[14px] text-center font-medium text-[#575757] capitalize">{role}</th>
                            ))}
                            <th className="py-2 text-[14px] font-medium text-[#575757] capitalize">Admin</th>
                            <th className="py-2 text-[14px] font-medium text-[#575757] capitalize whitespace-nowrap">Date Added</th>
                        </tr>
                    </thead>

                    <tbody className="">
                        {userManagementData?.map((user, index) => (
                            <tr key={index} className="border-b border-gray-200">
                                <td className="py-2 text-[14px] font-medium text-[#575757] capitalize">{user.displayName}</td>
                                <td className="py-2 text-[14px]  text-[#575757] lowercase">{user.emailId}</td>

                                {user.accessScope &&
                                    Object.entries(user.accessScope)
                                        .slice(0, 4)
                                        .map(([role, hasAccess]) => (
                                            <td key={role} className="text-center">
                                                <div className="flex justify-center">
                                                    {hasAccess ? (
                                                        <IoMdCheckmark className="h-6 w-6 text-green-500" />
                                                    ) : (
                                                        <IoClose className="h-6 w-6 text-red-500" />
                                                    )}
                                                </div>
                                            </td>
                                        ))}
                                {/* {
                                    accessRoles.slice(0, 4).map((role) => (
                                        <td key={role} className="text-center">
                                            <div className='flex justify-center'>
                                                {user.accessScope[role] !== "true" ? (
                                                    <IoClose className="h-6 w-6 text-green-500" />
                                                ) : (
                                                    <IoMdCheckmark className="h-6 w-6 text-red-500" />
                                                )}
                                            </div>
                                        </td>
                                    ))
                                } */}
                                < td className="px-4 py-3" >
                                    {user.isAdmin === "true" ? (
                                        <IoClose className="h-6 w-6 text-green-500" />
                                    ) : (
                                        <IoMdCheckmark className="h-6 w-6 text-red-500" />
                                    )}

                                </td>
                                <td className="py-2 text-[14px] whitespace-nowrap  text-[#575757] lowercase">{new Date(user.createdAt).toLocaleString("en-GB", {
                                    day: "2-digit", month: "2-digit", year: "numeric",
                                    hour: "2-digit", minute: "2-digit", hour12: false
                                })} </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div >
        </div >
    );
};

export default Usermanagement;
