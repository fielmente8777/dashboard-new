import JoditEditor from "jodit-react";
import { useContext, useMemo } from "react";
import DataContext from "../../context/DataContext";

// `value` is the starting content, not the live one: keep what the user types
// in your own state through `onChange`. Feeding it back into `value` on every
// keystroke makes the editor lose the cursor position.
const RichTextEditor = ({ value, onChange, height = 420, placeholder = "" }) => {
  const { isDarkMode } = useContext(DataContext);

  // must keep the same identity between renders or the editor re-initialises
  const config = useMemo(
    () => ({
      readonly: false,
      height,
      placeholder,
      theme: isDarkMode ? "dark" : "default",
    }),
    [height, placeholder, isDarkMode],
  );

  return <JoditEditor value={value} config={config} onChange={onChange} />;
};

export default RichTextEditor;
