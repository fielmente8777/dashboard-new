import { sessionApi } from "./api/sessionApi";
import { getAccountToken, getSignedInToken } from "../utils/session";

// Two tokens, as the dashboard always had them. They are the same token
// unless an owner has switched into a client account (useClientAccounts):
//   getSignedInToken() - who is signed in (the owner keeps their role)
//   getAccountToken()  - whose hotels, website and plan are shown
const getToken = getAccountToken;

// Loading and refreshing what every page needs about the signed-in account.
// The answers land in the userProfile, subscription and hotelsWebsiteData
// slices (see their extraReducers).

const { getUserProfile, getAuthUser, getWebsiteData, getSubscription } =
  sessionApi.endpoints;

// the cache keeps the answers; nothing has to stay subscribed
const ONCE = { subscribe: false };
const FRESH = { subscribe: false, forceRefetch: true };

// Starts whatever is not loaded yet for this token. Resolves once the profile
// and the signed-in user are in (cached answers resolve at once).
export const loadSession =
  ({ force = false } = {}) =>
  (dispatch) => {
    const token = getToken();
    if (!token) return Promise.resolve();
    const options = force ? FRESH : ONCE;

    dispatch(getSubscription.initiate(token, options));
    return Promise.all([
      dispatch(getUserProfile.initiate(token, options)),
      dispatch(getAuthUser.initiate(getSignedInToken() || token, options)),
    ]);
  };

// The website data of one location (the selected one by default).
export const loadWebsiteData =
  (hid, { force = false } = {}) =>
  (dispatch, getState) => {
    const token = getToken();
    if (!token) return Promise.resolve();
    const id = hid ?? getState().userProfile.hid;
    return dispatch(
      getWebsiteData.initiate(
        { token, hid: id == null ? null : String(id) },
        force ? FRESH : ONCE,
      ),
    );
  };

export const refreshProfile = () => (dispatch) => {
  const token = getToken();
  if (token) return dispatch(getUserProfile.initiate(token, FRESH));
};

export const refreshSubscription = () => (dispatch) => {
  const token = getToken();
  if (token) return dispatch(getSubscription.initiate(token, FRESH));
};

export const refreshWebsiteData = (hid) => loadWebsiteData(hid, { force: true });
