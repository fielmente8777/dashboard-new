import React from 'react'
import CommanHeader from '../../components/Navbar/CommanHeader'

const PublicRelation = () => {
    return (
        <div className="p-4 bg-white mb-10 cardShadow">
            <CommanHeader serviceName="Public Relations (PR)" />
            <hr className="mt-3" />
            <p className="text-gray-600 mb-4 mt-2">
                Build a strong brand reputation through curated press releases, influencer outreach, and media partnerships.
            </p>
            <h2 className="text-md text-gray-600 font-semibold mt-6 mb-2">What’s Included:</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Press release creation & distribution</li>
                <li>Media outreach & coordination</li>
                <li>Reputation monitoring</li>
            </ul>
            <h2 className="text-md text-gray-600 font-semibold mt-6 mb-2">Benefits:</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Boost brand visibility</li>
                <li>Earn trust with media mentions</li>
                <li>Grow reputation organically</li>
            </ul>
        </div>
    )
}

export default PublicRelation