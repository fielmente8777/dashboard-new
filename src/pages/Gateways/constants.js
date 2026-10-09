export const PAGE_SIZE = 10;

// `available: false` shows the gateway as "Coming soon"
export const GATEWAYS = [
  {
    id: "Razorpay",
    name: "Razorpay",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOTyQr77jTaet0ai9jeKErezXc7uqzGDKIhQ&s",
    available: true,
  },
  {
    id: "PhonePe",
    name: "PhonePe",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/2560px-PhonePe_Logo.svg.png",
    available: false,
  },
  {
    id: "Paytm",
    name: "Paytm",
    logo: "https://pwebassets.paytm.com/commonwebassets/ir/images/press-kit/brand.png",
    logoBackground: "#00296F",
    available: false,
  },
];

// Razorpay payment status -> label and Badge tone
export const PAYMENT_STATUS = {
  captured: { label: "Paid", tone: "green" },
  authorized: { label: "Authorized", tone: "blue" },
  created: { label: "Pending", tone: "amber" },
  pending: { label: "Pending", tone: "amber" },
  refunded: { label: "Refunded", tone: "sky" },
  failed: { label: "Failed", tone: "red" },
};
