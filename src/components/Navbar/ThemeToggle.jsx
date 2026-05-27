import { useContext } from "react";
import { LuMoon, LuSun } from "react-icons/lu";
import DataContext from "../../context/DataContext";

const ThemeToggle = ({ className = "" }) => {
  const { isDarkMode, toggleColorMode } = useContext(DataContext);

  return (
    <button
      type="button"
      onClick={toggleColorMode}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Light mode" : "Dark mode"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20 hover:scale-105 active:scale-95 ${className}`}
    >
      {isDarkMode ? (
        <LuSun className="h-4 w-4" />
      ) : (
        <LuMoon className="h-4 w-4" />
      )}
    </button>
  );
};

export default ThemeToggle;
