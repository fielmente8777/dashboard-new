import axios from "axios";
import { BASE_URL } from "../../data/constant";
import handleLocalStorage from "../../utils/handleLocalStorage";

// handle auth api for login and register both**

export const getAllRomms = async (token, hid) => {
  try {
    const response = await axios.get(`${BASE_URL}/room/${token}/${hid}`);
    return response?.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
export const addRoom = async (formData, hid) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/room/create/${handleLocalStorage("token")}`,
      formData,
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
