import { createSlice } from "@reduxjs/toolkit";
import reducer from "./bookingEngine"
import { getBookingEngineDetails } from "../../services/api/bookingEngine";

const initialState = {
    engineDetails: {},
    loading: false,
    error: null,
}


const engineDetailsSlice = createSlice({
    name: "engineDetails",
    initialState,
    reducers: {
        engineDetailsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        setEngineDetails: (state, action) => {
            state.loading = false;
            state.engineDetails = action.payload;
        },
        engineDetailsFaliur: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        }
    },
});

export const { engineDetailsRequest, setEngineDetails, engineDetailsFaliur } = engineDetailsSlice.actions;

export default engineDetailsSlice.reducer;


export const getEngineDetails = () => async (dispatch) => {
    dispatch(engineDetailsRequest());
    try {
        const data = await getBookingEngineDetails();
        dispatch(setEngineDetails(data?.Details));
        return { success: true, reponse: data };
    } catch (error) {
        dispatch(engineDetailsFaliur(error.message));
        return { success: false, error: error.message };
    }
}