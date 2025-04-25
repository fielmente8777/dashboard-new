import React from 'react'
import { MdClose } from 'react-icons/md'

const FilterPopup = ({ open, setOpen }) => {
    return (
        <>
            {open && <div className='fixed top-0 left-0  bg-black/30 w-full h-[100dvh] flex justify-end '>
                <div className='text-[#575757] bg-white  w-[378px] h-[100vh] '>
                    <div className='flex justify-between items-center p-5'>

                        <h1 className='text-xl font-bold'>Filter</h1>
                        <span className='cursor-pointer' onClick={() => setOpen(!open)}><MdClose size={24} /></span>
                    </div>
                    <div className='flex flex-col border mt-10'>
                        <div className='flex flex-col  px-5 border hover:bg-[#f8f8fb] py-1'>
                            <div className='flex justify-between items-center'>

                                <label htmlFor='date' className='font-semibold text-[14px]'>Date Created</label>
                                <span className='font-semibold text-[14px] text-red-500'>Clear</span>
                            </div>

                            <input type='date' placeholder='Choose any date' className='bg-transparent outline-none' />
                        </div>
                        <div className='flex flex-col  px-5 border hover:bg-[#f8f8fb]'>
                            <label htmlFor='date'>Date</label>
                            <input type='' placeholder='Choose any date' className='bg-transparent outline-none' />
                        </div>

                    </div>
                </div>
            </div>}
        </>
    )
}

export default FilterPopup