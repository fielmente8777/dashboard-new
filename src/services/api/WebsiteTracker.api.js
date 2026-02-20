import { SALES_AGEENT_BASE_URL } from "../../data/constant";

// hanlde api for getting all applicants
export const getAllVisitors = async (body) => {
  const token = localStorage.getItem("token");
  try {
    // const params = new URLSearchParams();
    // if (body.limit) params.append("limit", "1");
    const response = await fetch(
      `${SALES_AGEENT_BASE_URL}/api/v1/webtrack/visitors?skip=${body.skip}&limit=${body.limit}`,
      {
        method: "GET", // or "POST" if you're sending data
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const result = await response.json();
    // console.log("jsdfsdkjfhsdhfk",result);
    return result?.data;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};
export const getAllVisitorsActivities = async (body) => {
  const token = localStorage.getItem("token");
  try {
    // const params = new URLSearchParams();
    // if (body.limit) params.append("limit", "1");
    const response = await fetch(
      `${SALES_AGEENT_BASE_URL}/api/v1/webtrack/sessions?skip=${body.skip}&limit=${body.limit}`,
      {
        method: "GET", // or "POST" if you're sending data
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const result = await response.json();
    // console.log("jsdfsdkjfhsdhfk",result);
    return result?.data;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};
