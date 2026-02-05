import React from 'react'
import { MdClose } from 'react-icons/md';
import Hotel from "../../assets/HotelVhNPHJ.png"

const ContactForm = ({ open, setOpen }) => {
    return (
        <>
            {open && (
                <div
                    onClick={(e) => {
                        if (e.currentTarget) {
                            setOpen(false);
                        }
                    }}
                    className="fixed flex justify-center items-center top-0 left-0 z-[999999999999999999999999]  bg-black/50 w-full h-[100dvh]   "
                >
                    <div
                        onClick={(e) => e.stopPropagation()} className="text-[#575757]  bg-white  w-[40%] absolute  z-[999999999999999999999999999999999]">
                        <MdClose onClick={() => setOpen(false)} className="mr-5 cursor-pointer text-3xl flex justify-end" />
                        <div className='grid grid-cols-1 md:grid-cols-2 py-10 px-10'>

                            <div className='h-full'>
                                <img src={Hotel} alt='card' className='h-full object-cover' />
                            </div>

                            <div className="flex flex-col w-full gap-3 items-center">
                                <div className='w-full'>
                                    <label htmlFor='name'>Name</label>
                                    <input
                                        id='name'
                                        type="text"
                                        autoFocus
                                        // onChange={(e) => setSearch(e.target.value)}
                                        // value={search}
                                        name="name"
                                        placeholder=""
                                        className="bg-white py-4 w-full px-5 outline-none border  "
                                    />
                                </div>
                                <div className='w-full'>
                                    <label htmlFor='name'>Name</label>
                                    <input
                                        id='name'
                                        type="text"
                                        autoFocus
                                        // onChange={(e) => setSearch(e.target.value)}
                                        // value={search}
                                        name="name"
                                        placeholder=""
                                        className="bg-white py-4 w-full px-5 outline-none border  "
                                    />
                                </div>
                                <div className='w-full'>
                                    <label htmlFor='name'>Name</label>
                                    <input
                                        id='name'
                                        type="text"
                                        autoFocus
                                        // onChange={(e) => setSearch(e.target.value)}
                                        // value={search}
                                        name="name"
                                        placeholder=""
                                        className="bg-white py-4 w-full px-5 outline-none border  "
                                    />
                                </div>
                                <div className='w-full'>
                                    <label htmlFor='name'>Name</label>
                                    <input
                                        id='name'
                                        type="text"
                                        autoFocus
                                        // onChange={(e) => setSearch(e.target.value)}
                                        // value={search}
                                        name="name"
                                        placeholder=""
                                        className="bg-white py-4 w-full px-5 outline-none border  "
                                    />
                                </div>

                            </div>
                        </div>


                        {/* <div className=" p-4 pb-20 bg-gray-100 scrollbar-hidden min-h-screen h-[98vh] overflow-y-auto">
                            {filteredPremium.length > 0 && <div>
                                <h2 className="font-semibold mb-2">Premium Services</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mb-6">
                                    {filteredPremium.map((service) => (
                                        <div
                                            key={service.name}
                                            className="relative group cursor-pointer  shadow bg-white hover:bg-white duration-75 rounded-md"
                                            onClick={() => {
                                                handleOpenService(service);
                                            }}
                                        >
                                            <div className="flex flex-col items-center justify-center py-6 px-1">
                                                <div className="text-2xl mb-2">{service.icon}</div>
                                                <span className="text-center">{service.name}</span>
                                            </div>

                                            <div className="absolute bottom-full mb-2 w-max px-2 py-1 text-sm text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                                                {service.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>}


                            {filteredOther.length > 0 && <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-gray-800 font-semibold">Other Services</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                                    {filteredOther.map((service) => (
                                        <div
                                            key={service.name}
                                            className=" relative group cursor-pointer shadow  bg-white hover:bg-white duration-300 rounded-md"
                                            onClick={() => {
                                                handleOpenService(service);
                                            }}
                                        >
                                            <div className="flex flex-col items-center justify-center py-6 px-1">
                                                <div className="text-2xl mb-2">{service.icon}</div>
                                                <span className="text-center">{service.name}</span>
                                            </div>
                                            <div className="absolute bottom-full mb-2 w-max px-2 py-1 text-sm text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                                                {service.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>}
                        </div> */}
                    </div>
                </div>
            )}
        </>
    )
}

export default ContactForm