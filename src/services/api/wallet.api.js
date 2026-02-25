import { NEW_BASE_URL } from "../../data/constant";

export const getWallet = async () => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/credits/`,
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
export const addSubscription = async () => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/user/subscribe?ndid=${localStorage.getItem("ndid")}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
       body: JSON.stringify(),
    },
  );

  return await response.json();
};