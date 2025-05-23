import { createSlice } from "@reduxjs/toolkit";
import { getLeadGenFromData } from "../../services/api/MetaLeads.api";
import handleLocalStorage from "../../utils/handleLocalStorage";

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const leadGenFormSlice = createSlice({
  name: "Lead Gen Form",
  initialState,
  reducers: {
    setLeadGenFormStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    setLeadGenFormData: (state, action) => {
      const { Data } = action?.payload;
      state.data = Data;
      state.loading = false;
      // if (Object.keys(Data)?.length === 0) {
      //   state.data = null;
      //   state.loading = false;
      //   return;
      // } else {
      //   const fileterData = Data?.details?.filter(
      //     (item) => String(item?.hId) === String(handleLocalStorage("hid"))
      //   )[0];

      //   state.data = fileterData;
      //   state.loading = false;
      // }
    },
    setLeadGenFormError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  setLeadGenFormData,
  setLeadGenFormStart,
  setLeadGenFormEnd,
  setLeadGenFormError,
} = leadGenFormSlice.actions;

export default leadGenFormSlice.reducer;

// Thunk function to fetch user profile
export const fetchLeadGenForm = (token, hId) => async (dispatch) => {
  dispatch(setLeadGenFormStart());
  try {
    const data = await getLeadGenFromData(token, hId);
    console.log(data);
    dispatch(setLeadGenFormData(data));
    return { success: true, response: data };
  } catch (error) {
    dispatch(setLeadGenFormError(error.message));
    return { success: false, error: error.message };
  }
};
