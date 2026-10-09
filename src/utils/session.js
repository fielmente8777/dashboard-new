import { removeCookie, setCookie } from "./handleCookies";

const TOKEN_KEY = "token";

// The token is kept in both places for now: the route guard reads the cookie,
// while the older API calls read localStorage directly.
export const getToken = () => localStorage.getItem(TOKEN_KEY) || null;

export const setSession = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  setCookie(TOKEN_KEY, token);
};

export const clearSession = () => {
  localStorage.clear();
  removeCookie(TOKEN_KEY);
};
