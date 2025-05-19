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

export const CreateUser = async (body) => {
  try {
    const response = await fetch(
      `${BASE_URL}/user/create/${localStorage.getItem("token")}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const UpdateUser = async (body) => {
  try {
    const response = await fetch(
      `${BASE_URL}/user/edit/${localStorage.getItem("token")}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.log(error);
  }
};
