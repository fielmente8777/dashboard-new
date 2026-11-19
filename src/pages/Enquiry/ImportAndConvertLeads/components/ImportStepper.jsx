const steps = ["Upload", "Column Mapping", "Preview", "Import"];

export default function ImportStepper({ currentStep }) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const active = currentStep === index + 1;

          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold
                  ${active ? "bg-indigo-600" : "bg-slate-300"}`}
                >
                  {index + 1}
                </div>

                <span className="ml-3 font-medium">{step}</span>
              </div>

              {index !== steps.length - 1 && (
                <div className="flex-1 h-px bg-slate-200 mx-5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
