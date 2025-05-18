import { BASE_URL } from "../../data/constant";

// handle api for getting all client enquires
export const getAllClientEnquires = async (
  token,
  name = null,
  status = null
) => {
  try {
    let queryParams = [];
    if (name) {
      queryParams.push(`name=${encodeURIComponent(name)}`);
    }

    if (status) {
      queryParams.push(`status=${encodeURIComponent(status)}`);
    }

    const queryString =
      queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
    const link = `${BASE_URL}/eazotel/get-all-contact-queries${queryString}`;
    const response = await fetch(link, {
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
