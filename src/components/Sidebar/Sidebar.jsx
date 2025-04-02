import React, { useEffect, useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { SidebarData } from '../../data/SideBarData';
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from '../../redux/slice/UserSlice';
import { Arrow } from '../../icons/icon';
const Sidebar = () => {

    const location = useLocation()
    const [openMenus, setOpenMenus] = useState({});
    const dispatch = useDispatch();
    const { user: hotel, loading, error } = useSelector((state) => state.userProfile);
    const token = localStorage.getItem("token");
    useEffect(() => {
        if (token) {
            dispatch(fetchUserProfile(token));
        }
    }, [dispatch, token]);

    useEffect(() => {
        if (hotel?.Data?.ndid) {
            localStorage.setItem("ndid", hotel.Data.ndid);
        }

        if (hotel?.Profile?.hotels) {
            const hotelKeys = Object.keys(hotel.Profile.hotels);
            if (hotelKeys.length > 0) {
                localStorage.setItem("hid", hotelKeys[0]);
            }
        }
    }, [hotel]);


    const toggleMenu = (index) => {
        setOpenMenus((prev) => ({
            ...prev, [index]: !prev[index]
        }));
    }
    const CountryCode =
    {
        india: "IN",
        unitedState: "US",
        unitedKingdom: "UK",
        dubai: "UAE",
        australia: "AUS"
    }

    return (
        <div className='flex overflow-x-hidden flex-col gap-2 w-full mb-10 overflow-y-scroll scrollbar-hidden'>

            {!hotel ?
                <div className='bg-gray-200 p-6 animate-pulse rounded-md mb-4' />
                :
                <div className='border cursor-pointer rounded-md px-2 py-1 flex items-center justify-between mb-4'>
                    <div className=''>
                        <p className='text-[14px] capitalize text-[#575757] font-medium'>{hotel?.Profile?.hotelName || "Eazotel"}</p>
                        <p className='text-[#575757]/70 text-[13px]'>{hotel?.Profile?.hoteladdress?.city}{", "}{hotel?.Profile?.hoteladdress?.State}{", "}{hotel?.Profile?.hoteladdress?.country}</p>
                    </div>

                    <div className='rotate-90'>
                        {/* <IoMdHome size={14} /> */}
                        {/* {"<>"} */}
                        <span className='rotate-90 text-[#575757]/70'><Arrow /></span>
                    </div>

                </div>
            }
            {SidebarData?.map((item, index) => (

                <div key={index} className='flex flex-col gap-1'>



                    {item?.subLinks ?
                        <div onClick={() => toggleMenu(index)} className='flex justify-between items-center cursor-pointer'>
                            <p className=' text-[14px] font-medium text-[#575757]/70 '>
                                {item.name}
                            </p>
                            <span className={`${openMenus[index] ? "rotate-90" : "-rotate-90"} py-2 ease-linear duration-300 text text-[#575757]/70 mr-1 `}><Arrow /></span>
                        </div>

                        :

                        <Link to={item.link} className={`${location.pathname === item.link ? "bg-[#0a3a75] text-white px-2 rounded-md" : ""}  text-[14px] py-2 font-medium text-[#575757]/70 `}>
                            {item.name}
                        </Link>
                    }

                    {openMenus[index] && item?.subLinks && <hr className='border-b' />}
                    {openMenus[index] && <div className='space-y-2'>
                        {item?.subLinks && item.subLinks.map((subLink, index) => (
                            <div className="flex flex-col transition-all duration-100 transform scale-95 opacity-0 animate-fadeIn">
                                <Link to={subLink.link} key={index} className={` ${location.pathname === subLink.link ? "bg-[#0a3a75] text-white px-2" : "hover:bg-[#0a3a75]/10"}  flex gap-1 items-center rounded-md capitalize py-2 px-3 text-[14px] font-medium text-[#575757] transition-all duration-100`}>
                                    {subLink.icon}{" "}{subLink.name}
                                </Link>
                            </div>
                        ))}
                    </div>}

                </div>
            ))}


        </div>
    );
}

export default Sidebar;
