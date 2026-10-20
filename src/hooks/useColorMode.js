import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectColorMode,
  toggleColorMode as toggleColorModeAction,
} from "../redux/slice/themeSlice";

// Light / dark mode of the dashboard.
export const useColorMode = () => {
  const dispatch = useDispatch();
  const colorMode = useSelector(selectColorMode);
  const toggleColorMode = useCallback(
    () => dispatch(toggleColorModeAction()),
    [dispatch],
  );

  return { colorMode, isDarkMode: colorMode === "dark", toggleColorMode };
};
