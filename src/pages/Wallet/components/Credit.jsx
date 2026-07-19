import { useState } from "react";

const pricing = [
    { credits: "5K", price: "5,000" },
    { credits: "10K", price: "10,000" },
    { credits: "15K", price: "15,000" },
    { credits: "20K", price: "20000" },
    { credits: "25K", price: "25,000" },
    { credits: "30k", price: "30,000" },
    { credits: "35k", price: "35,000" },
];

const Credit = () => {
    const [credit, setCredit] = useState(10000);
    const [autoPay, setAutoPay] = useState(false);

    const [active, setActive] = useState("");

    return (
        <div className="py-10 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Buy credits
                        </h1>

                        <div className="flex gap-8 mt-5">
                            <button className="pb-1 border-b-2 text-md border-blue-600 font-semibold text-black">
                                One-time purchase
                            </button>

                            {/* <button className="pb-3 text-gray-500 hover:text-black">
                Monthly subscription
              </button> */}
                        </div>
                    </div>

                    <p className="text-sm text-gray-500">
                        Buy credits <span className="mx-2">/</span> Checkout
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-lg shadow border overflow-hidden grid grid-cols-1 lg:grid-cols-2">

                    {/* Left Side */}
                    <div className="border-r">

                        {/* Credit Input */}
                        <div className="p-8 border-b">
                            <label className="block text-sm font-semibold mb-3">
                                Enter how many credits you need
                            </label>

                            <input
                                type="number"
                                value={credit}
                                onChange={(e) => setCredit(e.target.value)}
                                className="w-full border rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <p className="mt-3 text-sm text-gray-500">
                                1 Credit = 1 Rupee
                            </p>
                        </div>

                        {/* Autopay */}
                        <div className="p-8 border-b flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold">Set up autopay</h3>

                                <p className="text-sm text-gray-500 mt-2 max-w-sm">
                                    Stop worrying about your credit balance. Set up autopay to
                                    automatically purchase more credits whenever you fall below
                                    your limit.
                                </p>
                            </div>

                            <button
                                onClick={() => setAutoPay(!autoPay)}
                                className={`px-5 py-2 rounded border font-medium transition ${autoPay
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-gray-100"
                                    }`}
                            >
                                {autoPay ? "On" : "Off"}
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-100 p-8">
                            <p className="text-sm text-gray-500">
                                Price for {Number(credit).toLocaleString()} Credits
                            </p>

                            <h2 className="text-4xl font-bold mt-2">{pricing["10k"]}</h2>

                            <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition">
                                Checkout now →
                            </button>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div>
                        <div className="grid grid-cols-2 px-8 py-5 text-xs font-bold uppercase text-gray-500 border-b">
                            <span>Credits</span>
                            <span className="text-right">Price per credit</span>
                        </div>

                        {pricing.map((item) => (
                            <div
                                key={item.credits}
                                className={`grid grid-cols-2 px-8 py-5 transition ${item.active
                                        ? "bg-blue-50"
                                        : "hover:bg-gray-50"
                                    }`}
                            >
                                <span className="text-gray-800">{item.credits}</span>

                                <span className="text-right font-medium">
                                    {item.price}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Credit;