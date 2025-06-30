import { BASE_URL } from "../../data/constant";

// handle api for getting website details **
export const GetwebsiteDetails = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/cms/get/navbar?id=${token}`, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, /",
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    // return result?.WebsiteData || result?.Hotels;
    return result;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};
