
import React, { useEffect, useState } from 'react'
import axios from "axios"
import { NEW_BASE_URL } from "../../data/constant"
import { getAllVisitors,getAllVisitorsActivities } from "../../services/api/WebsiteTracker.api"

const VisitorActivity = () => {

    const [sessions,setSessions]=useState([])
    const [loading,setLoading]=useState(true)

    const fetchVisitorsActivites = async () => {
        setLoading(true);
        try {
            const formBody = {
                skip: 0,
                limit: 100,
            };
            const response = await getAllVisitorsActivities(formBody);
            setSessions(response);
        } catch (error) {
            console.error("Error fetching call");
        } finally {
            setLoading(false);
        }
    };


    // const handleViewDetails = (sessionId) => {
    //     alert(`Viewing details for NDID: ${ndid}`);
    // }

    useEffect(()=>{
        fetchVisitorsActivites()
    },[])

    function getBrowserName(userAgent) {
        if (!userAgent) return "Unknown";

        if (userAgent.includes("Firefox")) return "Firefox";
        if (userAgent.includes("Edg/")) return "Edge";
        if (userAgent.includes("OPR") || userAgent.includes("Opera")) return "Opera";
        if (userAgent.includes("Chrome") && !userAgent.includes("Chromium") && !userAgent.includes("Edg/")) return "Chrome";
        if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";

        return "Local";
    }

    // console.log(sessions)
    return (
        <div className="p-4">
        <h1 className="text-md font-medium mb-4">Visitor Activites</h1>
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse bg-white">
            <thead className="bg-gray-100 font-normal text-gray-400 text-md">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session Start</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session End</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Time Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Browser Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page Visit</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800">
                {loading ? (
                <tr>
                    <td colSpan="12" className="px-4 py-6 text-center text-gray-500">
                    Loading...
                    </td>
                </tr>
                ) : sessions && sessions.length > 0 ? (
                sessions.map((session) => (
                    <tr
                        key={session.ndid}
                        className="hover:bg-gray-50 border-b text-sm font-medium transition-colors"
                    >
                    <td className="px-6  py-3">{session.ip}</td>
                    <td className="px-6 py-3 font-medium">
                        {new Date(session?.session_start).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                        {session?.session_end ? new Date(session?.session_end)?.toLocaleString():""}
                    </td>

                    <td className="px-6 py-3">{session?.session_end?<p className='bg-red-300 rounded-md text-center'>Visited</p>:<p className='bg-green-300 rounded-md text-center'>Active</p>}</td>
                    <td className="px-6 py-3">{session?.total_duration}</td>
                    <td className="px-6 py-3">{session?.headers?.host}</td>
                    <td className="px-6 py-3">
                        {getBrowserName(session?.headers["user-agent"])}
                    </td>
                    <td>
                        {session?.pages?.map((page,index)=>(
                            <div key={index} >
                                <p>Page: {page?.url}, Time Spent: {page?.duration}</p>
                            </div>
                        ))}
                    </td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td
                    colSpan="12"
                    className="px-4 py-6 text-center text-gray-500"
                    >
                    No sessions found.
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
    </div>

    )
}

export default VisitorActivity