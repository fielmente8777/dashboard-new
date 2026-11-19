import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import IconButton from "../../../components/ui/IconButton";
import { useToast } from "../../../context/ToastContext";

// One value to paste somewhere else, with a copy button.
const CopyField = ({ label, value }) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      showToast({ message: "Could not copy. Select the text and copy it.", type: "error" });
    }
  };

  return (
    <div className="min-w-0">
      <span className="mb-1 block text-xs text-app-text-muted">{label}</span>
      <div className="flex items-center gap-1 rounded-lg border border-app-border! bg-app-surface-secondary py-1 pl-3 pr-1">
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-app-text" title={value}>
          {value}
        </code>
        <IconButton
          icon={copied ? Check : Copy}
          label={copied ? "Copied" : `Copy ${label.toLowerCase()}`}
          tone={copied ? "success" : "default"}
          size="sm"
          onClick={copy}
        />
      </div>
    </div>
  );
};

export default CopyField;
