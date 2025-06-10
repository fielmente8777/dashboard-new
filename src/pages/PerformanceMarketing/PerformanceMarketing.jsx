import React, { useEffect } from "react";
import CommanHeader from "../../components/Navbar/CommanHeader";
const PerformanceMarketing = () => {
  const fetchData = () => {
    try {
      console.log("first");
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="p-4 bg-white mb-10 cardShadow">
      <CommanHeader serviceName="Performance Marketing" />
      <hr className="mt-3" />
      <p className="text-gray-600 mb-4 mt-2">
        We run data-driven campaigns across platforms like Google Ads, Facebook,
        and Instagram to bring in qualified leads, boost visibility, and
        maximize return on ad spend (ROAS) for your hospitality business.
      </p>
      <h2 className="text-md text-gray-600 font-semibold mt-6 mb-2">
        What’s Included:
      </h2>
      <ul className="list-disc pl-6 text-gray-600 space-y-1">
        <li>Search & display ads management</li>
        <li>Facebook & Instagram campaign setup</li>
        <li>Landing page A/B testing & conversion tracking</li>
        <li>Weekly performance optimization</li>
        <li>Analytics & reporting</li>
      </ul>
      <h2 className="text-md text-gray-600 font-semibold mt-6 mb-2">
        Benefits:
      </h2>
      <ul className="list-disc pl-6 text-gray-600 space-y-1">
        <li>Attract more direct bookings</li>
        <li>Target ideal guest profiles</li>
        <li>Better ROI with tracked and optimized ads</li>
      </ul>
    </div>
  );
};

export default PerformanceMarketing;
