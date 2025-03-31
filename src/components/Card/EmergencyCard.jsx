import React from 'react'
import { Link } from 'react-router-dom'

const EmergencyCard = ({ data }) => {
    return (
        <div className='border-2 rounded-md shadow-md'>
            <iframe
                src={`${data?.request}&output=embed`}
                allowfullscreen=""
                loading="lazy"
                className='w-full'
                referrerpolicy="no-referrer-when-downgrade">
            </iframe>
            <div className='px-2 py-2 flex'>
                <div className='flex-1'>
                    <p>{data?.guestName}</p>
                    <p>{data?.guestPhoneNumber}</p>
                    <p className='capitalize'>{data?.roomNumber}, {data?.roomType}</p>
                    <p></p>
                    <p>{new Date(data?.createdAt).toLocaleString()}</p>
                </div>
                <div className='flex flex-col'>
                    <Link to="tel:+9528295631" className='bg-[#FF432A]/50 px-4 py-2 rounded-full text-center font-semibold text-[12px] mt-2 text-black'>Instant Call </Link>
                    <Link to={`${data?.request} `} className='bg-[#FF432A]/50 px-4 py-2 rounded-full text-[12px] font-semibold text-center mt-2 text-black'>Track Location</Link>
                </div>
            </div>

        </div>
    )
}

export default EmergencyCard