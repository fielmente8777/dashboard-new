import React from 'react'
import CommanHeader from '../../components/Navbar/CommanHeader'

const OTAOptimization = () => {
    return (
        <div className="p-4 bg-white mb-10 cardShadow">
            <CommanHeader serviceName={"OTA Optimization Service"} />

            <hr className='mt-3' />
            <p className="mb-4 text-gray-600 mt-2">
                Our OTA Optimization service ensures your property performs its best on platforms like Booking.com, Airbnb, Agoda, and others. Through data-driven insights and strategic improvements, we help you increase visibility, ranking, and conversion on all connected OTAs.
            </p>

            <h2 className="text-md text-gray-600 font-semibold mt-6 mb-2">What’s Included:</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Profile audit & optimization suggestions</li>
                <li>Improved property descriptions and content</li>
                <li>Dynamic pricing strategy alignment</li>
                <li>Room & rate plan adjustments</li>
                <li>Optimized images and amenity tagging</li>
                <li>Review management & response templates</li>
                <li>Ranking boost tactics (promo, visibility boosters)</li>
                <li>Competitive analysis & market benchmarking</li>
            </ul>

            <h2 className="text-md text-gray-600 font-semibold mt-6 mb-2">Benefits of Optimization:</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Higher visibility and OTA ranking</li>
                <li>Better conversion rates</li>
                <li>More bookings with improved guest experience</li>
                <li>Reduced cancellations and better guest targeting</li>
            </ul>

            <p className="mt-6 text-gray-600">
                Whether your property is underperforming or you just want to stay ahead of the competition, our OTA Optimization service ensures you're fully utilizing all the tools OTAs offer to grow your revenue.
            </p>
        </div>
    )
}

export default OTAOptimization