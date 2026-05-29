import React from "react";
import { FiCheck } from "react-icons/fi";

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between w-full px-4 py-6 bg-app-surface-secondary shadow-sm">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col  items-center ">
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors duration-300 ${step.completed
                ? "bg-green-500 border-green-500 text-white"
                : step.id === currentStep
                  ? "bg-primary border-white text-white"
                  : "bg-gray-100 border-primary/50! text-gray-600 "
                }`}
            >
              {step.completed ? <FiCheck size={18} /> : index + 1}
            </div>
            <span
              className={`mt-2 text-xs text-center font-medium transition-colors ${step.id === currentStep
                ? "text-primary"
                : step.completed
                  ? "text-green-600"
                  : "text-gray-500"
                }`}
            >
              {step.title}
            </span>
          </div>

          {index < steps.length - 1 && (
            <div className="flex-1 h-[2px] w-full bg-gray-300 -mt-4"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;
