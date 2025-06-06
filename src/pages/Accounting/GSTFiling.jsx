import React from 'react';
import CommanHeader from '../../components/Navbar/CommanHeader';

const GSTFiling = () => {
    return (
        <div className="p-4 bg-white">
            <CommanHeader serviceName={"GST Filing Service"} />

            <hr className="mt-3" />
            <p className="mb-4 text-gray-600 mt-2">
                Our GST Filing service ensures that your property business stays fully compliant with all government tax regulations. From accurate invoicing to timely return submissions, we take the hassle out of your monthly and quarterly GST responsibilities.
            </p>

            <h2 className="text-md text-gray-600 font-semibold mt-6 mb-2">What’s Included:</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Monthly/quarterly GST return preparation and filing</li>
                <li>Input tax credit (ITC) reconciliation and tracking</li>
                <li>GST invoice format compliance</li>
                <li>E-way bill and document support (if applicable)</li>
                <li>Handling of notices or queries from the GST portal</li>
                <li>Coordination with accounting for accurate data</li>
                <li>GST audit and annual return support</li>
            </ul>

            <h2 className="text-md text-gray-600 font-semibold mt-6 mb-2">Benefits of Timely GST Filing:</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Stay 100% compliant with tax laws</li>
                <li>Avoid penalties and interest on late filings</li>
                <li>Maximize input tax credit claims</li>
                <li>Maintain professional business credibility</li>
            </ul>

            <p className="mt-6 text-gray-600">
                Whether you're a small homestay or a multi-property hotel brand, our GST experts ensure your filings are always accurate and on time — giving you peace of mind and a clear tax trail.
            </p>
        </div>
    );
};

export default GSTFiling;
