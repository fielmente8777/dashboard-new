import { request, run, selectedHid } from "../request";
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
