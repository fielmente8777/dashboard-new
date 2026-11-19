import axios from "axios";
import { NODE_BASE_URL } from "../../data/constant";
import handleLocalStorage from "../../utils/handleLocalStorage";

export const BOOKING_DEEP_LINK_API = (
  import.meta.env.VITE_BOOKING_DEEP_LINK_API_URL || `${NODE_BASE_URL.replace(/\/$/, "")}/booking/deep-links`
).replace(/\/$/, "");
export const isLocalBookingDemo = import.meta.env.DEV && import.meta.env.VITE_BOOKING_DEEP_LINK_DEMO === "true";
const headers = () => ({
  Authorization: `Bearer ${isLocalBookingDemo ? "local-deep-link-demo" : handleLocalStorage("token") || ""}`,
});

export async function listBookingDeepLinks(hid, page = 1, signal) {
  const { data } = await axios.get(BOOKING_DEEP_LINK_API, { params: { hid, page }, headers: headers(), signal });
  return data.result;
}

export async function createBookingDeepLink(hid, payload) {
  const { data } = await axios.post(BOOKING_DEEP_LINK_API, payload, { params: { hid }, headers: headers() });
  return data.result;
}

export async function setBookingDeepLinkActive(hid, code, active) {
  const { data } = await axios.patch(`${BOOKING_DEEP_LINK_API}/${encodeURIComponent(code)}`, { active }, { params: { hid }, headers: headers() });
  return data.result;
}

export async function resolveBookingDeepLink(code, signal) {
  const { data } = await axios.get(`${BOOKING_DEEP_LINK_API}/public/${encodeURIComponent(code)}`, { signal });
  return data.result;
}

export const bookingShareUrl = (code) => `${BOOKING_DEEP_LINK_API}/go/${encodeURIComponent(code)}`;
export const bookingPrefillScriptUrl = `${BOOKING_DEEP_LINK_API}/prefill.js`;

export function clientIntegrationHtml() {
  return [
    `<script defer src="${bookingPrefillScriptUrl}"></script>`,
    '<!-- Add these attributes to your existing booking form fields. -->',
    '<input type="date" name="checkIn" data-eazotel-field="checkIn">',
    '<input type="date" name="checkOut" data-eazotel-field="checkOut">',
    '<input type="number" name="adults" data-eazotel-field="adults">',
    '<input type="number" name="children" data-eazotel-field="children">',
    '<input name="promoCode" data-eazotel-field="promoCode">',
    '<!-- React/custom widgets can read window.EazotelBookingPrefill or listen for the document event eazotel:prefill. -->',
  ].join("\n");
}
