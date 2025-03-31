import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const Settings = () => {
    const [text, setText] = useState("");
    const [qrData, setQrData] = useState("");

    const handleGenerateQR = () => {
        if (text.trim() !== "") {
            setQrData(text);
        }
    };

    return (
        <div className="flex border rounded-lg  items-center justify-between p-6">
            <div className=" rounded-lg w-[40%] ">
                <h2 className="text-[14px] text-[#575757] font-semibold mb-1">QR Code Generator</h2>
                <input
                    type="text"
                    placeholder="Enter text or URL"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md outline-none"
                />

                <div className="flex gap-4">
                    <button
                        onClick={handleGenerateQR}
                        className="w-full mt-4 bg-[#0a3a75] hover:bg-[#0a3a75]/80 text-white py-2 rounded-md  transition"
                    >
                        Generate QR Code
                    </button>
                    {qrData && <button
                        onClick={() => setQrData("")}
                        className="w-full mt-4 bg-[#0a3a75] hover:bg-[#0a3a75]/80 text-white py-2 rounded-md  transition"
                    >
                        Reset
                    </button>}
                </div>



            </div>
            {qrData ? (
                <div className="mt-6 flex flex-col items-center">
                    <QRCodeCanvas value={qrData} size={170} />
                    <p className="mt-2 text-gray-500 text-sm">Scan the QR Code</p>
                </div>
            )
                :
                <div className="mt-6 flex flex-col justify-center px-5 items-center border h-[12rem]">
                    {/* <QRCodeCanvas value={qrData} size={180} /> */}
                    <p className="mt-2 text-gray-500 text-sm">Generate the QR Code</p>
                </div>

            }

        </div>
    );
};

export default Settings;
