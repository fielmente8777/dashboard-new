import React from 'react'
import CommanHeader from '../../components/Navbar/CommanHeader'

const InfluencerMarketing = () => {
    return (
        <div className="p-4 bg-white">
            <CommanHeader serviceName="Influencer Marketing" />
            <hr className="mt-3" />
            <p className="text-gray-600 mb-4 mt-2">
                Leverage the power of influencers to grow your brand’s reach with curated stays, reviews, and social media content.
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Influencer shortlisting & outreach</li>
                <li>Collaboration coordination & logistics</li>
                <li>Content usage rights & repost strategy</li>
            </ul>
        </div>
    )
}

export default InfluencerMarketing