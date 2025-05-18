import axios from "axios";
import { BASE_URL } from "../../data/constant";

// handle auth api for login and register both**
export const UserLogin = async (userData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/eazotel/ceateuser`,
      {
        register: "false",
        emailId: userData.email,
        userName: "",
        accesskey: userData.password,
      },
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      }
    );
    return response?.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
