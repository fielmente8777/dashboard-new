import { createSlice } from "@reduxjs/toolkit";

const THEME_STORAGE_KEY = "eazotel_color_mode";

const getInitialColorMode = () => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    // ignore storage errors
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const themeSlice = createSlice({
  name: "theme",
  initialState: { colorMode: getInitialColorMode() },
  reducers: {
    colorModeChanged: (state, action) => {
      state.colorMode = action.payload;
    },
  },
});

const { colorModeChanged } = themeSlice.actions;

export const selectColorMode = (state) => state.theme.colorMode;
export const selectIsDarkMode = (state) => state.theme.colorMode === "dark";

// The page side of a colour mode: the `dark` class, the saved choice and the
// browser's theme colour. Called once at start-up and on every change.
export const applyColorMode = (mode) => {
  document.documentElement.classList.toggle("dark", mode === "dark");

  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // ignore storage errors
  }

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", mode === "dark" ? "#0f1419" : "#1e2d52");
  }
};

export const setColorMode = (mode) => (dispatch) => {
  applyColorMode(mode);
  dispatch(colorModeChanged(mode));
};

// Light <-> dark as one smooth cross-fade instead of an instant flip.
export const toggleColorMode = () => (dispatch, getState) => {
  const next = selectColorMode(getState()) === "dark" ? "light" : "dark";
  const root = document.documentElement;

  // The browser needs the new colours in place before this callback returns,
  // which setColorMode does synchronously.
  const apply = () => dispatch(setColorMode(next));

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reduceMotion) {
    apply();
  } else if (document.startViewTransition) {
    document.startViewTransition(apply);
  } else {
    root.classList.add("theme-switching");
    apply();
    setTimeout(() => root.classList.remove("theme-switching"), 450);
  }
};

export default themeSlice.reducer;
