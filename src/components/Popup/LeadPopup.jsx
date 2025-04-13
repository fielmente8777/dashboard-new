import React from "react";

const LeadPopup = ({ isOpen, onClose, lead }) => {
    if (!lead) return null;

    return (

        <div
            // onClick={onClose}
            className={`fixed cursor-pointer inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        // className={`fixed cursor-pointer inset-0  bg-black bg-opacity-50 transition-opacity ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        >
            <div className="bg-[#f8f8fb] px-4 pb-4 pt-2 rounded-sm w-[60%] ">

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-medium text-[#575757] capitalize">{lead.Name}</h2>
                    <button onClick={onClose} className="text-[#575757]/70 text-2xl hover:text-[#575757]">&times;</button>
                </div>
                {/* <div className="bg-purple-500 text-white px-4 py-2 font-medium uppercase rounded-sm w-max mb-4">Uncontacted</div> */}

                <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
                    <div>
                        <h1 className="font-medium text-[#575757]">Customer Info</h1>
                        <div className=" grid gap-4 shadow-sm p-4 rounded-sm mt-2 text-base bg-white">
                            <div>
                                <p className=" font-medium text-[#575757]">Mobile Number:</p>
                                <p className="text-[#575757]/70">{lead.Contact}</p>
                            </div>
                            <div>
                                <p className=" font-medium text-[#575757]">Email Address:</p>
                                <p className="text-[#575757]/70">{lead.Email}</p>
                            </div>

                            {/* <div>
                                <p className="font-medium text-[#575757]">Timeline:</p>
                                <p className="text-[#575757]/70 ">{lead?.dateAdded ? "" : "Dec 05 - 02:34 PM"}</p>
                            </div> */}

                        </div>

                    </div>
                    <div>
                        <h3 className=" font-medium text-[#575757] mb-2">Customer Message</h3>

                        <div className="shadow-sm p-4 bg-white">
                            <p className="text-[#575757]/70 text-base">{lead?.Message.slice(0, 700)}</p>
                        </div>
                    </div>
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                        </div>


                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <button className="bg-[#0a3a75] hover:bg-[#0a3a75]/90 text-white px-4 py-2 rounded-md" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>


    );
};

export default LeadPopup;