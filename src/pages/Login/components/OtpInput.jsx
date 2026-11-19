import { useRef } from "react";

// One box per digit. Typing moves forward, Backspace moves back, and pasting
// a full code fills every box. `value` is the code as a single string.
const OtpInput = ({ value = "", onChange, length = 6, invalid = false, id }) => {
  const inputsRef = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  const focusBox = (index) => {
    const box = inputsRef.current[Math.max(0, Math.min(length - 1, index))];
    box?.focus();
    box?.select();
  };

  const setDigitsFrom = (start, text) => {
    const clean = text.replace(/\D/g, "");
    if (!clean) return;
    const next = [...digits];
    clean
      .slice(0, length - start)
      .split("")
      .forEach((digit, offset) => {
        next[start + offset] = digit;
      });
    onChange(next.join(""));
    focusBox(start + clean.length);
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = "";
      } else if (index > 0) {
        next[index - 1] = "";
        focusBox(index - 1);
      }
      onChange(next.join(""));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  return (
    <div className="flex gap-2 sm:gap-3" role="group" aria-label="Verification code">
      {digits.map((digit, index) => (
        <input
          key={index}
          id={index === 0 ? id : undefined}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={length}
          value={digit}
          aria-label={`Digit ${index + 1}`}
          aria-invalid={invalid}
          onChange={(event) => setDigitsFrom(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          onPaste={(event) => {
            event.preventDefault();
            setDigitsFrom(index, event.clipboardData.getData("text"));
          }}
          onFocus={(event) => event.target.select()}
          className="w-full min-w-0 h-12 sm:h-14 rounded-lg bg-app-surface text-center text-lg font-semibold text-app-text outline-none ring-1 ring-inset ring-(--app-border-strong) transition-shadow focus:ring-2 focus:ring-ternary aria-[invalid=true]:ring-red-500"
        />
      ))}
    </div>
  );
};

export default OtpInput;
