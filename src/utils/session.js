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

export const clearSession = () => {
  localStorage.clear();
  removeCookie(TOKEN_KEY);
};
