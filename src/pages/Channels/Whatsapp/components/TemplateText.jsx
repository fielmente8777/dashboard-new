// Template text with its {{1}}, {{2}}… placeholders shown as small chips.
const TemplateText = ({ text = "", className = "" }) => (
  <p className={`whitespace-pre-line break-words ${className}`}>
    {String(text)
      .split(/(\{\{\s*\w+\s*\}\})/g)
      .map((part, index) =>
        /^\{\{\s*\w+\s*\}\}$/.test(part) ? (
          <span
            key={index}
            className="mx-0.5 rounded bg-blue-500/10 px-1 font-mono text-[0.85em] text-blue-600 dark:text-blue-400"
          >
            {part.replace(/\s/g, "")}
          </span>
        ) : (
          part
        ),
      )}
  </p>
);

export default TemplateText;
