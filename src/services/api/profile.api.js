import axios from "axios";
import { BASE_URL } from "../../data/constant";

// handle api for getting user's profile details
export const getUserProfile = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/eazotel/getuser/${token}`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });

    return response?.data;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const getAuthUserProfile = async (token) => {
  if (token)
    try {
      if (token) {
        const response = await axios.get(`${BASE_URL}/user/user-details`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        return response?.data;
      }
    } catch (error) {
      console.error("Error getting user profile:", error);
    }
};
