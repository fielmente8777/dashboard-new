import React from 'react'
import CommanHeader from '../../components/Navbar/CommanHeader'

const GMBProfile = () => {
    return (
        <div className="p-4 bg-white mb-10 cardShadow">
            <CommanHeader serviceName="Google Listing" />
            <hr className="mt-3" />
            <p className="text-gray-600 mb-4">
                We set up and optimize your Google Business Profile to improve local SEO, manage reviews, and get more visibility on Google Maps and search results.
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Business profile setup or audit</li>
                <li>Category, hours, and location updates</li>
                <li>Review management support</li>
            </ul>
        </div>
    )
}

export default GMBProfile