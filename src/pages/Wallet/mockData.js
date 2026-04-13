//for cards
export const cardsMock = [
  {
    title: "AI Credits",
    value: 2870,
    used: 2130,
    total: 5000,
    color: "bg-blue-500",
  },
  {
    title: "WhatsApp",
    value: 340,
    used: 1660,
    total: 2000,
    color: "bg-green-500",
  },
  {
    title: "Email",
    value: 4540,
    used: 5460,
    total: 10000,
    color: "bg-yellow-500",
  },
  {
    title: "Campaigns",
    value: 18,
    used: 32,
    total: 50,
    color: "bg-purple-500",
  },
];


// for chart
export const chartMock = [
  { date: "Apr 1", ai: 20, whatsapp: 10, email: 50 },
  { date: "Apr 2", ai: 30, whatsapp: 15, email: 40 },
  { date: "Apr 3", ai: 25, whatsapp: 20, email: 60 },
];


// for pie chart
export const pieMock = [
  { name: "AI Credits", value: 1130 },
  { name: "WhatsApp", value: 660 },
  { name: "Email", value: 1180 },
  { name: "Campaigns", value: 450 },
];


// for activity table
export const activityMock = [
  {
    id: 1,
    date: "Apr 10, 2026",
    service: "AI",
    action: "Auto Reply",
    credits: -20,
    status: "Completed",
  },
  {
    id: 2,
    date: "Apr 2, 2026",
    service: "WhatsApp",
    action: "Campaign Sent",
    credits: 15,
    status: "Completed",
  },
  {
    id: 3,
    date: "Apr 3, 2026",
    service: "Email",
    action: "API Call",
    credits: -118,
    status: "Pending",
  },
];


// for template usage
export const templateMockData = {
  whatsapp_template_usage: {
    summary: {
      total_templates_sent: 120,
      total_delivered: 100,
      total_failed: 20,
    },
    categories: {
      utility: {
        templates_sent: 50,
        delivered: 45,
        failed: 5,
        templates: [
          {
            template_name: "order_confirmation",
            sent: 30,
            delivered: 28,
            failed: 2,
          },
          {
            template_name: "payment_reminder",
            sent: 20,
            delivered: 17,
            failed: 3,
          },
        ],
      },
      marketing: {
        templates_sent: 40,
        delivered: 35,
        failed: 5,
        templates: [
          {
            template_name: "promo_offer",
            sent: 25,
            delivered: 22,
            failed: 3,
          },
          {
            template_name: "festival_campaign",
            sent: 15,
            delivered: 13,
            failed: 2,
          },
        ],
      },
      authentication: {
        templates_sent: 30,
        delivered: 20,
        failed: 10,
        templates: [
          {
            template_name: "otp_verification",
            sent: 30,
            delivered: 20,
            failed: 10,
          },
        ],
      },
    },
  },
};