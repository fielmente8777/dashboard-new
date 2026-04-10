import { NEW_BASE_URL } from "../../data/constant";

export const getAllCalls = async ({ page, limit, search }) => {
  const params = new URLSearchParams();
  params.append("hid", localStorage.getItem("hid"));
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);
  if (search) params.append("search", search);
  try {
    const response = await fetch(
      `${NEW_BASE_URL}/api/v1/call/getall?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
export const makeCall = async (payloadData) => {
  try {
    const response = await fetch(
      `${NEW_BASE_URL}/api/v1/call/auth/make-call?hid=${localStorage.getItem("hid")}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // authMiddleware expects this
        },
        body: JSON.stringify({
          fromNumber: payloadData.fromNumber,
          toNumber: payloadData.toNumber,
        }),
      },
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
export const updateCall = async (payloadData) => {
  try {
    const response = await fetch(
      `${NEW_BASE_URL}/api/v1/call/update-call/${payloadData?.sid}?hid=${localStorage.getItem("hid")}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // authMiddleware expects this
        },
        body: JSON.stringify(payloadData),
      },
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
