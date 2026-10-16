import { SiPaytm, SiPhonepe, SiRazorpay } from "react-icons/si";

export const PAGE_SIZE = 10;

// `available: false` shows the gateway as "Coming soon".
// The logo is a bundled brand icon drawn in the brand colour, so it never
// depends on an outside image host.
export const GATEWAYS = [
  {
    id: "Razorpay",
    name: "Razorpay",
    icon: SiRazorpay,
    color: "#3395FF",
    available: true,
  },
  {
    id: "PhonePe",
    name: "PhonePe",
    icon: SiPhonepe,
    color: "#5F259F",
    available: false,
  },
  {
    id: "Paytm",
    name: "Paytm",
    icon: SiPaytm,
    color: "#00BAF2",
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
