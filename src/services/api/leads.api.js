import axios from "axios";
import { NEW_BASE_URL } from "../../data/constant";

// handle api for getting user's profile details
export const getLeads = async (query) => {
  try {
    const response = await axios.get(`${NEW_BASE_URL}/api/v1/leads/${localStorage.getItem("ndid")}/?${query}&hId=${localStorage.getItem("hid")}`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    return response?.data?.data;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};