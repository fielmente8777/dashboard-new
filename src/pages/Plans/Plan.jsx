import React from "react";
import Billing from "../Wallet/Billing";

const Plan = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md h-screen">
      {/* Center Card */}
      <div className="w-full mx-auto bg-white rounded-2xl shadow-xl h-full overflow-y-auto">
        {/* <h2 className="text-2xl font-semibold mb-4 text-center">
          Your Plan Has Expired
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Please upgrade your plan to continue using the dashboard.
        </p> */}

        <Billing />
      </div>
    </div>
  );
};

export default Plan;
