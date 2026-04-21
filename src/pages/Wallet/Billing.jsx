import React from "react";
import FeatureTable from "./components/FeatureTable";
import PricingCard from "./components/PricingCard";
import { features, plans } from "./components/pricingData";

const Billing = () => {
  return (
    // <div>Billing</div>
    <div className="py-16 px-4 w-full">
      <div className="w-full">
        <h1 className="text-2xl font-semibold text-center text-gray-900  m-0">
          Choose the Right Growth{" "}
          <span className="block">Plan for Your Hotel</span>
        </h1>
        <p className="text-sm text-gray-500 text-center mb-12 mt-3">
          Increase direct bookings, reduce OTA commissions, and grow your
          hotel's online revenue with Eazotel’s smart marketing and automation
          tools.
        </p>
        <div className="bg-white rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {plans.map((plan, index) => (
              <PricingCard key={index} plan={plan} />
            ))}
          </div>
          {/* <div className="mt-20 bg-white rounded-2xl shadow-md p-8"> */}
          <FeatureTable features={features} />
        </div>
      </div>
    </div>
  );
};

export default Billing;
