import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import Button from "./Button";

// A read-only block of code with a Copy button.
const CodeBlock = ({ code, title, className = "" }) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      showToast({ message: "Could not copy. Select the code and copy it.", type: "error" });
    }
  };

  return (
    <div className={`overflow-hidden rounded-lg border border-app-border! ${className}`}>
      <div className="flex items-center justify-between gap-2 border-b border-app-border! bg-app-surface-secondary px-3 py-1.5">
        <span className="text-xs font-medium text-app-text-muted">{title}</span>
        <Button size="sm" variant="ghost" icon={copied ? Check : Copy} onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto bg-app-surface p-3 font-mono text-xs leading-relaxed text-app-text">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
