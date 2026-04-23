import React, { useEffect, useState } from "react";
import FeatureTable from "./components/FeatureTable";
import PricingCard from "./components/PricingCard";
import { features } from "./components/pricingData";
import { NEW_BASE_URL } from "../../data/constant";
import axios from "axios";

const Billing = () => {
  const [plans, setPlans] =useState([]);

   const fetchPlans = async () => {
      try {
        const response = await axios.get(`${NEW_BASE_URL}/api/v1/subscription/plans`);
        const data = response.data;
        setPlans(data?.result?.data); // Assuming the API returns an object with a 'plans' array
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    };
  useEffect(() => {
    fetchPlans();
  }, []);
  return (
    // <div>Billing</div>
    <div className="py-16 max-md:px-4 max-w-7xl  mx-auto ">
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
            {plans.slice(1, 4).map((plan, index) => (
              <PricingCard key={index+1} plan={plan} />
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
