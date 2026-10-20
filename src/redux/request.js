import store from "./Store";
import { responseBody } from "./api/baseApi";

// Runs an RTK Query endpoint from plain code (an event handler, a useCallback)
// and resolves with RTK's result: { data } or { error }.
// Queries always fetch fresh; mutations are cleared from the store afterwards.
export const run = async (endpoint, arg) => {
  if (!endpoint.useMutation) {
    return store.dispatch(endpoint.initiate(arg, { subscribe: false, forceRefetch: true }));
  }
  const mutation = store.dispatch(endpoint.initiate(arg));
  try {
    return await mutation;
  } finally {
    mutation.reset();
  }
};

// Same, resolving with the answer's body, also for a 4xx/5xx - see responseBody.
export const request = async (endpoint, arg) => responseBody(await run(endpoint, arg));

// the location the old service helpers used: the one selected right now
export const selectedHid = () => store.getState().userProfile.hid;
