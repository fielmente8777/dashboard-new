import React from "react";
import CommanHeader from "../../components/Navbar/CommanHeader";

const EmailMarketing = () => {
  return (
    <div className="p-4 bg-white mb-10 cardShadow">
      <CommanHeader serviceName="Email Marketing" />
      <hr className="mt-3" />
      <p className="text-gray-600 mb-4 mt-2">
        Reach past guests and potential customers with well-crafted email campaigns for offers, updates, and news.
      </p>
      <ul className="list-disc pl-6 text-gray-600 space-y-1">
        <li>Email design & content</li>
        <li>List segmentation & scheduling</li>
        <li>Performance analytics</li>
      </ul>
    </div>
  );
};

export default EmailMarketing;
