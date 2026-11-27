import { request, run, selectedHid } from "../request";
import store from "../Store";
import { baseApi, getApiErrorMessage } from "./baseApi";

const NODE = { service: "node" };
const BASE = "/api/v1/email-marketing";
// AI generation can take 20-60s
const GENERATE_TIMEOUT_MS = 120000;
// rebuilding a whole uploaded design for phones: up to ~3 minutes
const MOBILE_TIMEOUT_MS = 200000;

// Email marketing (gian: /api/v1/email-marketing). Every endpoint takes the
// hid of the selected location; the functions below fill it in.
export const emailMarketingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEmailQuota: build.query({
      query: ({ hid }) => ({ url: `${BASE}/quota`, params: { hid } }),
      extraOptions: NODE,
    }),
    // next 50 server replies older than `before` -> { result: { items, hasMore, nextBefore } }
    getEmailQuotaReplies: build.query({
      query: ({ hid, before, source }) => ({ url: `${BASE}/quota/replies`, params: { hid, before, source } }),
      extraOptions: NODE,
      keepUnusedDataFor: 0,
    }),
    // --- recipients ---
    // { hid, page, limit, search } -> { result: { docs, pagination } }
    getEmailRecipients: build.query({
      query: ({ hid, page, limit, search }) => ({
        url: `${BASE}/recipients`,
        params: { hid, page, limit, ...(search && { search }) },
      }),
      extraOptions: NODE,
    }),

    // { hid, leadIds } - a batch from the selected leads
    createLeadRecipientBatch: build.mutation({
      query: (body) => ({ url: `${BASE}/recipient-batches/leads`, method: "POST", body }),
      extraOptions: NODE,
    }),

    // { hid, search } - a batch from every lead matching the search
    createLeadRecipientBatchFromFilter: build.mutation({
      query: (body) => ({ url: `${BASE}/recipient-batches/leads/all`, method: "POST", body }),
      extraOptions: NODE,
    }),

    // { hid, emails }
    createManualRecipientBatch: build.mutation({
      query: (body) => ({ url: `${BASE}/recipient-batches/manual`, method: "POST", body }),
      extraOptions: NODE,
    }),

    // { emails } -> { checked, ok, undeliverable, risky, problems: [{ email, verdict, suggestion }] }
    // verdict: typo | no_domain | syntax (will bounce), disposable | unknown (kept)
    checkEmails: build.mutation({
      query: (body) => ({ url: `${BASE}/check-emails`, method: "POST", body }),
      extraOptions: NODE,
    }),

    // --- campaigns ---
    // FormData: hid, name, subject, html, text, fromName, fromEmail,
    // recipientBatchIds (JSON), attachments
    createEmailCampaign: build.mutation({
      query: (form) => ({ url: `${BASE}/campaigns`, method: "POST", body: form }),
      extraOptions: NODE,
    }),

    // { hid, page, limit }
    getEmailCampaigns: build.query({
      query: (params) => ({ url: `${BASE}/campaigns`, params }),
      extraOptions: NODE,
    }),

    // { hid, campaignId }
    // { hid, campaignId, recipientId? } -> { result: { from, html, recipient } }
    // the sent email as guests got it (footer, inert unsubscribe link) and who it really went out as
    getCampaignMessage: build.query({
      query: ({ hid, campaignId, recipientId }) => ({
        url: `${BASE}/campaigns/${campaignId}/message`,
        params: { hid, ...(recipientId && { recipientId }) },
      }),
      extraOptions: NODE,
      keepUnusedDataFor: 0,
    }),
    // { hid, from, to } (ISO) -> { result: { total, senders: [{ via, email, name, source, sent, failed, campaigns }], sentBy } }
    // { hid, from, to, tz } -> { result: { current, previous, unit: 'day'|'hour', buckets: [{ key, sent, opened, clicked }] } }
    getEmailPerformance: build.query({
      query: ({ hid, from, to, tz }) => ({ url: `${BASE}/performance`, params: { hid, from, to, tz } }),
      extraOptions: NODE,
      keepUnusedDataFor: 0,
    }),
    // { hid, campaignId, tz } -> { result: { totals, firstSentAt, average, unit, buckets: [{ key, opened, clicked }], failures: [{ error, count }] } }
    getCampaignReport: build.query({
      query: ({ hid, campaignId, tz }) => ({ url: `${BASE}/campaigns/${campaignId}/report`, params: { hid, tz } }),
      extraOptions: NODE,
      keepUnusedDataFor: 0,
    }),
    // deliverability: Amazon's result of each email, sender health, wrong addresses
    startAmazonSync: build.mutation({
      query: ({ hid, campaignId }) => ({ url: `${BASE}/campaigns/${campaignId}/amazon-sync`, method: "POST", params: { hid } }),
      extraOptions: NODE,
    }),
    getSenderHealth: build.query({
      query: ({ hid, fresh }) => ({ url: `${BASE}/sender-health`, params: { hid, ...(fresh && { fresh: 1 }) } }),
      extraOptions: NODE,
      keepUnusedDataFor: 0,
    }),
    getWrongEmails: build.query({
      query: ({ page, limit, search, kind }) => ({ url: `${BASE}/wrong-emails`, params: { page, limit, ...(search && { search }), ...(kind && { kind }) } }),
      extraOptions: NODE,
      keepUnusedDataFor: 0,
    }),
    deleteWrongEmails: build.mutation({
      query: (body) => ({ url: `${BASE}/wrong-emails/delete`, method: "POST", body }),
      extraOptions: NODE,
    }),
    getSentSummary: build.query({
      query: ({ hid, from, to }) => ({ url: `${BASE}/sent-summary`, params: { hid, from, to } }),
      extraOptions: NODE,
      keepUnusedDataFor: 0,
    }),
    getEmailCampaign: build.query({
      query: ({ hid, campaignId }) => ({ url: `${BASE}/campaigns/${campaignId}`, params: { hid } }),
      extraOptions: NODE,
    }),

    // { hid, campaignId, status, page, limit }
    getCampaignRecipients: build.query({
      query: ({ hid, campaignId, status, page, limit, search }) => ({
        url: `${BASE}/campaigns/${campaignId}/recipients`,
        params: { hid, page, limit, ...(status && { status }), ...(search && { search }) },
      }),
      extraOptions: NODE,
    }),

    // { hid, campaignId }
    sendEmailCampaign: build.mutation({
      query: ({ hid, campaignId }) => ({
        url: `${BASE}/campaigns/${campaignId}/send`,
        method: "POST",
        body: { hid },
      }),
      extraOptions: NODE,
    }),

    // --- footer + final email (gian services/emailDesign) ---
    // { hid, hotelName } -> { result: { footer | null, defaults, html } }
    getEmailFooter: build.query({
      query: ({ hid, hotelName }) => ({ url: `${BASE}/footer`, params: { hid, hotelName } }),
      extraOptions: NODE,
    }),
    // { hid, hotelName, footer } -> { result: { footer, html } }
    saveEmailFooter: build.mutation({
      query: ({ hid, hotelName, footer }) => ({
        url: `${BASE}/footer`,
        method: "PUT",
        params: { hid },
        body: { hid, hotelName, footer },
      }),
      extraOptions: NODE,
    }),
    // { hid }
    deleteEmailFooter: build.mutation({
      query: ({ hid }) => ({ url: `${BASE}/footer`, method: "DELETE", params: { hid } }),
      extraOptions: NODE,
    }),
    // { hid, body: { html, previewText, hotelName, footer? } } -> { result: { html } }
    // the exact email guests get: optimized for every device + footer
    renderEmail: build.mutation({
      query: ({ hid, body }) => ({ url: `${BASE}/render`, method: "POST", params: { hid }, body: { hid, ...body } }),
      extraOptions: NODE,
    }),

    // { hid, campaignId } -> { result: { status, pauseReason, stuck, pending, failedRetryable, failedPermanent, canRetry } }
    getCampaignDelivery: build.query({
      query: ({ hid, campaignId }) => ({ url: `${BASE}/campaigns/${campaignId}/delivery`, params: { hid } }),
      extraOptions: NODE,
    }),

    // { hid, campaignId } - resend failed (not bounced/invalid) + continue the unsent
    stopEmailCampaign: build.mutation({
      query: ({ hid, campaignId }) => ({ url: `${BASE}/campaigns/${campaignId}/stop`, method: "POST", body: { hid } }),
      extraOptions: NODE,
    }),
    // { hid, campaignId } - removes the campaign with its recipients (409 while it is still sending)
    deleteEmailCampaign: build.mutation({
      query: ({ hid, campaignId }) => ({ url: `${BASE}/campaigns/${campaignId}`, method: "DELETE", params: { hid } }),
      extraOptions: NODE,
    }),
    // { hid, campaignId } -> { result: { doc: { wrong: [{ email, name, reason, removed }], otherFailed, total } } }
    getBadAddresses: build.query({
      query: ({ hid, campaignId }) => ({ url: `${BASE}/campaigns/${campaignId}/bad-addresses`, params: { hid } }),
      extraOptions: NODE,
      keepUnusedDataFor: 0,
    }),
    // { hid, campaignId } - puts the campaign's wrong addresses on the do-not-email list
    removeBadAddresses: build.mutation({
      query: ({ hid, campaignId }) => ({ url: `${BASE}/campaigns/${campaignId}/bad-addresses/remove`, method: "POST", body: { hid } }),
      extraOptions: NODE,
    }),
    retryEmailCampaign: build.mutation({
      query: ({ hid, campaignId }) => ({
        url: `${BASE}/campaigns/${campaignId}/retry`,
        method: "POST",
        params: { hid },
        body: { hid },
      }),
      extraOptions: NODE,
    }),

    // "Who gets this email?": groups + people who opened / clicked earlier emails, ticked together
    // { hid } -> { result: { doc: { newsletter: { subscribed, groups: [{ name, subscribed }] }, campaigns: [{ _id, subject, sentAt, opened, clicked }] } } }
    getAudienceOptions: build.query({
      query: ({ hid }) => ({ url: `${BASE}/audience/options`, params: { hid } }),
      extraOptions: NODE,
      keepUnusedDataFor: 0,
    }),
    // { hid, everyone, groups, engaged: [{ campaignId, group }] } -> { result: { doc: { count, unsubscribed } } }
    previewAudience: build.mutation({
      query: ({ hid, ...body }) => ({ url: `${BASE}/audience/preview`, method: "POST", body: { hid, ...body } }),
      extraOptions: NODE,
    }),
    // Trade Directory partners (gian reads them; addresses never come back):
    // { hid, pool: mine | directory | both, segments?, ids? } -> { doc: { reachable, capped } }
    previewTradeAudience: build.mutation({
      query: ({ hid, ...body }) => ({ url: `${BASE}/trade/preview`, method: "POST", body: { hid, ...body } }),
      extraOptions: NODE,
    }),
    // same body -> { doc: { recipientBatchId, count, label } }
    createTradeRecipientBatch: build.mutation({
      query: ({ hid, ...body }) => ({ url: `${BASE}/recipient-batches/trade`, method: "POST", body: { hid, ...body } }),
      extraOptions: NODE,
    }),
    // same body -> { result: { doc: { recipientBatchId, count, label, emails } } }
    createAudienceBatch: build.mutation({
      query: ({ hid, ...body }) => ({ url: `${BASE}/audience/batch`, method: "POST", body: { hid, ...body } }),
      extraOptions: NODE,
    }),
    // the people who opened / clicked a sent campaign (gian services/campaignAudience)
    // { hid, campaignId, group: "opened"|"clicked" } -> { result: { doc: { recipientBatchId, count, label } } }
    createCampaignAudienceBatch: build.mutation({
      query: ({ hid, campaignId, group }) => ({
        url: `${BASE}/campaigns/${campaignId}/audience/batch`,
        method: "POST",
        body: { hid, group },
      }),
      extraOptions: NODE,
    }),
    // same body -> { result: { doc: { total, added, alreadyContacts } } }; refreshes the Contacts page
    saveCampaignAudienceToContacts: build.mutation({
      query: ({ hid, campaignId, group }) => ({
        url: `${BASE}/campaigns/${campaignId}/audience/contacts`,
        method: "POST",
        body: { hid, group },
      }),
      extraOptions: NODE,
      invalidatesTags: ["Contact"],
    }),

    // { hid, body: { to: [..up to 5], subject, html, text, fromName, replyTo } }
    // sends the email being written as "[Test] subject"; saves no campaign
    sendTestEmail: build.mutation({
      query: ({ hid, body }) => ({
        url: `${BASE}/campaigns/test`,
        method: "POST",
        params: { hid },
        body: { hid, ...body },
        timeout: 60000,
      }),
      extraOptions: NODE,
    }),

    // --- sender mailbox: the property's own mailbox campaigns go out from ---
    // { hid } -> { result: { mailbox | null, presets } }
    getSenderMailbox: build.query({
      query: ({ hid }) => ({ url: `${BASE}/sender-mailbox`, params: { hid } }),
      extraOptions: NODE,
    }),

    // { hid, email } -> { result: { detected: { presetId, label, smtp, imap, autoSavesSent, passwordHint, known } } }
    detectSenderMailbox: build.query({
      query: ({ hid, email }) => ({ url: `${BASE}/sender-mailbox/detect`, params: { hid, email } }),
      extraOptions: NODE,
    }),

    // { hid, body: { email, password, displayName, username, smtp, imap, saveToSent } }
    // gian logs in first; 400 with a readable message when the details don't work
    saveSenderMailbox: build.mutation({
      query: ({ hid, body }) => ({
        url: `${BASE}/sender-mailbox`,
        method: "PUT",
        params: { hid },
        body: { hid, ...body },
        timeout: 60000,
      }),
      extraOptions: NODE,
    }),

    // { hid }
    deleteSenderMailbox: build.mutation({
      query: ({ hid }) => ({ url: `${BASE}/sender-mailbox`, method: "DELETE", params: { hid } }),
      extraOptions: NODE,
    }),

    // { hid, to? } - a test email through the mailbox, to itself by default
    testSenderMailbox: build.mutation({
      query: ({ hid, to }) => ({
        url: `${BASE}/sender-mailbox/test`,
        method: "POST",
        params: { hid },
        body: { hid, ...(to && { to }) },
        timeout: 60000,
      }),
      extraOptions: NODE,
    }),

    // --- drafts: the compose window saves as you type, like Gmail ---
    // { hid } -> { result: { drafts: [{ _id, subject, snippet, toEmails, toCount, recipientCount, recipientLabel, templateName, updatedAt }] } }
    getEmailDrafts: build.query({
      query: ({ hid }) => ({ url: `${BASE}/drafts`, params: { hid } }),
      extraOptions: NODE,
      keepUnusedDataFor: 0,
    }),
    // { hid, id } -> { result: { draft } } with its content
    getEmailDraft: build.query({
      query: ({ hid, id }) => ({ url: `${BASE}/drafts/${id}`, params: { hid } }),
      extraOptions: NODE,
      keepUnusedDataFor: 0,
    }),
    // { hid, body } -> { result: { draft: { _id, ... } } }
    createEmailDraft: build.mutation({
      query: ({ hid, body }) => ({ url: `${BASE}/drafts`, method: "POST", params: { hid }, body: { hid, ...body } }),
      extraOptions: NODE,
    }),
    updateEmailDraft: build.mutation({
      query: ({ hid, id, body }) => ({ url: `${BASE}/drafts/${id}`, method: "PUT", params: { hid }, body: { hid, ...body } }),
      extraOptions: NODE,
    }),
    deleteEmailDraft: build.mutation({
      query: ({ hid, id }) => ({ url: `${BASE}/drafts/${id}`, method: "DELETE", params: { hid } }),
      extraOptions: NODE,
    }),

    // --- Amazon SES: the hotel's own domain / address verified in Eazotel's SES ---
    // { hid, body: { kind: 'domain'|'email', domain?, fromEmail, displayName? } }
    //   -> { result: { ses: { kind, identity, fromEmail, status, records[], ... } } }
    startSesSender: build.mutation({
      query: ({ hid, body }) => ({
        url: `${BASE}/sender-mailbox/ses`,
        method: "POST",
        params: { hid },
        body: { hid, ...body },
        timeout: 60000,
      }),
      extraOptions: NODE,
    }),

    // { hid } -> { result: { ses } } with the status Amazon has now
    checkSesSender: build.mutation({
      query: ({ hid }) => ({ url: `${BASE}/sender-mailbox/ses/check`, method: "POST", params: { hid }, body: { hid } }),
      extraOptions: NODE,
    }),

    // Eazotel (support@eazotel.com) emails the DNS records, where to add them and how, to the hotel's IT team
    // { hid, body: { to: string[], cc?: string[], note? } } -> { result: { recordsMail: { sent, to, cc }, ses } }
    sendSesRecordsEmail: build.mutation({
      query: ({ hid, body }) => ({
        url: `${BASE}/sender-mailbox/ses/records-email`,
        method: "POST",
        params: { hid },
        body: { hid, ...body },
        timeout: 60000,
      }),
      extraOptions: NODE,
    }),

    // { hid, body: { fromEmail?, displayName? } }
    updateSesSender: build.mutation({
      query: ({ hid, body }) => ({ url: `${BASE}/sender-mailbox/ses`, method: "PUT", params: { hid }, body: { hid, ...body } }),
      extraOptions: NODE,
    }),

    // { hid }
    deleteSesSender: build.mutation({
      query: ({ hid }) => ({ url: `${BASE}/sender-mailbox/ses`, method: "DELETE", params: { hid } }),
      extraOptions: NODE,
    }),

    // --- templates: hid goes in the query and, for writes, in the body ---
    // { hid, page, limit, search }
    getEmailTemplates: build.query({
      query: ({ hid, page, limit, search }) => ({
        url: `${BASE}/templates`,
        params: { hid, page, limit, ...(search && { search }) },
      }),
      extraOptions: NODE,
    }),

    // { hid, body }
    createEmailTemplate: build.mutation({
      query: ({ hid, body }) => ({
        url: `${BASE}/templates`,
        method: "POST",
        params: { hid },
        body: { hid, ...body },
      }),
      extraOptions: NODE,
    }),

    // { hid, id, body }
    updateEmailTemplate: build.mutation({
      query: ({ hid, id, body }) => ({
        url: `${BASE}/templates/${id}`,
        method: "PATCH",
        params: { hid },
        body: { hid, ...body },
      }),
      extraOptions: NODE,
    }),

    // { hid, id }
    deleteEmailTemplate: build.mutation({
      query: ({ hid, id }) => ({ url: `${BASE}/templates/${id}`, method: "DELETE", params: { hid } }),
      extraOptions: NODE,
    }),

    // "Help me write" (gian services/emailAi): { hid, body: { action, prompt, bodyHtml, subject } }
    // -> { result: { doc: { html, subjects } } }
    aiWriteEmail: build.mutation({
      query: ({ hid, body }) => ({
        url: `${BASE}/ai/write`,
        method: "POST",
        body: { hid, ...body },
        timeout: GENERATE_TIMEOUT_MS,
      }),
      extraOptions: NODE,
    }),
    // "Make it mobile-ready": { hid, html } -> { result: { doc: { html, missing: { links, images }, inputKb } } }
    // a whole design is rebuilt, which can take a few minutes
    aiMobileEmail: build.mutation({
      query: ({ hid, html }) => ({
        url: `${BASE}/ai/mobile`,
        method: "POST",
        body: { hid, html },
        timeout: MOBILE_TIMEOUT_MS,
      }),
      extraOptions: NODE,
    }),
    // { hid, body: { prompt, tone, brandName, ..., previousTemplate? } }
    // -> { result: { doc: { name, subject, previewText, html, text, prompt } } }
    generateEmailTemplate: build.mutation({
      query: ({ hid, body }) => ({
        url: `${BASE}/templates/generate`,
        method: "POST",
        params: { hid },
        body: { hid, ...body },
        timeout: GENERATE_TIMEOUT_MS,
      }),
      extraOptions: NODE,
    }),
  }),
});

const e = emailMarketingApi.endpoints;

// ---------------------------------------------------------------------------
// For plain code, named as in the old services/api/emailCampaign.js and
// emailTemplate.js, so the pages kept their logic.

// Campaigns and recipients resolve with the answer's `result` (also for a 4xx).
const result = async (endpoint, arg) => (await request(endpoint, arg))?.result;

export const getEmailRecipients = ({ page = 1, limit = 50, search = "" } = {}) =>
  result(e.getEmailRecipients, { hid: selectedHid(), page, limit, search });
export const createLeadRecipientBatch = ({ leadIds }) =>
  result(e.createLeadRecipientBatch, { hid: selectedHid(), leadIds });
export const createLeadRecipientBatchFromFilter = ({ search = "" }) =>
  result(e.createLeadRecipientBatchFromFilter, { hid: selectedHid(), search });
// Last check before the server: accents removed, invalid addresses never sent
// can these addresses receive email? -> { checked, ok, undeliverable, risky, problems }
export const checkEmails = (emails) => strict(e.checkEmails, { emails });
export const createManualRecipientBatch = ({ emails }) =>
  // sent as typed: the server checks each address like that first and only cleans it (accents,
  // spaces, <>) when that fails, then drops what can't receive email (Wrong emails)
  result(e.createManualRecipientBatch, {
    hid: selectedHid(),
    emails: [...new Set((emails || []).map((v) => String(v ?? "").trim()).filter(Boolean))],
  });

export const createEmailCampaign = ({
  name,
  subject,
  html,
  text = "",
  fromName = "",
  fromEmail = "",
  audienceLabel = "",
  recipientBatchIds,
  attachments = [],
}) => {
  const form = new FormData();
  form.append("hid", selectedHid());
  form.append("name", name);
  form.append("subject", subject);
  form.append("html", html);
  form.append("text", text);
  form.append("fromName", fromName);
  form.append("fromEmail", fromEmail);
  if (audienceLabel) form.append("audienceLabel", audienceLabel);
  form.append("recipientBatchIds", JSON.stringify(recipientBatchIds));
  attachments.forEach((file) => form.append("attachments", file));
  return result(e.createEmailCampaign, form);
};
export const getEmailCampaigns = ({ page = 1, limit = 20 } = {}) =>
  result(e.getEmailCampaigns, { hid: selectedHid(), page, limit });
export const getEmailCampaign = ({ campaignId }) =>
  result(e.getEmailCampaign, { hid: selectedHid(), campaignId });
export const getEmailPerformance = ({ from, to, tz }) =>
  strict(e.getEmailPerformance, { hid: selectedHid(), from, to, tz });
export const getCampaignReport = ({ campaignId, tz }) => strict(e.getCampaignReport, { hid: selectedHid(), campaignId, tz });
export const getSentSummary = ({ from, to }) => strict(e.getSentSummary, { hid: selectedHid(), from, to });
export const getCampaignMessage = ({ campaignId, recipientId }) =>
  strict(e.getCampaignMessage, { hid: selectedHid(), campaignId, recipientId });
export const getCampaignRecipients = ({ campaignId, status = "", page = 1, limit = 50, search = "" }) =>
  result(e.getCampaignRecipients, { hid: selectedHid(), campaignId, status, page, limit, search });
// get Amazon's result of every email of a campaign -> { started, amazonSync }
export const startAmazonSync = ({ campaignId }) => strict(e.startAmazonSync, { hid: selectedHid(), campaignId });
// Amazon's 30-day numbers for this property's sender -> { level, rates, totals, daily, advice, dkim, … }
export const getSenderHealth = ({ fresh = false } = {}) => strict(e.getSenderHealth, { hid: selectedHid(), fresh });
// the hotel's wrong addresses -> { items, total, page, pages, counts }
export const getWrongEmails = ({ page = 1, limit = 50, search = "", kind = "" } = {}) => strict(e.getWrongEmails, { page, limit, search, kind });
// { ids } | { all: true, kind } -> { deleted, contactsRemoved }
export const deleteWrongEmails = (body) => strict(e.deleteWrongEmails, body);
export const sendEmailCampaign = ({ campaignId }) =>
  result(e.sendEmailCampaign, { hid: selectedHid(), campaignId });

// Templates resolve with the answer's `result` and throw an Error with the
// server's message when it fails - the template pages show error.message.
const strict = async (endpoint, arg) => {
  const { data, error } = await run(endpoint, arg);
  if (error?.status === "TIMEOUT_ERROR") {
    throw Object.assign(new Error("The AI took too long to respond. Please try again."), { isApiError: true });
  }
  const body = error ? error.data : data;
  if (error || body?.success === false) {
    throw Object.assign(
      new Error(getApiErrorMessage(
        error || { data: body },
        body?.result?.message || "Something went wrong. Please try again.",
      )),
      { status: typeof error?.status === "number" ? error.status : 200, isApiError: true },
    );
  }
  return body?.result;
};

// action: write | improve | shorter | longer | formal | friendly | fix | subjects
export const aiWriteEmail = (body) => strict(e.aiWriteEmail, { hid: selectedHid(), body });
export const aiMobileEmail = (html) => strict(e.aiMobileEmail, { hid: selectedHid(), html });
export const generateEmailTemplate = (payload) =>
  strict(e.generateEmailTemplate, { hid: selectedHid(), body: payload });
export const getEmailTemplates = ({ page = 1, limit = 12, search = "" } = {}) =>
  strict(e.getEmailTemplates, { hid: selectedHid(), page, limit, search });
export const createEmailTemplate = (payload) =>
  strict(e.createEmailTemplate, { hid: selectedHid(), body: payload });
export const updateEmailTemplate = (id, payload) =>
  strict(e.updateEmailTemplate, { hid: selectedHid(), id, body: payload });
export const deleteEmailTemplate = (id) => strict(e.deleteEmailTemplate, { hid: selectedHid(), id });

// Sender mailbox: resolve with `result`, throw with the server's message.
export const getSenderMailbox = () => strict(e.getSenderMailbox, { hid: selectedHid() });
export const detectSenderMailbox = (email) => strict(e.detectSenderMailbox, { hid: selectedHid(), email });
export const saveSenderMailbox = (body) => strict(e.saveSenderMailbox, { hid: selectedHid(), body });
export const deleteSenderMailbox = () => strict(e.deleteSenderMailbox, { hid: selectedHid() });
export const testSenderMailbox = (to) => strict(e.testSenderMailbox, { hid: selectedHid(), to });
export const startSesSender = (body) => strict(e.startSesSender, { hid: selectedHid(), body });
export const checkSesSender = () => strict(e.checkSesSender, { hid: selectedHid() });
export const updateSesSender = (body) => strict(e.updateSesSender, { hid: selectedHid(), body });
export const sendSesRecordsEmail = (body) => strict(e.sendSesRecordsEmail, { hid: selectedHid(), body });
export const deleteSesSender = () => strict(e.deleteSesSender, { hid: selectedHid() });

// Footer + final email; throw with the server's message.
const hotelNameNow = () => store.getState().userProfile.user?.Profile?.hotelName || "";
export const getEmailFooter = () => strict(e.getEmailFooter, { hid: selectedHid(), hotelName: hotelNameNow() });
export const saveEmailFooter = (footer) =>
  strict(e.saveEmailFooter, { hid: selectedHid(), hotelName: hotelNameNow(), footer });
export const deleteEmailFooter = () => strict(e.deleteEmailFooter, { hid: selectedHid() });
// footer: undefined = the saved one, an object = unsaved changes from the editor
export const renderEmail = ({ html, previewText = "", footer }) =>
  strict(e.renderEmail, {
    hid: selectedHid(),
    body: { html, previewText, hotelName: hotelNameNow(), ...(footer !== undefined && { footer }) },
  });

// Retry / resume a campaign that didn't reach everyone; throw with the server's message.
export const getCampaignDelivery = ({ campaignId }) =>
  strict(e.getCampaignDelivery, { hid: selectedHid(), campaignId });
export const stopEmailCampaign = ({ campaignId }) =>
  strict(e.stopEmailCampaign, { hid: selectedHid(), campaignId });
export const startEmailCampaign = ({ campaignId }) =>
  strict(e.sendEmailCampaign, { hid: selectedHid(), campaignId });
// drafts resolve with `result` and throw with the server's message (error.status = HTTP status)
export const getEmailDrafts = () => strict(e.getEmailDrafts, { hid: selectedHid() });
export const getEmailDraft = (id) => strict(e.getEmailDraft, { hid: selectedHid(), id });
export const createEmailDraft = (body) => strict(e.createEmailDraft, { hid: selectedHid(), body });
export const updateEmailDraft = (id, body) => strict(e.updateEmailDraft, { hid: selectedHid(), id, body });
export const deleteEmailDraft = (id) => strict(e.deleteEmailDraft, { hid: selectedHid(), id });
export const deleteEmailCampaign = ({ campaignId }) =>
  strict(e.deleteEmailCampaign, { hid: selectedHid(), campaignId });
// selection: { everyone, groups: [names], engaged: [{ campaignId, group: "opened"|"clicked" }],
//   engagement?: ["opened"|"clicked"] (only the group people who did so), engagementCampaignId?: id|null (null = any email) }
export const getAudienceOptions = () => strict(e.getAudienceOptions, { hid: selectedHid() });
export const previewAudience = (selection) => strict(e.previewAudience, { hid: selectedHid(), ...selection });
export const createAudienceBatch = (selection) => strict(e.createAudienceBatch, { hid: selectedHid(), ...selection });
// Trade Directory partners: { pool, segments?, ids? }
export const previewTradeAudience = async (selection) =>
  (await strict(e.previewTradeAudience, { hid: selectedHid(), ...selection }))?.doc;
export const createTradeRecipientBatch = async (selection) =>
  (await strict(e.createTradeRecipientBatch, { hid: selectedHid(), ...selection }))?.doc;
// group: "opened" (includes clickers) | "clicked"
export const createCampaignAudienceBatch = ({ campaignId, group }) =>
  strict(e.createCampaignAudienceBatch, { hid: selectedHid(), campaignId, group });
export const saveCampaignAudienceToContacts = ({ campaignId, group }) =>
  strict(e.saveCampaignAudienceToContacts, { hid: selectedHid(), campaignId, group });
// a campaign's wrong addresses (bounced / not valid) -> { wrong, otherFailed, total }
export const getBadAddresses = async ({ campaignId }) =>
  (await strict(e.getBadAddresses, { hid: selectedHid(), campaignId }))?.doc;
// takes them off future sends -> { removed, alreadyOff }
export const removeBadAddresses = async ({ campaignId }) =>
  (await strict(e.removeBadAddresses, { hid: selectedHid(), campaignId }))?.doc;
export const retryEmailCampaign = ({ campaignId }) =>
  strict(e.retryEmailCampaign, { hid: selectedHid(), campaignId });

// A test of the email being written; throws with the server's message.
export const sendTestEmail = (body) => strict(e.sendTestEmail, { hid: selectedHid(), body });
