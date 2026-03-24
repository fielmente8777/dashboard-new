import { NEW_BASE_URL } from "../../data/constant";

export const getNotificationData = async () => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/setting/get-config?hid=${localStorage.getItem("hid")}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

  return await response.json();
};
export const editNotificationData = async (payload) => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/setting/update-config?hid=${localStorage.getItem("hid")}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
       body: JSON.stringify(payload),
    },
  );

  return await response.json();
};