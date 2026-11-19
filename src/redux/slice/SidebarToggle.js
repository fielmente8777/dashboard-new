import { createSlice } from "@reduxjs/toolkit";
import { DESKTOP_QUERY } from "../../hooks/useMediaQuery";

// isOpen means: full width on desktop/tablet (closed = icon rail),
// drawer visible on mobile (closed = hidden).
const toggleSlice = createSlice({
  name: "toggle",
  initialState: {
    // start open on desktop only; tablets start as a rail, phones start hidden
    isOpen: window.matchMedia(DESKTOP_QUERY).matches,
  },
  reducers: {
    toggleSideBar: (state) => {
      state.isOpen = !state.isOpen;
    },
    open: (state) => {
      state.isOpen = true;
    },
    close: (state) => {
      state.isOpen = false;
    },
  },
});

export const { toggleSideBar, open, close } = toggleSlice.actions;
export default toggleSlice.reducer;
