import { BASE_URL } from "../../data/constant";

// hanlde api for getting all applicants
export const getChatbotData = async ({ ndid, hid }) => {
  try {
    const response = await fetch(
      // `${BASE_URL}/leadeazbot/get/dashboard?ndid=5617a084-5783-4bac-b299-bdb6e8e471bb&hid=4534543`,
      `${BASE_URL}/leadeazbot/get/dashboard?ndid=${ndid}&hid=${hid}`,
      {
        method: "GET", // or "POST" if you're sending data
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};

export const createChatbotData = async ({ hid, chatbotData }) => {
  // console.log("vbnkml,", hid, chatbotData)
  try {
    const response = await fetch(`${BASE_URL}/leadeazbot/create?hid=${hid}`, {
      method: "POST", // or "POST" if you're sending data
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(chatbotData),
    });
    const result = await response.json();
    // console.log(result)
    return result;
  } catch (error) {
    console.error("Error getting applicants:", error);
    throw error;
  }
};
