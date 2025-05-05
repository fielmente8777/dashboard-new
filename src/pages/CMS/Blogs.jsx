import React, { useEffect, useState } from 'react'
import Swal from 'sweetalert2';
import { GetwebsiteDetails } from '../../services/api';

const Blogs = () => {
    const [websiteBlogsData, setWebsiteBlogsData] = useState([]);
    const [loading, setLoading] = useState(false);


    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const data = await GetwebsiteDetails(token); // Assuming this is an async function
            console.log(data.Blogs)
            setWebsiteBlogsData(data?.Blogs || []);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch website details. Please try again.',
                confirmButtonText: 'OK',
            });
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData()
    })
    return (
        <div className='bg-white  p-4'>
            <div className='bg-white'>
                <h2 className="text-sm font-semibold text-[#575757]">Blogs</h2>
            </div>
        </div>
    )
}

export default Blogs