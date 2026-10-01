/*
 * 👉 Import these from the SAME file your getEmailRecipients uses them from.
 *    If they're not exported there yet, add `export` in front of them
 *    (or paste all functions below into that same API file and drop this import).
 */

import { NEW_BASE_URL } from "../../data/constant";

const getHid = () => localStorage.getItem("hid");

const EMAIL_BASE_URL = NEW_BASE_URL;
const API_PREFIX = "/api/v1/email-marketing";
const TEMPLATES_PATH = "/templates";

// AI generation can take 20–60s
const GENERATE_TIMEOUT_MS = 120000;

/* ---------------------------------------------------------
   INTERNAL HELPERS
--------------------------------------------------------- */

const getAuthHeaders = (extra = true) => {
  const token = localStorage.getItem("token");
  return {
    // "Content-Type": "application/json",
    ...(extra && { "Content-Type": "application/json" }),
    Authorization: `Bearer ${token}`,
    ...extra,
  };
};

const buildUrl = (path = "", query = {}) => {
  const params = new URLSearchParams();
  params.append("hid", getHid());

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });

  return `${EMAIL_BASE_URL}${API_PREFIX}${TEMPLATES_PATH}${path}?${params.toString()}`;
};

/**
 * fetch() doesn't throw on 4xx/5xx, so we do it here with the server's
 * message. The UI shows `error.message` directly.
 */
const request = async (url, { method = "GET", body, timeoutMs } = {}) => {
  const controller = timeoutMs ? new AbortController() : null;
  const timer = controller
    ? setTimeout(() => controller.abort(), timeoutMs)
    : null;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: body ? JSON.stringify({ hid: getHid(), ...body }) : undefined,
      signal: controller?.signal,
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || result?.success === false) {
      const error = new Error(
        result?.message ||
          result?.result?.message ||
          "Something went wrong. Please try again.",
      );
      error.status = response.status;
      error.isApiError = true;
      throw error;
    }

    return result?.result;
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error(
        "The AI took too long to respond. Please try again.",
      );
      timeoutError.isApiError = true;
      throw timeoutError;
    }
    throw error;
  } finally {
    if (timer) clearTimeout(timer);
  }
};

/* ---------------------------------------------------------
   AI GENERATE / REFINE
   payload: { prompt, tone, brandName, primaryColor, logoUrl,
              ctaText, ctaUrl, previousTemplate?: { subject, html } }
   returns: { doc: { name, subject, previewText, html, text, prompt } }
--------------------------------------------------------- */

export const generateEmailTemplate = async (payload) => {
  try {
    return await request(buildUrl("/generate"), {
      method: "POST",
      body: payload,
      timeoutMs: GENERATE_TIMEOUT_MS,
    });
  } catch (error) {
    console.error("Error generating email template:", error);
    throw error;
  }
};

/* ---------------------------------------------------------
   LIST — returns { doc: [...], pagination: { page, limit, total, totalPages } }
--------------------------------------------------------- */

export const getEmailTemplates = async ({
  page = 1,
  limit = 12,
  search = "",
} = {}) => {
  try {
    return await request(buildUrl("", { page, limit, search }));
  } catch (error) {
    console.error("Error getting email templates:", error);
    throw error;
  }
};

/* ---------------------------------------------------------
   GET ONE
--------------------------------------------------------- */

export const getEmailTemplate = async (id) => {
  try {
    return await request(buildUrl(`/${id}`));
  } catch (error) {
    console.error("Error getting email template:", error);
    throw error;
  }
};

/* ---------------------------------------------------------
   CREATE — payload: { name, subject, previewText, html, prompt }
--------------------------------------------------------- */

export const createEmailTemplate = async (payload) => {
  try {
    return await request(buildUrl(), { method: "POST", body: payload });
  } catch (error) {
    console.error("Error creating email template:", error);
    throw error;
  }
};

/* ---------------------------------------------------------
   UPDATE
--------------------------------------------------------- */

export const updateEmailTemplate = async (id, payload) => {
  try {
    return await request(buildUrl(`/${id}`), {
      method: "PATCH",
      body: payload,
    });
  } catch (error) {
    console.error("Error updating email template:", error);
    throw error;
  }
};

/* ---------------------------------------------------------
   DELETE
--------------------------------------------------------- */

export const deleteEmailTemplate = async (id) => {
  try {
    return await request(buildUrl(`/${id}`), { method: "DELETE" });
  } catch (error) {
    console.error("Error deleting email template:", error);
    throw error;
  }
};
