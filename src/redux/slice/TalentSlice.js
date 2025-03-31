import { createSlice } from "@reduxjs/toolkit";
import { getApplicants } from "../../services/api";

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

// Thunk function to fetch user profile
export const fetchApplicants = (token) => async (dispatch) => {
    dispatch(getApplicantsRequest());
    try {
        const data = await getApplicants(token);
        dispatch(getApplicantsSuccess(data));
        return { success: true, response: data };
    } catch (error) {
        dispatch(getApplicantsFailure(error.message));
        return { success: false, error: error.message };
    }
};