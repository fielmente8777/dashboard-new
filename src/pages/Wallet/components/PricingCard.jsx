const PricingCard = ({ plan }) => {
  return (
    <div
      className={`p-8 rounded-2xl border text-center transition-all duration-300 ${
        plan.highlight
          ? "border-blue-500 bg-primary shadow-lg scale-105"
          : "border-gray-200 bg-white hover:shadow-md"
      }`}
    >
      {plan.highlight && (
        <span className="text-xs bg-ternary px-2 py-1 rounded-full text-white">
          Most Popular
        </span>
      )}

      <h3 className={`text-xl font-semibold ${plan.id===2?"text-ternary":"text-primary"}  mt-4`}>
        {plan.name}
      </h3>

      <p className={`${plan.id===2?"text-white":"text-primary"} mt-2`}>{plan.description}</p>

      <h2 className={`text-3xl ${plan.id===2?"text-white":"text-primary"}  mt-4 font-semibold`}>{plan.price}</h2>

      <button className={`mt-8 w-full ${plan.id===2?"bg-ternary/90 hover:bg-ternary":"bg-primary/90 hover:bg-primary"}  text-white py-3 rounded-lg   `}>
        {plan.button}
      </button>
    </div>
  );
};

export default PricingCard;