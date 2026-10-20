import { createSlice } from "@reduxjs/toolkit";
import { responseBody } from "../api/baseApi";
import { talentApi } from "../api/talentApi";

const initialState = {
    applicants: [],
    loading: false,
    error: null,
}

const applicantsSlice = createSlice({
    name: "applicants",
    initialState,
    reducers: {
        getApplicantsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        getApplicantsSuccess: (state, action) => {
            state.loading = false;
            state.applicants = action.payload;
        },
        getApplicantsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const { getApplicantsRequest, getApplicantsSuccess, getApplicantsFailure } = applicantsSlice.actions;

export default applicantsSlice.reducer;

// Loads the applications into this slice. The answer's Data is used even for
// a 4xx, as before; only a failed request (offline) counts as an error.
// `token` keeps one cache entry per account.
export const fetchApplicants = (token) => async (dispatch) => {
    dispatch(getApplicantsRequest());
    try {
        const result = await dispatch(
            talentApi.endpoints.getApplications.initiate(token, { subscribe: false, forceRefetch: true }),
        );
        const data = responseBody(result)?.Data;
        dispatch(getApplicantsSuccess(data));
        return { success: true, response: data };
    } catch (error) {
        const message = error?.error || error?.message || "Could not load applications";
        dispatch(getApplicantsFailure(message));
        return { success: false, error: message };
    }
};
