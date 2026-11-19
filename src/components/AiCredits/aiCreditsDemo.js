// IN PROGRESS: demo data for the AI credit pages, used only while gian has
// no /api/v1/ai-credits route (it answers 404). Copy of gian's
// services/aiCredits.demo.ts, same shapes and numbers. Delete this file once
// the real endpoints are live everywhere (see redux/api/aiCreditsApi.js).

const DAY = 24 * 60 * 60 * 1000;

// same numbers on every request, so the pages don't jump around on refresh
const seeded = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const isoDay = (daysAgo) =>
  new Date(Date.now() - daysAgo * DAY).toISOString().slice(0, 10);

const AI_SERVICES = [
  { id: 'chatbot', name: 'AI Chatbot', creditsPerUsage: 1, pricingType: 'per_conversation', status: 'active' },
  { id: 'agent', name: 'AI Agent', creditsPerUsage: 5, pricingType: 'per_run', status: 'active' },
  { id: 'lead_qualification', name: 'AI Lead Qualification', creditsPerUsage: 2, pricingType: 'per_request', status: 'active' },
  { id: 'content_generation', name: 'AI Content Generation', creditsPerUsage: 3, pricingType: 'per_1k_tokens', status: 'active' },
  { id: 'summarization', name: 'AI Summarization', creditsPerUsage: 1, pricingType: 'per_request', status: 'active' },
  { id: 'workflow_execution', name: 'AI Workflow Execution', creditsPerUsage: 4, pricingType: 'per_run', status: 'active' },
  { id: 'image_generation', name: 'AI Image Generation', creditsPerUsage: 10, pricingType: 'per_image', status: 'inactive' }
];

const CREDIT_PACKAGES = [
  { id: 'starter', name: 'Starter', credits: 1000, price: 999, currency: 'INR', status: 'active' },
  { id: 'growth', name: 'Growth', credits: 5000, price: 4499, currency: 'INR', status: 'active', popular: true },
  { id: 'business', name: 'Business', credits: 15000, price: 11999, currency: 'INR', status: 'active' },
  { id: 'enterprise', name: 'Enterprise', credits: 50000, price: 34999, currency: 'INR', status: 'active' }
];

const LOW_CREDIT_SETTINGS = {
  lowThreshold: 1000,
  criticalThreshold: 250,
  notificationsEnabled: true,
  channels: { email: true, inApp: true, whatsapp: false },
  notifyAdmins: true
};

const TENANT_NAMES = [
  'Aroha Palms', 'Wabi Sabi Resort', 'Green Castle', 'Bluelake Retreat', 'Ivara Resorts',
  'The Acacia Hotels', 'Saraaya Stays', 'Alpha Wellness', 'AM Hospitality', 'Royalistiq',
  'Naturoville', 'Fielmente', 'Humrahi Travels', 'Baliye Couture', 'Gian Suites',
  'Coral Bay Inn', 'Hilltop Haven', 'Lotus Courtyard', 'Silver Oak Lodge', 'Monsoon Villas',
  'Pinecrest Cottages', 'Riverbend Hotel', 'Sunset Sands', 'Kesar Heritage'
];

const buildTenants = () => {
  const random = seeded(42);
  return TENANT_NAMES.map((name, index) => {
    const totalPurchased = [1000, 5000, 15000, 50000][Math.floor(random() * 4)] * (1 + Math.floor(random() * 3));
    // a few tenants are nearly out, one is empty and one is suspended
    const usedShare = index % 7 === 3 ? 1 : index % 5 === 1 ? 0.97 : 0.2 + random() * 0.6;
    const totalUsed = Math.round(totalPurchased * usedShare);
    return {
      tenantId: `TEN-${String(1001 + index)}`,
      name,
      availableCredits: totalPurchased - totalUsed,
      totalPurchased,
      totalUsed,
      lastRecharge: isoDay(Math.floor(random() * 60) + 1),
      walletStatus: index === 10 ? 'suspended' : 'active'
    };
  });
};

const buildAdminOverview = () => {
  const tenants = buildTenants();
  const sold = tenants.reduce((sum, t) => sum + t.totalPurchased, 0);
  const used = tenants.reduce((sum, t) => sum + t.totalUsed, 0);
  return {
    totalCreditsSold: sold,
    totalCreditsUsed: used,
    totalAvailableCredits: sold - used,
    // demo rate: the Growth package price per credit
    totalRechargeRevenue: Math.round(sold * 0.9),
    currency: 'INR',
    activeWallets: tenants.filter((t) => t.walletStatus === 'active').length,
    lowCreditTenants: tenants.filter((t) => t.availableCredits < LOW_CREDIT_SETTINGS.lowThreshold).length
  };
};

const DESCRIPTIONS = {
  chatbot: ['Website chat conversation', 'WhatsApp auto-reply', 'Eazbot guest query'],
  agent: ['Booking assistant run', 'Follow-up agent run'],
  lead_qualification: ['Scored new Meta lead', 'Scored webform enquiry'],
  content_generation: ['Offer description draft', 'Blog post draft', 'Campaign copy'],
  summarization: ['Call recording summary', 'Chat thread summary'],
  workflow_execution: ['Lead nurture workflow', 'Review reply workflow'],
  image_generation: ['Offer banner image']
};

const buildWallet = () => {
  const random = seeded(7);

  // 90 days of usage per service, newest last
  const daily = Array.from({ length: 90 }, (_, i) => {
    const daysAgo = 89 - i;
    const weekend = [0, 6].includes(new Date(Date.now() - daysAgo * DAY).getDay());
    return { date: isoDay(daysAgo), credits: Math.round((weekend ? 120 : 90) + random() * 70) };
  });

  const activeServices = AI_SERVICES.filter((s) => s.status === 'active');
  const usage = Array.from({ length: 40 }, (_, i) => {
    const service = activeServices[Math.floor(random() * activeServices.length)];
    const options = DESCRIPTIONS[service.id];
    return {
      id: `USG-${String(5400 - i)}`,
      date: new Date(Date.now() - i * 0.6 * DAY - random() * DAY / 2).toISOString(),
      service: service.name,
      description: options[Math.floor(random() * options.length)],
      creditsUsed: service.creditsPerUsage * (1 + Math.floor(random() * 4)),
      status: random() > 0.94 ? 'failed' : 'completed'
    };
  });

  // built oldest first from an opening balance, so every balanceAfter adds up;
  // the Starter recharges (positions below) keep the wallet afloat
  const RECHARGES = [2, 9, 16, 22];
  const OTHER_TYPES = ['deduction', 'deduction', 'deduction', 'deduction', 'refund', 'adjustment'];
  const starter = CREDIT_PACKAGES[0];
  let running = 300;
  let totalPurchased = 0;
  const transactions = Array.from({ length: 30 }, (_, i) => {
    const type = RECHARGES.includes(i) ? 'purchase' : OTHER_TYPES[Math.floor(random() * OTHER_TYPES.length)];
    const credits =
      type === 'purchase' ? starter.credits
        : type === 'deduction' ? -Math.round(240 + random() * 160)
          : type === 'refund' ? Math.round(5 + random() * 20)
            : Math.round(random() * 60) - 20;
    running = Math.max(0, running + credits);
    if (type === 'purchase') totalPurchased += credits;
    return {
      id: `TXN-${String(88181 + i)}`,
      date: new Date(Date.now() - (29 - i) * 2.3 * DAY).toISOString(),
      type,
      description:
        type === 'purchase' ? `${starter.name} package recharge`
          : type === 'deduction' ? 'AI usage (daily total)'
            : type === 'refund' ? 'Refund for failed AI request'
              : 'Manual adjustment by Eazotel support',
      credits,
      balanceAfter: running,
      status: 'completed'
    };
  }).reverse();

  const balance = transactions[0].balanceAfter;
  return {
    wallet: {
      availableCredits: balance,
      totalPurchased,
      totalConsumed: Math.max(0, totalPurchased + 300 - balance),
      lastRecharge: transactions.find((t) => t.type === 'purchase')?.date ?? null
    },
    thresholds: {
      low: LOW_CREDIT_SETTINGS.lowThreshold,
      critical: LOW_CREDIT_SETTINGS.criticalThreshold
    },
    dailyUsage: daily,
    usage,
    packages: CREDIT_PACKAGES.filter((p) => p.status === 'active'),
    transactions
  };
};

// What gian's GET /ai-credits/admin returns in `result`
export const demoAdminAiCredits = () => ({
  inProgress: true,
  overview: buildAdminOverview(),
  tenants: buildTenants(),
  pricing: AI_SERVICES,
  packages: CREDIT_PACKAGES,
  lowCreditSettings: LOW_CREDIT_SETTINGS,
});

// What gian's GET /ai-credits/wallet returns in `result`
export const demoAiWallet = () => ({ inProgress: true, ...buildWallet() });
