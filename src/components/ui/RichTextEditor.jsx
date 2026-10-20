import JoditEditor from "jodit-react";
import { useMemo } from "react";

// What a page or a blog post needs; the rest of Jodit's buttons stay out.
const BUTTONS = [
  "paragraph", "|",
  "bold", "italic", "underline", "strikethrough", "|",
  "ul", "ol", "|",
  "fontsize", "brush", "align", "|",
  "link", "image", "table", "hr", "|",
  "undo", "redo", "|",
  "source", "fullsize",
];
// tablets and phones: the everyday buttons, the rest sit behind "⋮"
const BUTTONS_SM = ["paragraph", "bold", "italic", "underline", "|", "ul", "ol", "|", "link", "image", "|", "dots"];
const BUTTONS_XS = ["bold", "italic", "ul", "ol", "link", "dots"];

// `value` is the starting content, not the live one: keep what the user types
// in your own state through `onChange`. Feeding it back into `value` on every
// keystroke makes the editor lose the cursor position.
// Colours come from the app tokens (index.css), so light and dark mode need
// no theme switch here.
const RichTextEditor = ({ value, onChange, height = 420, placeholder = "" }) => {
  // must keep the same identity between renders or the editor re-initialises
  const config = useMemo(
    () => ({
      readonly: false,
      height,
      placeholder,
      buttons: BUTTONS,
      buttonsMD: BUTTONS,
      buttonsSM: BUTTONS_SM,
      buttonsXS: BUTTONS_XS,
      toolbarAdaptive: true,
      toolbarSticky: false,
      showXPathInStatusbar: false,
      hidePoweredByJodit: true,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
    }),
    [height, placeholder],
  );

  return <JoditEditor value={value} config={config} onChange={onChange} />;
};

export default RichTextEditor;
