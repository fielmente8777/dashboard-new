import { useState } from "react";
import { AiOutlineEye } from "react-icons/ai";
import { HiOutlineEyeOff } from "react-icons/hi";
import { inputClassName } from "./formStyles";

// Accepts the same props as <input>, so it works with react-hook-form's register()
const PasswordInput = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full relative">
      <input
        type={showPassword ? "text" : "password"}
        className={`${inputClassName} pr-12`}
        {...props}
      />

      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? "Hide password" : "Show password"}
        className="absolute right-1 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center rounded-md text-app-text-faint hover:text-app-text transition-colors"
      >
        {showPassword ? (
          <AiOutlineEye size={20} />
        ) : (
          <HiOutlineEyeOff size={20} />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;
