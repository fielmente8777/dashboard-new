import React from 'react'
import CommanHeader from '../../components/Navbar/CommanHeader';
const Linktree = () => {
    return (
        <div className="p-4 bg-white mb-10 cardShadow">
            <CommanHeader serviceName="Linktree Setup" />
            <hr className="mt-3" />
            <p className="text-gray-600 mb-4 mt-2">
                Get a custom Linktree page to organize all your important links (website, OTA, WhatsApp, social media, etc.) in one sleek, mobile-friendly view.
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Custom layout and design</li>
                <li>Link tracking integration</li>
                <li>Embedded WhatsApp & call buttons</li>
            </ul>
        </div>
    )
}

export default Linktree