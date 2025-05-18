import axios from "axios";
import { BASE_URL } from "../../data/constant";

// handle api for getting user management data
export const fetchUserManagementData = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/user/${token}`, {
      method: "GET", // Use 'GET' method
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
