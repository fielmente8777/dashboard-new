import React from 'react';
import CommanHeader from '../../components/Navbar/CommanHeader';

const OTAManagement = () => {
    return (
        <div className="p-4 bg-white mb-10 cardShadow">
            <CommanHeader serviceName={"OTA Management Service"} />

            <hr className="mt-3" />
            <p className="mb-4 mt-2 text-gray-600">
                Our OTA Management service offers end-to-end support for managing your property listings across all Online Travel Agencies (OTAs) like Booking.com, Airbnb, Agoda, and more. We handle daily operations, rate and availability syncs, issue resolution, and platform updates to keep everything running smoothly — so you can focus on your guests.
            </p>

            <h2 className="text-md text-gray-600 font-semibold mt-6 mb-2">What’s Included:</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Daily OTA account monitoring & maintenance</li>
                <li>Real-time inventory and rate updates</li>
                <li>Offer and promotion setup across platforms</li>
                <li>Availability sync and channel conflict resolution</li>
                <li>Guest message handling and review responses</li>
                <li>Dispute resolution for cancellations or no-shows</li>
                <li>Monthly performance reporting</li>
                <li>Rate parity monitoring across OTAs</li>
            </ul>

            <h2 className="text-md text-gray-600 font-semibold mt-6 mb-2">Benefits of Our Management Service:</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Save time and reduce manual workload</li>
                <li>Avoid overbookings or missed bookings</li>
                <li>Better OTA relationships and faster support handling</li>
                <li>Consistent brand and pricing strategy across channels</li>
            </ul>

            <p className="mt-6 text-gray-600">
                Whether you're managing one property or many, our dedicated OTA specialists ensure your online presence is always accurate, competitive, and optimized to drive results.
            </p>
        </div>
    );
};

export default OTAManagement;
