import { NEW_BASE_URL } from "../../data/constant";

export const sendWhatsAppMessage = async (payload) => {
  const isFormData = payload instanceof FormData;

  console.log(isFormData);

  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/messages/send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
      body: isFormData ? payload : JSON.stringify(payload),
    },
  );

  return await response.json();
};

export const markMessageAsRead = async (conversationId) => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/conversations/${conversationId}/read`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

  return await response.json();
};

export const getWhatsappConversation = async () => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/conversations/all`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

  // console.log(response);

  const data = await response.json();
  return data;
};

export const getWhatsappConversationMessages = async (conversationId) => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/conversations/${conversationId}/messages`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

  const data = await response.json();
  return data;
};

export const getWhatsappAccountDetails = async () => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/account/connection/details`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

  const data = await response.json();
  return data;
};

export const createWhatsAppMessageTemplate = async (payload) => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/message/template/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json();
  return data;
};

export const getWhatsAppMessageTemplates = async () => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/message/template/get`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );
  const data = await response.json();
  return data;
};

export const deleteWhatsAppMessageTemplate = async (payload) => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/message/template/delete`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    },
  );
  const data = await response.json();
  return data;
};
