import CommanHeader from '../../components/Navbar/CommanHeader';

const Accounting = () => {
    return (
        <div className="p-4 bg-white">
            <CommanHeader serviceName={"Accounting Service"} />

            <hr className="mt-3" />
            <p className="mb-4 text-gray-600 mt-2">
                Our comprehensive Accounting service is designed specifically for hospitality businesses. We manage your financial records, cash flows, revenue tracking, and cost allocations to ensure your property stays profitable and compliant with financial best practices.
            </p>

            <h2 className="text-md text-gray-600 font-semibold mt-6 mb-2">What’s Included:</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Daily revenue and expense tracking</li>
                <li>Income statement and balance sheet preparation</li>
                <li>Cash flow monitoring and reporting</li>
                <li>Bank reconciliation and ledger maintenance</li>
                <li>Vendor payments and receivables management</li>
                <li>Budgeting and forecasting support</li>
                <li>Financial insights and profitability analysis</li>
                <li>Collaboration with GST filing and tax compliance</li>
            </ul>

            <h2 className="text-md text-gray-600 font-semibold mt-6 mb-2">Why It Matters:</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                <li>Gain clear insight into your property's financial health</li>
                <li>Reduce operational costs with optimized bookkeeping</li>
                <li>Stay audit-ready with organized and transparent records</li>
                <li>Make smarter business decisions based on real-time data</li>
            </ul>

            <p className="mt-6 text-gray-600">
                Let our accounting team handle the numbers so you can focus on delivering a great guest experience. Our reports and dashboards are easy to understand and tailored for hotel and homestay operations.
            </p>
        </div>
    );
};

export default Accounting;
