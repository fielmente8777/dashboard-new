import { useSelector } from "react-redux";
import { MarketPlaceService } from "../../data/constant"
import axios from "axios"

const MarkInterestedPopup = ({ open, setOpen, selectedServices, setSelectedServices }) => {
    const { user: hotel, authUser } = useSelector((state) => state.userProfile);


    const handleAddService = (item) => {
        setSelectedServices((prev) => prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item])
    }


    const onConfirm = async () => {

        if (selectedServices.length < 1) {
            alert("Please select any services")
        }
        else {
            try {
                const response = await axios.post("https://nexon.eazotel.com/eazotel/addcontacts", {
                    Contact: hotel?.Profile?.hotelPhone,
                    Description: `Interested Sevices: ${selectedServices}`,
                    Domain: "fielmente",
                    Name: hotel?.Profile?.hotelName,
                    Remark: "I'm interested in services",
                    Subject: "",
                    check_in: "",
                    check_out: "",
                    created_from: "Dashboard",
                    email: hotel?.Profile?.hotelEmail,
                    numbers_of_guest: ""
                })
                console.log(response.data.Status)
                console.log("Request raised successfully!")
            } catch (error) {
                console.log("Error raising request!", error)
            }
            finally {
                setOpen(false)
            }
        }

    }

    const onCancel = () => {
        // setSelectedServices([])
        setOpen(false)
    }


    console.log(selectedServices)
    return (
        open && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50">
                <div className="animate-topDown max-w-xl mx-auto border border-gray-100 rounded-sm shadow-md bg-gray-100 p-6 space-y-6">
                    <div className="">
                        <div>
                            <h2 className="text-xl font-medium"> Please selete any service!</h2>

                        </div>
                        <div className="flex gap-2 whitespace-nowrap flex-wrap py-5">
                            {selectedServices.length > 0 ? selectedServices.map((item) => (
                                <button className="bg-gray-200 px-3 font-medium py-1 tracking-wide rounded-full text-[12px] text-gray-700">{item}</button>
                            ))
                                :
                                <p className="bg-gray-200 px-3 font-medium py-1 tracking-wide rounded-full text-[12px] text-gray-700">No service selected</p>

                            }

                        </div>


                        <h1>Service that may helpful for your need?</h1>
                        <div className="flex gap-2 whitespace-nowrap flex-wrap py-5">
                            {MarketPlaceService && MarketPlaceService.map((item) => (
                                <button
                                    onClick={() => {
                                        handleAddService(item)
                                    }}
                                    className={`bg-gray-200 px-3 font-medium py-1 tracking-wide rounded-full text-[12px] text-gray-700 
                                        ${selectedServices?.includes(item) ? "border-2 border-orange-400" : "border-2 border-transparent"}
                                        
                                        `}>{item}</button>
                            ))}

                        </div>


                        <div className="flex justify-end gap-4">
                            <button
                                className="px-4 py-1 rounded-sm bg-green-600 text-white font-semibold"
                                onClick={onConfirm}
                            >
                                Confirm
                                {/* {confirm} */}
                            </button>
                            <button
                                className="text-white px-4 py-1 rounded-sm bg-[#F95E5E] font-semibold"
                                onClick={onCancel}
                            >

                                {"Cancle"}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        )
    )
}

export default MarkInterestedPopup