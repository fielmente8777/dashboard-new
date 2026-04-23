const PricingCard = ({ plan }) => {

  const handleUpgrade = (id) => {
    // Implement upgrade logic here, e.g., redirect to checkout page
    alert(`Upgrading to ${plan.planName} plan with price ₹${plan.price} , plan id: ${id}`);
  }
  return (
    <div
      className={`p-8 rounded-2xl border text-center transition-all duration-300 ${
        plan.planName === "PRO"
          ? "border-blue-500 bg-primary shadow-lg scale-105"
          : "border-gray-200 bg-white hover:shadow-md"
      }`}
    >
      {plan.planName === "PRO" && (
        <span className="text-xs bg-ternary px-2 py-1 rounded-full text-white">
          Most Popular
        </span>
      )}

      <h3 className={`text-xl font-semibold ${plan.planName === "PRO" ? "text-ternary" : "text-primary"}  mt-4`}>
        {plan.planName}
      </h3>

      <p className={`${plan.planName === "PRO" ? "text-white" : "text-primary"} mt-2`}>
        {plan?.description || "Perfect for small hotels starting their journey toward direct bookings and digital growth."}
      </p>

      <h2 className={`text-3xl ${plan.planName === "PRO" ? "text-white" : "text-primary"}  mt-4 font-semibold`}>₹{plan.price}</h2>

      <button onClick={()=>handleUpgrade(plan._id)} className={`mt-8 w-full ${plan.planName === "PRO" ? "bg-ternary/90 hover:bg-ternary" : "bg-primary/90 hover:bg-primary"}  text-white py-3 rounded-lg   `}>
        {plan.button|| "Get Started"}
      </button>
    </div>
  );
};

export default PricingCard;