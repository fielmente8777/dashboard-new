import { request, run, selectedHid } from "../request";
import store from "../Store";
import { baseApi } from "./baseApi";

const NODE = { service: "node" };
const BASE = "/api/v1/email-marketing";
// AI generation can take 20-60s
const GENERATE_TIMEOUT_MS = 120000;

// Email marketing (gian: /api/v1/email-marketing). Every endpoint takes the
// hid of the selected location; the functions below fill it in.
export const emailMarketingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
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
    getEmailCampaign: build.query({
      query: ({ hid, campaignId }) => ({ url: `${BASE}/campaigns/${campaignId}`, params: { hid } }),
      extraOptions: NODE,
    }),

    // { hid, campaignId, status, page, limit }
    getCampaignRecipients: build.query({
      query: ({ hid, campaignId, status, page, limit }) => ({
        url: `${BASE}/campaigns/${campaignId}/recipients`,
        params: { hid, page, limit, ...(status && { status }) },
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
    retryEmailCampaign: build.mutation({
      query: ({ hid, campaignId }) => ({
        url: `${BASE}/campaigns/${campaignId}/retry`,
        method: "POST",
        params: { hid },
        body: { hid },
      }),
      extraOptions: NODE,
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
export const createManualRecipientBatch = ({ emails }) =>
  result(e.createManualRecipientBatch, { hid: selectedHid(), emails });

export const createEmailCampaign = ({
  name,
  subject,
  html,
  text = "",
  fromName = "",
  fromEmail = "",
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
  form.append("recipientBatchIds", JSON.stringify(recipientBatchIds));
  attachments.forEach((file) => form.append("attachments", file));
  return result(e.createEmailCampaign, form);
};
export const getEmailCampaigns = ({ page = 1, limit = 20 } = {}) =>
  result(e.getEmailCampaigns, { hid: selectedHid(), page, limit });
export const getEmailCampaign = ({ campaignId }) =>
  result(e.getEmailCampaign, { hid: selectedHid(), campaignId });
export const getCampaignRecipients = ({ campaignId, status = "", page = 1, limit = 50 }) =>
  result(e.getCampaignRecipients, { hid: selectedHid(), campaignId, status, page, limit });
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
      new Error(body?.message || body?.result?.message || "Something went wrong. Please try again."),
      { status: typeof error?.status === "number" ? error.status : 200, isApiError: true },
    );
  }
  return body?.result;
};

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
export const retryEmailCampaign = ({ campaignId }) =>
  strict(e.retryEmailCampaign, { hid: selectedHid(), campaignId });

// A test of the email being written; throws with the server's message.
export const sendTestEmail = (body) => strict(e.sendTestEmail, { hid: selectedHid(), body });
