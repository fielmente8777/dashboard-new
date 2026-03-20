import { BASE_URL } from "../../data/constant";

// hanlde api for getting all applicants
export const getApplicants = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/career/get-applications`, {
      method: "GET", // or "POST" if you're sending data
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    return result?.Data;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};
