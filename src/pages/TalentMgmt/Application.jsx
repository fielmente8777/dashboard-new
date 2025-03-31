import React, { useEffect, useState } from 'react'
import { Arrow, Filter, Search } from '../../icons/icon'
import { MdRefresh } from "react-icons/md";
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from 'react-redux';
import { fetchApplicants } from '../../redux/slice/TalentSlice';
const Application = () => {

    const dispatch = useDispatch();

    const { applicants, loading, error } = useSelector(state => state.applicants);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (token) {
            dispatch(fetchApplicants(token));
        }
    }, [dispatch, token]);

    const [active, setActive] = useState(0)
    const header = ["All Application", "Shortlisted", "Interview", "Hired", "Offered"]


    return (
        <div>
            <div className="flex mt-4">
                {header.map((item, index) => (
                    <button onClick={() => setActive(index)} key={index} className={`text-[14px] ${active === index ? "border-b-2 border-[#575757]" : "border-b-2 border-transparent"} px-4 py-3 bg-white font-medium text-[#575757]`}>{item}</button>
                ))}

                <div onClick={() => dispatch(fetchApplicants(localStorage.getItem("token")))} className='flex justify-end items-center text-[#575757] px-3 cursor-pointer'><MdRefresh size={25} /></div>
            </div>
            <div className="bg-white p-4">
                <div className="flex justify-between items-center mb-4 gap-2">
                    <div className='w-3/4 relative'>
                        <span className='absolute top-3.5 left-2'>
                            <Search />
                        </span>
                        <input
                            type="text"
                            placeholder="Search candidate"
                            className=" px-3 pl-8 w-full py-2 text-[14px] border rounded-md outline-none"
                        />
                    </div>

                    <button className="w-1/3 px-4 py-2 text-[#575757] text-[14px] font-medium bg-gray-200 rounded-md flex items-center justify-between">
                        <span className="flex items-center gap-2"><Filter className="w-2 h-2" /> Filter</span>
                        <span className="text-[#575757] text-[14px] font-semibold rotate-180"><Arrow /></span>
                    </button>
                </div>
                {!applicants ?


                    <div className='bg-gray-200 p-6 animate-pulse rounded-md mb-4' />
                    :
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="py-2 text-[14px] font-medium text-[#575757] capitalize">Name</th>
                                <th className="py-2 text-[14px] font-medium text-[#575757] capitalize">Contact</th>
                                <th className="py-2 text-[14px] font-medium text-[#575757] capitalize">Resume</th>
                                <th className="py-2 text-[14px] font-medium text-[#575757] capitalize">Status</th>
                                <th className="py-2 text-[14px] font-medium text-[#575757] capitalize">Job Title</th>
                                <th className="py-2 text-[14px] font-medium text-[#575757] capitalize">Applied Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicants?.map((applicant, index) => (
                                <tr key={index} className="border-b">
                                    <td className="py-2 text-purple-500 text-[14px] font-semibold flex items-center">
                                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                                        {applicant.name}
                                    </td>
                                    <td className="py-2 text-[14px] text-[#575757] capitalize">{applicant?.contact}</td>
                                    <td className="py-2 text-[14px]  text-blue-600"><Link to={applicant?.resume_url} target='_blank'>{applicant?.resume_url.slice(0, 33)}...</Link></td>
                                    <td className="py-2 text-[14px] font-medium  text-[#575757] capitalize">{applicant?.status}</td>
                                    <td className="py-2 text-[14px]  text-[#575757] capitalize">{applicant?.jobtitle}</td>
                                    <td className="py-2 text-[14px]  text-[#575757] capitalize">{applicant?.created_at}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                }
            </div>
        </div>
    )
}

export default Application