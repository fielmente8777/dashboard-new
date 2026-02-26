import { NEW_BASE_URL } from "../../data/constant";

// hanlde api for getting all applicants
export const getAnalyticsService = async (startDate,endDate) => {
  try {
    const response = await fetch(`${NEW_BASE_URL}/api/v1/analytics/?hid=${localStorage.getItem("hid")}`, {
      method: "GET", // or "POST" if you're sending data
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const result = await response.json();
    console.log("Result kya hia",result?.result);
    return result;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};