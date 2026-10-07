// TEMP: dummy data until the backend sends `accountDetails.billing`.
// Keep this exact shape on the backend so the UI needs no changes later.
//
// Notes for backend:
// - wallet.*        -> lifetime wallet numbers (all recharges / all deductions)
// - cycle / usage   -> current calendar month only (Meta resets the free tier monthly)
// - freeTier        -> 1,000 free SERVICE messages per number per month
//                      (utility messages are NOT covered by the free tier)
// - rates           -> per-message price for India in `currency`; pull from your
//                      own pricing config, don't hardcode in the UI
// - All money values are plain numbers (not paise, not strings)

export const DUMMY_WHATSAPP_BILLING = {
  currency: "INR",

  wallet: {
    balance: 1842.35, // totalLoaded - totalUsed
    totalLoaded: 3000,
    totalUsed: 1157.65,
    lowBalanceThreshold: 200,
    lastRechargeAt: "2026-09-18T09:12:00.000Z",
  },

  cycle: {
    label: "October 2026",
    startDate: "2026-10-01T00:00:00.000Z",
    endDate: "2026-10-31T23:59:59.999Z",
  },

  freeTier: {
    serviceLimit: 1000,
    serviceUsed: 642,
  },

  usage: {
    marketing: { count: 1240, cost: 972.9 },
    utility: { count: 860, cost: 98.9 }, // incl. utility sent inside the 24-hr window
    authentication: { count: 120, cost: 13.8 },
    service: { count: 642, billableCount: 0, cost: 0 }, // billableCount = count beyond free tier
  },

  // Placeholder rates — confirm marketing/utility/authentication against Meta's rate sheet
  rates: {
    marketing: 0.7846,
    utility: 0.115,
    authentication: 0.115,
    service: 0.145,
  },

  recentTransactions: [
    {
      id: "txn_002",
      type: "CREDIT", // CREDIT | DEBIT | REFUND
      amount: 2000,
      note: "Wallet recharge",
      createdAt: "2026-09-18T09:12:00.000Z",
    },
    {
      id: "txn_001",
      type: "CREDIT",
      amount: 1000,
      note: "Wallet recharge",
      createdAt: "2026-09-01T11:40:00.000Z",
    },
  ],
};
