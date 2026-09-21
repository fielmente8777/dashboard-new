// Suggested location: src/utils/dashboardApi.js
import { NEW_BASE_URL } from "../data/constant";

export const SALES_AGENT_BASE_URL = NEW_BASE_URL;

export const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getTenantContext = () => {
  let hid = localStorage.getItem("hid");
  let ndid = localStorage.getItem("ndid");

  if (!hid) {
    hid = crypto.randomUUID();
    localStorage.setItem("hid", hid);
  }

  if (!ndid) {
    ndid = crypto.randomUUID();
    localStorage.setItem("ndid", ndid);
  }

  return { hid, ndid };
};
