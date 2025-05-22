import { BASE_URL } from "../../data/constant";

export const getLeadGenFromData = async (token, hId) => {
  try {
    const response = await fetch(`${BASE_URL}/leadgen/get-lead-gen-form?hId=${encodeURIComponent(hId)}`, {
      method: "GET", // or "POST" if you're sending data
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    console.log(result)
    return result;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};
