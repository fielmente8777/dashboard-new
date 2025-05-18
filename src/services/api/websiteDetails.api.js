import { BASE_URL } from "../../data/constant";

// handle api for getting website details **
export const GetwebsiteDetails = async (token) => {
  try {
    // const link = `${BASE_URL}/cms/get/website/sparvhospitality`;
    // const response = await fetch(link, {
    //     method: "GET", // or "POST" if you're sending data
    //     headers: {
    //         "Content-Type": "application/json",
    //         "Authorization": `Bearer ${token}`
    //     }
    // });
    const response = await fetch(`${BASE_URL}/cms/get/navbar?id=${token}`, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, /",
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    return result?.WebsiteData || result?.Hotels;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};
