import { NEW_BASE_URL } from "../../../data/constant";

const PricingCard = ({ plan }) => {
  function loadRazorpay() {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
  const handleUpgrade = async (id) => {
    const isLoaded = await loadRazorpay();

    if (!isLoaded) {
      alert("Razorpay SDK failed to load");
      return;
    }
    // Implement upgrade logic here, e.g., redirect to checkout page
    alert(
      `Upgrading to ${plan.planName} plan with price ₹${plan.price} , plan id: ${id}`,
    );

    // create order

    try {
      const response = await fetch(
        `${NEW_BASE_URL}/api/v1/subscription/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ amount: plan.price, planId: id }),
        },
      );
      const order = await response.json();
      console.log("Order created:", order);

      // open razorpay checkout with order details
      const options = {
        key: "rzp_live_ShEPN150XB1irg", // Replace with your Razorpay API key
        amount: order?.result?.doc?.amount, // Amount in paise
        // currency: order.currency,
        currency: "INR",
        name: "Eazotel Technologies Pvt Ltd",
        description: plan.name,
        order_id: order?.result?.doc?.orderId,
        handler: async function (response) {
          // Handle successful payment here, e.g., verify payment and update subscription status
          await fetch(`${NEW_BASE_URL}/api/v1/subscription/verify-payment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ ...response, planId: id }),
          });

          alert("Payment successful");
          console.log("Payment successful:", response);
        },
        prefill: {
          name: "Customer Name",
          email: "customer@email.com",
        },
        theme: {
          color: "#152547",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };
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

      <h3
        className={`text-xl font-semibold ${plan.planName === "PRO" ? "text-ternary" : "text-primary"}  mt-4`}
      >
        {plan.planName}
      </h3>

      <p
        className={`${plan.planName === "PRO" ? "text-white" : "text-primary"} mt-2`}
      >
        {plan?.description ||
          "Perfect for small hotels starting their journey toward direct bookings and digital growth."}
      </p>

      <h2
        className={`text-3xl ${plan.planName === "PRO" ? "text-white" : "text-primary"}  mt-4 font-semibold`}
      >
        ₹{plan.price}
      </h2>

      <button
        onClick={() => handleUpgrade(plan._id)}
        className={`mt-8 w-full ${plan.planName === "PRO" ? "bg-ternary/90 hover:bg-ternary" : "bg-primary/90 hover:bg-primary"}  text-white py-3 rounded-lg   `}
      >
        {plan.button || "Get Started"}
      </button>
    </div>
  );
};

export default PricingCard;
