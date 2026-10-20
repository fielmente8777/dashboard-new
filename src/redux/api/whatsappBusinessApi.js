import { request, selectedHid } from "../request";
import { baseApi } from "./baseApi";

const NODE = { service: "node" };

// WhatsApp Business settings: account, profile, templates, flows, auto
// replies and credits (gian: /api/v1/whatsapp/...).
// Every answer is passed through as the API sends it ({ success, result,
// responseMessage }); pages read it with responseBody(). The GETs are used as
// lazy queries, so each call fetches fresh.
export const whatsappBusinessApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // --- account and profile ---
    // hid -> { result: { docs: account } }
    getWhatsAppAccountDetails: build.query({
      query: (hid) => ({ url: "/api/v1/whatsapp/account/connection/details", params: { hid } }),
      extraOptions: NODE,
    }),

    // hid -> { result: { doc: profile } }
    getWhatsAppBusinessProfile: build.query({
      query: (hid) => ({ url: "/api/v1/whatsapp/profile", params: { hid } }),
      extraOptions: NODE,
    }),

    // { hid, form } - FormData with the profile fields and picture
    updateWhatsAppBusinessProfile: build.mutation({
      query: ({ hid, form }) => ({
        url: "/api/v1/whatsapp/profile/update",
        method: "POST",
        params: { hid },
        body: form,
      }),
      extraOptions: NODE,
    }),

    // { phoneNumberId, autoMessage?, notification?, ai? }
    updateAutoMessageConfig: build.mutation({
      query: (body) => ({
        url: `/api/v1/whatsapp/account/${body.phoneNumberId}/automessageConfig/update`,
        method: "PUT",
        body,
      }),
      extraOptions: NODE,
    }),

    // --- message templates ---
    // hid -> { result: { docs: { data: templates } } }
    getWhatsAppTemplatesRaw: build.query({
      query: (hid) => ({ url: "/api/v1/whatsapp/message/template/get", params: { hid } }),
      extraOptions: NODE,
    }),

    // { hid, form } - FormData: the template and its header media
    createWhatsAppTemplate: build.mutation({
      query: ({ hid, form }) => ({
        url: "/api/v1/whatsapp/message/template/create",
        method: "POST",
        params: { hid },
        body: form,
      }),
      extraOptions: NODE,
    }),

    // { hid, id, form }
    updateWhatsAppTemplate: build.mutation({
      query: ({ hid, id, form }) => ({
        url: `/api/v1/whatsapp/message/template/${id}`,
        method: "PUT",
        params: { hid },
        body: form,
      }),
      extraOptions: NODE,
    }),

    // { templateName, language }
    deleteWhatsAppTemplate: build.mutation({
      query: (body) => ({ url: "/api/v1/whatsapp/message/template/delete", method: "DELETE", body }),
      extraOptions: NODE,
    }),

    // --- flows ---
    // hid -> { result: { docs: { flow: { nodes, edges } } } } - the flow builder's graph
    getWhatsAppFlowGraph: build.query({
      query: (hid) => ({ url: "/api/v1/whatsapp/flow", params: { hid } }),
      extraOptions: NODE,
    }),

    // hid -> { result: { docs: { flows } } } - the published flow forms
    getWhatsAppFlowScreens: build.query({
      query: (hid) => ({ url: "/api/v1/whatsapp/flow/get", params: { hid } }),
      extraOptions: NODE,
    }),

    // { hid, body: { flowName, category, screens } }
    createWhatsAppFlowScreens: build.mutation({
      query: ({ hid, body }) => ({
        url: "/api/v1/whatsapp/flow/create",
        method: "POST",
        params: { hid },
        body,
      }),
      extraOptions: NODE,
    }),

    // --- credits ---
    // hid -> { result: { docs: billing } }
    getWhatsAppBilling: build.query({
      query: (hid) => ({ url: "/api/v1/whatsapp/billing", params: { hid } }),
      extraOptions: NODE,
    }),

    // { hid, page, limit } -> { result: { docs: { items, ... } } }
    getWhatsAppTransactions: build.query({
      query: ({ hid, page = 1, limit = 10 }) => ({
        url: "/api/v1/whatsapp/billing/transactions",
        params: { hid, page, limit },
      }),
      extraOptions: NODE,
    }),

    // { hid, amount } -> the Razorpay order
    createWhatsAppCreditOrder: build.mutation({
      query: ({ hid, amount }) => ({
        url: "/api/v1/whatsapp/billing/razorpay/order",
        method: "POST",
        params: { hid },
        body: { amount },
      }),
      extraOptions: NODE,
    }),

    // { razorpay_order_id, razorpay_payment_id, razorpay_signature }
    verifyWhatsAppCreditPayment: build.mutation({
      query: (body) => ({ url: "/api/v1/whatsapp/billing/razorpay/verify", method: "POST", body }),
      extraOptions: NODE,
    }),
  }),
});

// The same calls for plain code, named as in the old services/api/whatsApp.js
// so the pages kept their logic. Each resolves with the answer's body and uses
// the selected location.
const e = whatsappBusinessApi.endpoints;
export const getWhatsappAccountDetails = () => request(e.getWhatsAppAccountDetails, selectedHid());
export const getWhatsAppProfile = () => request(e.getWhatsAppBusinessProfile, selectedHid());
export const updateWhatsAppProfile = (form) =>
  request(e.updateWhatsAppBusinessProfile, { hid: selectedHid(), form });
export const updateAutoMessageConfig = (body) => request(e.updateAutoMessageConfig, body);
export const getWhatsAppMessageTemplates = () => request(e.getWhatsAppTemplatesRaw, selectedHid());
export const createWhatsAppMessageTemplate = (form) =>
  request(e.createWhatsAppTemplate, { hid: selectedHid(), form });
export const updateWhatsAppMessageTemplate = (form, id) =>
  request(e.updateWhatsAppTemplate, { hid: selectedHid(), id, form });
export const deleteWhatsAppMessageTemplate = (body) => request(e.deleteWhatsAppTemplate, body);
// the flow builder's graph (not the list of flow forms below)
export const getWhatsAppFlows = () => request(e.getWhatsAppFlowGraph, selectedHid());
export const getWhatsAppFlowScreens = () => request(e.getWhatsAppFlowScreens, selectedHid());
export const createWhatAppFlow = (body) =>
  request(e.createWhatsAppFlowScreens, { hid: selectedHid(), body });
export const getWhatsAppBilling = () => request(e.getWhatsAppBilling, selectedHid());
export const getWhatsAppTransactions = ({ page = 1, limit = 10 } = {}) =>
  request(e.getWhatsAppTransactions, { hid: selectedHid(), page, limit });
export const createWhatsAppCreditOrder = (amount) =>
  request(e.createWhatsAppCreditOrder, { hid: selectedHid(), amount });
export const verifyWhatsAppCreditPayment = (body) => request(e.verifyWhatsAppCreditPayment, body);
