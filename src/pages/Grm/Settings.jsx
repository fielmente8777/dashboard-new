import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { MdFileCopy } from "react-icons/md";
import { MdOutlineFileCopy } from "react-icons/md";

const Settings = () => {
    const [copied, setCopied] = useState(false);


    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const [qrData, setQrData] = useState(localStorage.getItem('qr'));

    const base_url = "https://grm.eazotel.com/"
    // https://grm.eazotel.com/home/?id=757874a0-0058-4629-96e8-569b041445ff&hid=20272036&reservationid=101

    const handleGenerateQR = () => {
        // Live
        setQrData(`https://grm.eazotel.com/home/?id=${localStorage.getItem("ndid")}&hid=${localStorage.getItem('hid')}`)
        localStorage.setItem("qr", `https://grm.eazotel.com/home/?id=${localStorage.getItem("ndid")}&hid=${localStorage.getItem('hid')}`)

        // local
        // setQrData(`http://localhost:3001/home/?id=${localStorage.getItem("ndid")}&hid=${localStorage.getItem('hid')}`)
        // localStorage.setItem("qr", `http://localhost:3001/home/?id=${localStorage.getItem("ndid")}&hid=${localStorage.getItem('hid')}`)
    }


    const shareQandUrlonWhatsapp = () => {
        const message = `Explore our grm by using this link ${qrData}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank")
    }

    // const captureAndShareQR = async () => {
    //     if (qrRef.current) {
    //         const canvas = await html2canvas(qrRef.current);
    //         const image = canvas.toDataURL("image/png");
    //         const whatsappUrl = `https://wa.me/?text=${encodeURIComponent("Scan this QR Code to join:")}&media=${encodeURIComponent(image)}`;
    //         window.open(whatsappUrl, "_blank");
    //     }
    // };

    return (
        <div >


            <div className="flex flex-col p-4 bg-white   cardShadow mb-10 text-[#575757] w-full">
                <h2 className="font-semibold text-[#575757] mb-2">Generate GRM for your Hotel</h2>
                <p className="text-[#575757]/70 mb-6">
                    To begin testing, Generate the guest request management website url and feel free to share with the upcomming guests.
                </p>
                <div className="bg-white p-6 rounded-lg w-full">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex flex-col w-[400px]">
                            {/* <h3 className="font-medium mb-2">QR Code Generator</h3> */}
                            {/* <h3 className="text-lg font-medium mb-2">Send a WhatsApp message</h3> */}
                            {/* <p className="flex items-center gap-2">
                                <span className="text-green-600 font-semibold">{phoneNumber}</span>
                                <button onClick={() => copyToClipboard(phoneNumber)} className=" hover:text-gray-700">
                                    {copied ? <MdFileCopy className="w-5 h-5 text-green-500" /> : <MdOutlineFileCopy className="w-5 h-5" />}
                                </button>
                            </p>
                            <p className="mt-2 ">
                                with code <span className="font-semibold">{joinCode}</span>
                                <button onClick={() => copyToClipboard(joinCode)} className="ml-2  hover:text-gray-700">
                                    {copied ? <MdFileCopy className="w-5 h-5 text-green-500" /> : <MdOutlineFileCopy className="w-5 h-5" />}
                                </button>
                            </p> */}

                            <div className="flex gap-4">
                                {!qrData ? <button
                                    onClick={handleGenerateQR}
                                    className="w-full mt-4 bg-[#0a3a75] hover:bg-[#0a3a75]/80 text-white py-2 rounded-md  transition"
                                >
                                    Generate QR Code
                                </button>
                                    : <button
                                        onClick={() => setQrData("")}
                                        className="w-full mt-4 bg-[#0a3a75] hover:bg-[#0a3a75]/80 text-white py-2 rounded-md  transition"
                                    >
                                        Reset
                                    </button>}
                            </div>

                        </div>
                        <div className="">
                            <h3 className="text-[14px] font-medium mb-2">Scan the QR code on mobile</h3>
                            {qrData ? (
                                <div className="mt-6 flex flex-col items-center ">
                                    <QRCodeCanvas value={qrData} size={170} />
                                    <p className="mt-2  text-sm">Scan the QR Code</p>
                                </div>
                            )
                                :
                                <div className="mt-6 flex flex-col justify-center px-5 items-center border h-[12.5rem]">
                                    {/* <QRCodeCanvas value={qrData} size={180} /> */}
                                    <p className="mt-2 text-sm">Generate the QR Code</p>
                                </div>

                            }
                        </div>
                    </div>
                    <p className="mt-3 font-medium">Generated Url: {qrData ? <a href={qrData} target="_blank" className="hover:underline text-blue-600">{qrData}</a> : <span className="text-[#575757]/70">Please generate to see link</span>}</p>
                    {qrData && <button onClick={shareQandUrlonWhatsapp} className="mt-4 flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                        {/* {qrData && <button onClick={captureAndShareQR} className="mt-4 flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"> */}
                        <MdFileCopy className="w-5 h-5" /> Share on WhatsApp
                    </button>}
                </div>
            </div>
        </div>
    );
};

export default Settings;
