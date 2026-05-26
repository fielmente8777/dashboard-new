import { NEW_BASE_URL } from "../../data/constant";

export const getMySubscription = async (token) => {
  try {
    const response = await fetch(`${NEW_BASE_URL}/api/v1/subscription/my`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || localStorage.getItem("token")}`,
      },
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching subscription:", error);
  }
};
