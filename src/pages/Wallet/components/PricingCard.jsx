const PricingCard = ({ plan }) => {
  return (
    <div
      className={`p-8 rounded-2xl border text-center transition-all duration-300 ${
        plan.highlight
          ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
          : "border-gray-200 bg-white hover:shadow-md"
      }`}
    >
      {plan.highlight && (
        <span className="text-xs bg-blue-600 px-2 py-1 rounded-full text-white">
          Most Popular
        </span>
      )}

      <h3 className="text-xl font-semibold text-gray-900 mt-4">
        {plan.name}
      </h3>

      <p className="text-gray-500 mt-2">{plan.description}</p>

      <h2 className="text-3xl text-gray-900 mt-4">{plan.price}</h2>

      <button className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
        {plan.button}
      </button>
    </div>
  );
};

export default PricingCard;