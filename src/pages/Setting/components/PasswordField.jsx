import { HiOutlineEyeOff } from "react-icons/hi";
import { AiOutlineEye } from "react-icons/ai";
import { LABEL, FIELD } from "../constants/styles";

const PasswordField = ({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
}) => {
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter your ${label.toLowerCase()}`}
          autoComplete="off"
          className={`${FIELD} pr-11`}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-lg text-gray-400 dark:text-app-text-faint hover:bg-gray-100 dark:hover:bg-app-surface-secondary"
        >
          {visible ? (
            <AiOutlineEye size={18} />
          ) : (
            <HiOutlineEyeOff size={18} />
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordField;