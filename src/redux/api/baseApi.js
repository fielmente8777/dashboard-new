import { ROUTES } from "../../routes/paths";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URLS } from "../../config/env";
import { clearSession, getToken } from "../../utils/session";
import { isAiCreditsBlock, notifyAiCreditsBlocked } from "../../utils/aiCreditsEvents";

const rawBaseQuery = fetchBaseQuery({ baseUrl: "" });

// Every request goes through here. Per endpoint, `extraOptions` can set:
//   service  - which backend to call: "core" (default) | "node" | "salesAgent" | "grm"
//   skipAuth - true for public endpoints (login, forgot password, ...)
const baseQuery = async (args, api, extraOptions = {}) => {
  const { service = "core", skipAuth = false } = extraOptions;
  const request = typeof args === "string" ? { url: args } : args;

  const headers = new Headers(request.headers);
  const token = skipAuth ? null : getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const result = await rawBaseQuery(
    { ...request, url: `${API_URLS[service]}${request.url}`, headers },
    api,
    extraOptions,
  );

  // An AI request stopped by the credit wallet: tell the user once (with a
  // recharge link) and refresh the wallet / AI status everywhere.
  if (result.error && isAiCreditsBlock(result.error.status, result.error.data)) {
    notifyAiCreditsBlocked(result.error.data);
    api.dispatch(baseApi.util.invalidateTags(["AiWallet"]));
  }

  // Session expired or token rejected: drop it and go back to login.
  if (token && result.error?.status === 401) {
    clearSession();
    window.location.assign(ROUTES.LOGIN);
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [],
  endpoints: () => ({}),
});

// The answer's body, also for a 4xx/5xx - what the old fetch helpers in
// services/api returned, so pages that read `success` / `responseMessage`
// from it keep working:
//   const response = responseBody(await getTemplates(hid));
// Throws when no answer came back at all (offline, not JSON), as fetch did.
export const responseBody = (result) => {
  if (!result.error) return result.data;
  if (typeof result.error.status === "number") return result.error.data;
  throw result.error;
};

// Providers such as Exotel answer with XML; keep only its <Message> text
// so the toast never shows raw markup.
const readableDetails = (details) => {
  if (typeof details !== "string") return "";
  if (!details.trim().startsWith("<")) return details;
  const match = details.match(/<Message>([\s\S]*?)<\/Message>/i);
  return match ? match[1].trim() : "";
};

export const getApiErrorMessage = (error, fallback = "Something went wrong") => {
  if (error?.status === "FETCH_ERROR") {
    return "Unable to reach the server. Please check your connection.";
  }
  const data = error?.data;
  // the Node APIs answer { error, details? }, the core API { Message }
  const nodeError = typeof data?.error === "string" ? data.error : "";
  const details = readableDetails(data?.details);
  if (nodeError && details) return `${nodeError}: ${details}`;
  return (
    data?.Message ||
    data?.message ||
    data?.msg ||
    data?.responseMessage ||
    nodeError ||
    fallback
  );
};
