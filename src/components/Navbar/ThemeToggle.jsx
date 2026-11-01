import { LuMoon, LuSun } from "react-icons/lu";
import { useColorMode } from "../../hooks/useColorMode";
import Icon from "../ui/Icon";

const ThemeToggle = ({ className = "" }) => {
  const { isDarkMode, toggleColorMode } = useColorMode();

  return (
    <button
      type="button"
      onClick={toggleColorMode}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Light mode" : "Dark mode"}
      className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-app-text-muted transition-colors hover:bg-app-surface-secondary hover:text-app-text ${className}`}
    >
      {isDarkMode ? (
        <Icon icon={LuSun} size="lg" />
      ) : (
        <Icon icon={LuMoon} size="lg" />
      )}
    </button>
  );
};

export default ThemeToggle;
