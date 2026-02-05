import { createSlice } from "@reduxjs/toolkit";
import { getAllRomms } from "../../services/api/bookingEngine";

const initialState = {
  allRooms: [],
  loading: false,
  error: null,
};

const adsLeadsSheetSlice = createSlice({
  name: "adsLeadsSheet",
  initialState,
  reducers: {
    allRoomRequest: (state) => {
      state.isAuthLoading = true;
      state.loading = true;
      state.error = null;
    },
    setAllRooms: (state, action) => {
      state.loading = false;
      state.allRooms = action.payload;
    },
    allRoomsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { allRoomRequest, setAllRooms, allRoomsFailure } =
  adsLeadsSheetSlice.actions;

export default adsLeadsSheetSlice.reducer;

// Thunk function to fetch user profile
export const fetchAllRooms = (token, hid) => async (dispatch) => {
  dispatch(allRoomRequest());
  try {
    const data = await getAllRomms(token, hid);
    dispatch(setAllRooms(data?.data));
    return { success: true, response: data };
  } catch (error) {
    dispatch(allRoomsFailure(error.message));
    return { success: false, error: error.message };
  }
};
