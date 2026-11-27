import { useEffect, useMemo, useState } from "react";
import {
  getTemplateDefaults,
  isTemplateFilled,
} from "../../../components/WhatsApp/templateValues";
import { useApiAction } from "../../../hooks/useApiAction";
import { hasTenant, useTenant } from "../../../hooks/useTenant";
import { useCreateCampaignMutation, useGetCampaignLimitsQuery } from "../../../redux/api/broadcastApi";
import { useGetWhatsAppTemplatesQuery } from "../../../redux/api/callsApi";
import { useGetTradeAccessQuery, useGetTradeFacetsQuery } from "../../../redux/api/tradeDirectoryApi";
import {
  useGetCampaignAudienceQuery,
  useGetCampaignSourcesQuery,
  useGetTradeWhatsappAudienceQuery,
} from "../../../redux/api/whatsappApi";
import {
  DAILY_SEND_LIMIT,
  PRICE_PER_MESSAGE,
  buildCampaignTemplate,
  estimateDuration,
} from "../broadcastUtils";

const EMPTY_VALUES = { body: [], header: [] };

// gian rejects imports larger than this (campaignController.createCampaign)
export const MAX_IMPORTED_RECIPIENTS = 10000;

const isApproved = (template) =>
  !template.status || template.status.toUpperCase() === "APPROVED";

const toggle = (list, value) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

/**
 * Everything the "New WhatsApp campaign" pop-up needs. Everything goes from the hotel's OWN
 * WhatsApp number with its own template, through gian (owner, 2026-11-26). Audiences, together
 * and de-duplicated by gian; only people with a WhatsApp number ever count:
 *   - crm       the hotel's guests & leads, from every source or the ticked ones
 *   - imported  numbers from an Excel / CSV file (WhatsApp page → Import contacts)
 *   - trade     Trade Directory partners with a mobile: the hotel's own trade contacts, Eazotel's
 *               directory (with approved access) or both; gian reads the numbers itself
 */
export const useCreateCampaign = ({
  open,
  onCreated,
  importedContacts = [],
  campaignMode = "default",
}) => {
  const tenant = useTenant();
  const run = useApiAction();
  const skip = !open || !hasTenant(tenant);
  const hasImported = importedContacts.length > 0;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("marketing");
  const [template, setTemplate] = useState(null);
  const [values, setValues] = useState(EMPTY_VALUES);

  const [crm, setCrm] = useState(true);
  const [sources, setSources] = useState([]); // none = every source
  const [useImported, setUseImported] = useState(false);
  const [trade, setTrade] = useState(false);
  const [tradePool, setTradePool] = useState("mine");
  const [tradeSegments, setTradeSegments] = useState([]);

  // fresh each time it opens; an imported file starts as the audience
  useEffect(() => {
    if (!open) return;
    setName("");
    setCategory("marketing");
    setTemplate(null);
    setValues(EMPTY_VALUES);
    setSources([]);
    setCrm(!hasImported);
    setUseImported(hasImported);
    setTrade(false);
    setTradePool("mine");
    setTradeSegments([]);
  }, [open, hasImported, campaignMode]);

  /* ── the hotel's WhatsApp (gian) ── */
  const templatesQuery = useGetWhatsAppTemplatesQuery(tenant.hid, { skip });
  const templates = useMemo(
    () => (templatesQuery.data || []).filter((t) => isApproved(t) && t.category?.toLowerCase() === category),
    [templatesQuery.data, category],
  );
  const sourcesQuery = useGetCampaignSourcesQuery(tenant.hid, { skip });
  const crmQuery = useGetCampaignAudienceQuery({ hid: tenant.hid, sources }, { skip: skip || !crm });
  const crmCount = crmQuery.data || 0;
  // Meta's 24-hour limit for this number, what is used, the pace, the caps, rates and wallet
  const limitsQuery = useGetCampaignLimitsQuery(tenant.hid, { skip });
  const limits = limitsQuery.data;
  const maxRecipients = limits?.maxRecipients || MAX_IMPORTED_RECIPIENTS;

  /* ── Trade Directory partners: categories from the data (gian-new), the count from gian ── */
  const access = useGetTradeAccessQuery(undefined, { skip });
  const approved = access.data?.status === "approved";
  const tradeFacets = useGetTradeFacetsQuery(tradePool, { skip: skip || (tradePool !== "mine" && !approved) });
  const tradeQuery = useGetTradeWhatsappAudienceQuery(
    { hid: tenant.hid, pool: tradePool, segments: tradeSegments },
    { skip: skip || !trade || (tradePool !== "mine" && !approved) },
  );
  const tradeCount = trade ? tradeQuery.data?.reachable || 0 : 0;

  const [createCampaign, { isLoading: creating }] = useCreateCampaignMutation();

  /* ── totals ── */
  const audienceLoading = (crm && crmQuery.isFetching) || (trade && tradeQuery.isFetching);
  const importedCount = useImported ? importedContacts.length : 0;
  // gian removes numbers that are in more than one list, so this is an upper bound
  const audience = (crm ? crmCount : 0) + importedCount + tradeCount;
  // ₹ from the property's WhatsApp wallet, at Meta's rate for the template category
  const rates = limits?.rates || PRICE_PER_MESSAGE;
  const perMessage = rates[category] ?? PRICE_PER_MESSAGE[category] ?? 0;
  const cost = Math.round(audience * perMessage * 100) / 100;
  const walletBalance = limits?.walletBalance;
  const walletShort = walletBalance != null && cost > walletBalance;
  // more than this number may message in a day: it goes out over several days (gian plans it)
  const dailyLimit = limits?.dailyLimit ?? DAILY_SEND_LIMIT;
  const overLimit = dailyLimit !== -1 && audience > Math.floor(dailyLimit * 0.9);
  const duration = estimateDuration(audience, limits);
  const busy = limits && limits.activeCampaigns >= limits.maxActiveCampaigns;

  const missing = !name.trim()
    ? "Give the campaign a name"
    : !crm && !useImported && !trade
      ? "Choose who gets it"
      : !template
        ? "Choose a template"
        : !isTemplateFilled(values)
          ? "Fill in every template value"
          : busy
            ? `${limits.activeCampaigns} campaigns are still sending. Wait for one to finish.`
            : null;
  const blocked =
    missing ||
    (audienceLoading
      ? "Counting…"
      : audience === 0
        ? "No one with a WhatsApp number matches"
        : audience > maxRecipients
          ? `Over ${maxRecipients.toLocaleString("en-IN")} people: pick fewer and send the rest in another campaign`
          : walletShort
            ? `Costs ₹${cost.toLocaleString("en-IN")}; your WhatsApp wallet has ₹${walletBalance.toLocaleString("en-IN")}. Recharge it first.`
            : null);

  const submit = async () => {
    if (blocked) return;
    const recipients = useImported ? importedContacts.map((c) => ({ name: c.name || "", phone: c.phone })) : [];
    const payload = {
      hid: tenant.hid,
      campaignName: name.trim(),
      template: buildCampaignTemplate(template, values),
      ...(crm && sources.length ? { sources } : {}),
      ...(trade ? { trade: { pool: tradePool, segments: tradeSegments } } : {}),
    };
    if (recipients.length) payload.recipients = recipients;
    // gian adds guests & leads to imported numbers or trade partners only when this is true
    if (recipients.length || trade) payload.includeCrm = crm;

    const created = await run(createCampaign(payload), { success: "Campaign created" });
    if (created) onCreated?.();
  };

  return {
    name,
    setName,
    // message
    category,
    changeCategory: (value) => {
      setCategory(value);
      setTemplate(null);
      setValues(EMPTY_VALUES);
    },
    templates,
    templatesLoading: templatesQuery.isLoading,
    template,
    chooseTemplate: (value) => {
      setTemplate(value);
      setValues(getTemplateDefaults(value));
    },
    values,
    setValues,
    // audiences
    crm,
    setCrm,
    sources,
    toggleSource: (s) => setSources((now) => toggle(now, s)),
    clearSources: () => setSources([]),
    sourceList: sourcesQuery.data?.sources || [],
    sourcesLoading: sourcesQuery.isLoading,
    crmTotal: sourcesQuery.data?.total || 0,
    crmCount,
    hasImported,
    importedCount: importedContacts.length,
    useImported,
    setUseImported,
    trade,
    setTrade,
    approved,
    tradePool,
    setTradePool: (p) => {
      setTradePool(p);
      setTradeSegments([]);
    },
    tradeSegments,
    toggleTradeSegment: (s) => setTradeSegments((now) => toggle(now, s)),
    clearTradeSegments: () => setTradeSegments([]),
    tradeFacets: tradeFacets.data,
    tradeAvailable: !tradeFacets.isError,
    tradeCount,
    // totals
    audience,
    audienceLoading,
    cost,
    perMessage,
    walletBalance,
    walletShort,
    overLimit,
    dailyLimit,
    duration,
    limitsKnown: Boolean(limits),
    missing: blocked,
    creating,
    submit,
  };
};
