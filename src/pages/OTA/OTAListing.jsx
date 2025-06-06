import React from 'react'
import CommanHeader from '../../components/Navbar/CommanHeader'

const OTAListing = () => {
    // const otaPlatforms = [
    //     {
    //         name: "Booking.com",
    //         icon: "🏨",
    //         status: "Connected",
    //         link: "/manage/booking-com",
    //     },
    //     {
    //         name: "Airbnb",
    //         icon: "🛏️",
    //         status: "Not Connected",
    //         link: "/connect/airbnb",
    //     },
    //     {
    //         name: "Agoda",
    //         icon: "🌐",
    //         status: "Connected",
    //         link: "/manage/agoda",
    //     },
    //     {
    //         name: "MakeMyTrip",
    //         icon: "🧳",
    //         status: "Not Connected",
    //         link: "/connect/makemytrip",
    //     },
    //     {
    //         name: "Expedia",
    //         icon: "✈️",
    //         status: "Connected",
    //         link: "/manage/expedia",
    //     },
    // ];
    return (
        <div className="p-4 bg-white">
            <CommanHeader serviceName={"OTA Listing Service"} />
            {/* <div className='flex justify-between items-center'>

                <h1 className="text-md text-gray-600 font-bold mb-4">OTA Listing Service</h1>
                <button className="bg-green-600 text-white py-2 px-3 rounded-lg hover:scale-95 font-semibold">Mark as interested</button>

            </div> */}

            <hr className='mt-3' />

            <p className="mb-4 text-gray-600 mt-2">
                Our OTA (Online Travel Agency) Listing service helps you get your property listed across top booking platforms to maximize your visibility and boost occupancy. We ensure your property stands out with well-crafted profiles and optimized content.
            </p>

            <h2 className="text-md text-gray-600 font-semibold mt-6 mb-2">We List You On:</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Booking.com</li>
                <li>Airbnb</li>
                <li>Agoda</li>
                <li>MakeMyTrip</li>
                <li>Expedia</li>
                <li>Goibibo</li>
                <li>Cleartrip</li>
                <li>Trip.com</li>
            </ul>

            <h2 className="text-md font-semibold text-gray-600 mt-6 mb-2">What’s Included:</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Property profile creation</li>
                <li>Content writing (title, description, amenities)</li>
                <li>Image uploading and optimization</li>
                <li>Room/category setup with pricing & availability</li>
                <li>Policy configuration (cancellation, check-in/out, etc.)</li>
                <li>SEO optimization for listings</li>
                <li>OTA account management support</li>
            </ul>

            <p className="mt-6 text-gray-700">
                We handle the end-to-end onboarding process for each platform and ensure your listings are updated and competitive. Our team also assists with resolving OTA-related issues and optimizing your rankings regularly.
            </p>


            {/* <h2 className="text-xl font-semibold mb-4">OTA Listings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otaPlatforms?.map((ota) => (
                    <div
                        key={ota.name}
                        className="border rounded-lg p-4 flex items-center justify-between hover:shadow"
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-2xl">{ota.icon}</div>
                            <div>
                                <div className="font-medium">{ota.name}</div>
                                <div
                                    className={`text-sm ${ota.status === "Connected" ? "text-green-600" : "text-red-500"
                                        }`}
                                >
                                    {ota.status}
                                </div>
                            </div>
                        </div>
                        <a
                            href={ota.link}
                            className="text-blue-600 underline text-sm"
                        >
                            {ota.status === "Connected" ? "Manage" : "Connect"}
                        </a>
                    </div>
                ))}
            </div> */}
        </div>
    )
}

export default OTAListing