import { NEW_BASE_URL } from "../../data/constant";

export const connectWhatsapp = async () => {
  const ndid = localStorage.getItem("ndid");
  const hid = localStorage.getItem("hid");
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/whatsapp/meta/connect?ndid=${ndid}&hid=${hid}`,
    {
      method: "POST",
      headers: {
        "x-ndid": ndid,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );

  const data = await response.json();

  return data;
};

export const connectMetaLead = async () => {
  const ndid = localStorage.getItem("ndid");
  const hid = localStorage.getItem("hid");
  const response = await fetch(
    `${NEW_BASE_URL}/api/v1/auth/meta/start?ndid=${ndid}&hid=${hid}`,
    {
      method: "GET",
      headers: {
        "x-ndid": ndid,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );

  const data = await response.json();

  return data;
};

export const disconnectIntegration = async (id) => {
  const response = await fetch(`${NEW_BASE_URL}/api/v1/integration/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ id }),
  });

  const data = await response.json();

  return data;
};
