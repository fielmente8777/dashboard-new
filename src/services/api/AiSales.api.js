import { BASE_URL } from "../../data/constant";

// hanlde api for getting all applicants
export const getAiSalesAgentCall = async (body) => {
  const token = localStorage.getItem("token");
  try {
    const params = new URLSearchParams();
    if (body.limit) params.append("limit", "1");
    const response = await fetch(
      `${BASE_URL}/api/v1/calls?${params.toString()}`,
      {
        method: "GET", // or "POST" if you're sending data
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const result = await response.json();
    return result?.Data;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};
