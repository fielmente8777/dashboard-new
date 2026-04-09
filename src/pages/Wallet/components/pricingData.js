export const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "Perfect for small hotels starting their journey toward direct bookings and digital growth.",
    button: "Get Started",
  },
  {
    name: "Growth",
    price: "$49",
    description: "For hotels ready to scale direct bookings and reduce OTA commissions.",
    button: "Start Growing",
    highlight: true,
  },
  {
    name: "Elite",
    price: "Custom",
    description: "Full-service growth solution for hotels that want to maximize direct bookings.",
    button: "Talk to Sales",
  },
];

export const features = [
  { name: "Guest inquiry automation", Starter: true, Growth: true, Elite: true },
  { name: "Website chat widget", Starter: true, Growth: true, Elite: true },
  { name: "Instagram & Messenger automation", Starter: true, Growth: true, Elite: true },
  { name: "WhatsApp automation", Starter: false, Growth: true, Elite: true },
  { name: "Email automation", Starter: false, Growth: true, Elite: true },
  { name: "Advanced guest segmentation", Starter: false, Growth: true, Elite: true },
  { name: "Booking engine integrations", Starter: false, Growth: true, Elite: true },
  { name: "Analytics dashboard", Starter: false, Growth: true, Elite: true },
  { name: "Dedicated onboarding", Starter: false, Growth: false, Elite: true },
  { name: "Strategy consultation", Starter: false, Growth: false, Elite: true },
  { name: "Priority support", Starter: false, Growth: false, Elite: true },
];