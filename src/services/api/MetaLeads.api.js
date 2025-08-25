import { BASE_URL } from "../../data/constant";

const url = "https://nexon.eazotel.com/eazotel/addcontacts";

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
      }
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
      }
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
    // console.log(error);
  }
};

export const UpdateLeadGenForm = async (token, formData) => {
  // console.log(formData);
  try {
    const response = await fetch(
      `${BASE_URL}/leadgen/edit-lead-gen-form?form_id=${encodeURIComponent(
        formData?.form_id
      )}`,
      {
        method: "POST", // or "POST" if you're sending data
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      }
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
        form_id
      )}`,
      {
        method: "POST", // or "POST" if you're sending data
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
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
      }
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};
