import { NEW_BASE_URL } from "../../data/constant";

const EMAIL_BASE_URL = NEW_BASE_URL;
const API_PREFIX = "/api/v1/email-marketing";

const getHid = () => localStorage.getItem("hid");

const getAuthHeaders = (extra = {}) => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...extra,
  };
};

/* ===========================================================
   RECIPIENTS — paginated, searchable leads from ContactUs
=========================================================== */

export const getEmailRecipients = async ({
  page = 1,
  limit = 50,
  search = "",
} = {}) => {
  try {
    const params = new URLSearchParams();
    params.append("hid", getHid());
    params.append("page", page);
    params.append("limit", limit);
    if (search) params.append("search", search);

    const response = await fetch(
      `${EMAIL_BASE_URL}${API_PREFIX}/recipients?${params.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );

    const result = await response.json();
    return result?.result;
  } catch (error) {
    console.error("Error getting email recipients:", error);
    throw error;
  }
};

/* ===========================================================
   RECIPIENT BATCHES
=========================================================== */

// Batch from explicitly selected lead IDs (current page selection)
export const createLeadRecipientBatch = async ({ leadIds }) => {
  try {
    const response = await fetch(
      `${EMAIL_BASE_URL}${API_PREFIX}/recipient-batches/leads`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ hid: getHid(), leadIds }),
      },
    );

    const result = await response.json();
    return result?.result;
  } catch (error) {
    console.error("Error creating lead recipient batch:", error);
    throw error;
  }
};

// Batch from EVERY lead matching the current search filter (any size)
export const createLeadRecipientBatchFromFilter = async ({ search = "" }) => {
  try {
    const response = await fetch(
      `${EMAIL_BASE_URL}${API_PREFIX}/recipient-batches/leads/all`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ hid: getHid(), search }),
      },
    );

    const result = await response.json();
    return result?.result;
  } catch (error) {
    console.error("Error creating batch from filter:", error);
    throw error;
  }
};

export const uploadEmailExcel = async ({ file }) => {
  try {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("hid", getHid());
    formData.append("file", file);

    const response = await fetch(
      `${EMAIL_BASE_URL}${API_PREFIX}/recipient-batches/excel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type — browser sets the multipart boundary.
        },
        body: formData,
      },
    );

    const result = await response.json();
    return result?.data;
  } catch (error) {
    console.error("Error uploading email excel:", error);
    throw error;
  }
};

export const createManualRecipientBatch = async ({ emails }) => {
  try {
    const response = await fetch(
      `${EMAIL_BASE_URL}${API_PREFIX}/recipient-batches/manual`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ hid: getHid(), emails }),
      },
    );

    const result = await response.json();
    return result?.data;
  } catch (error) {
    console.error("Error creating manual recipient batch:", error);
    throw error;
  }
};

export const getRecipientBatch = async ({ batchId }) => {
  try {
    const params = new URLSearchParams();
    params.append("hid", getHid());

    const response = await fetch(
      `${EMAIL_BASE_URL}${API_PREFIX}/recipient-batches/${batchId}?${params.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );

    const result = await response.json();
    return result?.data;
  } catch (error) {
    console.error("Error getting recipient batch:", error);
    throw error;
  }
};

export const deleteRecipientBatch = async ({ batchId }) => {
  try {
    const params = new URLSearchParams();
    params.append("hid", getHid());

    const response = await fetch(
      `${EMAIL_BASE_URL}${API_PREFIX}/recipient-batches/${batchId}?${params.toString()}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      },
    );

    const result = await response.json();
    return result?.data;
  } catch (error) {
    console.error("Error deleting recipient batch:", error);
    throw error;
  }
};

/* ===========================================================
   CAMPAIGNS
=========================================================== */

export const createEmailCampaign = async ({
  name,
  subject,
  html,
  text = "",
  fromName = "",
  fromEmail = "",
  recipientBatchIds,
}) => {
  try {
    const response = await fetch(`${EMAIL_BASE_URL}${API_PREFIX}/campaigns`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        hid: getHid(),
        name,
        subject,
        html,
        text,
        fromName,
        fromEmail,
        recipientBatchIds,
      }),
    });

    const result = await response.json();
    return result?.result;
  } catch (error) {
    console.error("Error creating email campaign:", error);
    throw error;
  }
};

export const getEmailCampaigns = async ({ page = 1, limit = 20 } = {}) => {
  try {
    const params = new URLSearchParams();
    params.append("hid", getHid());
    params.append("page", page);
    params.append("limit", limit);

    const response = await fetch(
      `${EMAIL_BASE_URL}${API_PREFIX}/campaigns?${params.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );

    const result = await response.json();
    return result?.data;
  } catch (error) {
    console.error("Error getting email campaigns:", error);
    throw error;
  }
};

export const getEmailCampaign = async ({ campaignId }) => {
  try {
    const params = new URLSearchParams();
    params.append("hid", getHid());

    const response = await fetch(
      `${EMAIL_BASE_URL}${API_PREFIX}/campaigns/${campaignId}?${params.toString()}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );

    const result = await response.json();
    return result?.data;
  } catch (error) {
    console.error("Error getting email campaign:", error);
    throw error;
  }
};

export const sendEmailCampaign = async ({ campaignId }) => {
  try {
    const response = await fetch(
      `${EMAIL_BASE_URL}${API_PREFIX}/campaigns/${campaignId}/send`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ hid: getHid() }),
      },
    );

    const result = await response.json();
    return result?.result;
  } catch (error) {
    console.error("Error sending email campaign:", error);
    throw error;
  }
};
