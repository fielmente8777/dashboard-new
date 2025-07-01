import React from 'react'
import Swal from 'sweetalert2';

const PaymentIntegrationPopup = ({
    title,
    open,
    onConfirm,
    onCancel,
}) => {
    const [apiKey, setApiKey] = React.useState("");
    const [secretkey, setSecretKey] = React.useState("");
    return (
        <>
            {open && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50">
                <div className="animate-topDown max-w-xl mx-auto border border-gray-100 rounded-sm shadow-md bg-gray-100 p-6 space-y-6">
                    <div className="">
                        <div className='flex flex-col gap-4'>
                            <h2 className="text-xl font-medium">
                                {" "}
                                Please fill {title} details!
                            </h2>
                            <input
                                type="text"
                                value={apiKey}
                                required
                                onChange={(e) => {
                                    if (e.target.value.length > 60) {
                                        Swal.fire({
                                            icon: "warning",
                                            title: "Warning",
                                            text: "Title cannot exceed 60 characters.",
                                            confirmButtonText: "OK",
                                        });
                                        return;
                                    }
                                    setApiKey(e.target.value);
                                }}
                                placeholder="API Key"
                                className="outline-none border border-primary/40 bg-transparent p-2 rounded-sm w-full"
                            />
                            <input
                                type="text"
                                value={secretkey}
                                required
                                onChange={(e) => {
                                    if (e.target.value.length > 60) {
                                        Swal.fire({
                                            icon: "warning",
                                            title: "Warning",
                                            text: "Title cannot exceed 60 characters.",
                                            confirmButtonText: "OK",
                                        });
                                        return;
                                    }
                                    setSecretKey(e.target.value);
                                }}
                                placeholder="Secret Key"
                                className="outline-none border border-primary/40 bg-transparent p-2 rounded-sm w-full"
                            />

                            <div className="flex justify-end gap-4">
                                <button
                                    className="px-4 py-1 rounded-sm bg-green-600 text-white font-semibold"
                                    onClick={() => onConfirm(title, apiKey, secretkey)}
                                >
                                    Confirm
                                    {/* {confirm} */}
                                </button>
                                <button
                                    className="text-white px-4 py-1 rounded-sm bg-[#F95E5E] font-semibold"
                                    onClick={onCancel}
                                >
                                    {"Cancel"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            }
        </>
    )
}

export default PaymentIntegrationPopup