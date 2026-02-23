import { BASE_URL, NEW_BASE_URL } from "../../data/constant";

const url = "https://nexon.eazotel.com/eazotel/addcontacts";

export const bulkImportMetaLeads = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(
      `${NEW_BASE_URL}/api/v1/meta/leads/bulk-import`,
      {
        method: "POST", // or "POST" if you're sending data
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({}),
      },
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};

export const getAllMetaLeads = async ({
  page,
  pageId,
  limit = 20,
  search,
  startDate,
  endDate,
}) => {
  const token = localStorage.getItem("token");

  const params = new URLSearchParams();
  if (page) params.append("page", page);
  if (pageId) params.append("pageId", pageId);
  if (limit) params.append("limit", limit);
  if (search) params.append("search", search);
  if (startDate && endDate) {
    params.append("from", startDate);
    params.append("to", endDate);
  }

  try {
    const response = await fetch(
      `${NEW_BASE_URL}/api/v1/meta/leads?${params.toString()}`,
      {
        method: "GET", // or "POST" if you're sending data
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};

export const getMetaAccounts = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${NEW_BASE_URL}/api/v1/meta/accounts`, {
      method: "GET", // or "POST" if you're sending data
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};

export const getMetaForms = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${NEW_BASE_URL}/api/v1/meta/forms`, {
      method: "GET", // or "POST" if you're sending data
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};

export const getMetaLeads = async (pageId, formId, cursor, limit) => {
  const token = localStorage.getItem("token");
  console.log(cursor);

  const params = new URLSearchParams({
    pageId,
    formId,
    // limit: String(limit),
  });

  if (cursor?.after) {
    params.append("after", cursor?.after);
  }
  try {
    const response = await fetch(
      `${NEW_BASE_URL}/api/v1/meta/leads?pageId=${pageId}&formId=${formId}&limit=${limit}`,
      {
        method: "GET", // or "POST" if you're sending data
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};

export const getLeadGenFromData = async (token, hId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/leadgen/get-lead-gen-form?hId=${encodeURIComponent(hId)}`,
      {
        method: "GET", // or "POST" if you're sending data
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};

export const addLeadGenForm = async (formData) => {
  try {
    const response = await fetch(url, {
      method: "POST", // or "POST" if you're sending data
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(formData),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};

export const getLeadGenFromDataList = async (token, hId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/leadgen/get-lead-gen-form?hId=${encodeURIComponent(hId)}`,
      {
        method: "GET", // or "POST" if you're sending data
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};

export const getLeadGenFromFields = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/leadgen/get-global-form-fields`, {
      method: "GET", // or "POST" if you're sending data
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export const UpdateLeadGenForm = async (token, formData) => {
  // console.log(formData);
  try {
    const response = await fetch(
      `${BASE_URL}/leadgen/edit-lead-gen-form?form_id=${encodeURIComponent(
        formData?.form_id,
      )}`,
      {
        method: "POST", // or "POST" if you're sending data
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      },
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};

export const deleteLeadGenForm = async (token, form_id) => {
  try {
    const response = await fetch(
      `${BASE_URL}/leadgen/delete-lead-gen-form?form_id=${encodeURIComponent(
        form_id,
      )}`,
      {
        method: "POST", // or "POST" if you're sending data
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};

export const deleteLMultipleeadGenForm = async (leadsId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/eazotel/delete-multiple-contact-queries`,
      {
        method: "DELETE", // or "POST" if you're sending data
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ids: leadsId,
        }),
      },
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};
