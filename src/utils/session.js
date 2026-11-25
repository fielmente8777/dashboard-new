import { getCookie, removeCookie, setCookie } from "./handleCookies";

const TOKEN_KEY = "token";

// The token is kept in both places for now: the route guard reads the cookie,
// while the older API calls read localStorage directly.
export const getToken = () => localStorage.getItem(TOKEN_KEY) || null;

// An owner who switches into a client account gets that account's token in
// localStorage, while the cookie keeps their own sign-in:
// the account whose data is shown
export const getAccountToken = () => getToken() || getCookie(TOKEN_KEY) || null;
// the person signed in
export const getSignedInToken = () => getCookie(TOKEN_KEY) || getToken();

export const setSession = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  setCookie(TOKEN_KEY, token);
};

// Choices that belong to this browser, not to the account: they survive
// signing out, an expired session and switching accounts. (Wiping them made
// the dashboard fall back to the system's light/dark mode after a refresh.)
const DEVICE_PREFERENCES = ["eazotel_color_mode"];

// Empties localStorage except the device preferences above.
export const clearAccountStorage = () => {
  const kept = DEVICE_PREFERENCES.map((key) => [key, localStorage.getItem(key)]);
  localStorage.clear();
  kept.forEach(([key, value]) => {
    if (value !== null) localStorage.setItem(key, value);
  });
};

export const clearSession = () => {
  clearAccountStorage();
  removeCookie(TOKEN_KEY);
};
