import { NEW_BASE_URL } from "../../data/constant";

export const sendWhatsAppMessage = async (payload) => {
  const isFormData = payload instanceof FormData;
  const hid = localStorage.getItem("hid");

  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/messages/send?hid=${hid}`,
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

export const deleteWhatsAppMessage = async (payload) => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/messages/delete`,
    {
      method: "DELETE",
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
    `${NEW_BASE_URL}/api/v1/whatsapp/conversations/all?hid=${localStorage.getItem("hid")}`,
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

export const deleteConversation = async ({ conversationId, phone }) => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/conversations/${conversationId}/delete?hid=${localStorage.getItem("hid")}&phone=${phone}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

  const data = await response.json();
  return data;
};

export const getWhatsappAccountDetails = async () => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/account/connection/details?hid=${localStorage.getItem("hid")}`,
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

export const getWhatsAppProfile = async () => {
  const response = await fetch(`${NEW_BASE_URL}/api/v1/whatsapp/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data = await response.json();
  return data;
};

export const updateWhatsAppProfile = async (payload) => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/profile/update`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: payload,
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
  const hid = localStorage.getItem("hid");
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/message/template/get?hid=${hid}`,
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

export const updateAutoMessageConfig = async (payload) => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/account/${payload?.phoneNumberId}/automessageConfig/update`,
    {
      method: "PUT",
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

export const addWhatsAppLead = async (payload) => {
  const hid = localStorage.getItem("hid");
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/lead/create?hid=${hid}`,
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

export const getWhatsAppLeads = async () => {
  const response = await fetch(`${NEW_BASE_URL}/api/v1/whatsapp/lead/get`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  const data = await response.json();
  return data;
};

// whatsapp flow for whatsapp messages flows
export const getWhatsAppFlows = async () => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/flow?hid=${localStorage.getItem("hid")}`,
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

export const getFlowSession = async (payload) => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/flow-session?hid=${localStorage.getItem("hid")}&ndid=${localStorage.getItem("ndid")}&phone=${payload?.phone}`,
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

export const updateFlowSession = async (payload) => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/flow-session?hid=${localStorage.getItem("hid")}&ndid=${localStorage.getItem("ndid")}`,
    {
      method: "PUT",
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

// for whatsapp flow
export const createWhatAppFlow = async (payload) => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/flow/create?hid=${localStorage.getItem("hid")}`,
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

export const getWhatsAppFlowScreens = async () => {
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/flow/get?hid=${localStorage.getItem("hid")}`,
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
