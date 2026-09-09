// import axios from "axios";
// import { BASE_URL } from "../../data/constant";

// export const getEmails = async () => {
//   try {
//     const response = await axios.get(`${BASE_URL}/`, {
//       headers: {
//         Accept: "application/json, text/plain, */*",
//         "Content-Type": "application/json",
//       },
//     });
//     return response?.data;
//   } catch (error) {
//     console.error("Error creating user:", error);
//     throw error;
//   }
// };


import axios from "axios";
import { BASE_URL } from "../../data/constant";

// Get emails
export const getEmails = async () => {
  const response = await axios.get(`${BASE_URL}/`);
  return response.data;
};

// Get single email
export const getEmailById = async (id) => {
  const response = await axios.get(`${BASE_URL}/${id}`);
  return response.data;
};

// Send email
export const sendEmail = async (payload) => {
  const response = await axios.post(`${BASE_URL}/send`, payload);
  return response.data;
};

// Save draft
export const createDraft = async (payload) => {
  const response = await axios.post(`${BASE_URL}/draft`, payload);
  return response.data;
};

// Update draft
export const updateDraft = async (id, payload) => {
  const response = await axios.put(`${BASE_URL}/draft/${id}`, payload);
  return response.data;
};

// Delete email/draft
export const deleteEmail = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
};