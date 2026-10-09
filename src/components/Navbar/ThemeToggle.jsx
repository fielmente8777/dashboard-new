import { useContext } from "react";
import { LuMoon, LuSun } from "react-icons/lu";
import DataContext from "../../context/DataContext";
import Icon from "../ui/Icon";

const ThemeToggle = ({ className = "" }) => {
  const { isDarkMode, toggleColorMode } = useContext(DataContext);

  return (
    <button
      type="button"
      onClick={toggleColorMode}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Light mode" : "Dark mode"}
      className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white ${className}`}
    >
      {isDarkMode ? (
        <Icon icon={LuSun} size="xl" />
      ) : (
        <Icon icon={LuMoon} size="xl" />
      )}
    </button>
  );
};

export default ThemeToggle;
