import axios from "axios";
import { BASE_URL } from "../../data/constant";

export const getEmails = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    return response?.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
