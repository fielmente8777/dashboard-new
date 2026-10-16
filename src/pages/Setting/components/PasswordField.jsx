import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Field, Input } from "../../../components/ui/Field";
import IconButton from "../../../components/ui/IconButton";

// A password input with its own show / hide toggle.
const PasswordField = ({ label, value, onChange, error, hint, autoComplete }) => {
  const [visible, setVisible] = useState(false);

  return (
    <Field label={label} error={error} hint={hint}>
      <div className="relative">
        <Input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className="pr-10"
        />
        <IconButton
          icon={visible ? EyeOff : Eye}
          label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          size="sm"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-1 top-1/2 -translate-y-1/2"
        />
      </div>
    </Field>
  );
};

export default PasswordField;
