import { Check, CircleSlash } from "lucide-react";
import Icon from "../../../components/ui/Icon";
import { Stages } from "../../../data/constant";
import { PIPELINE_STAGES } from "../leadUtils";

const labelOf = (stage) =>
  Stages.find((item) => item.value === stage)?.label || stage;

// Where the lead is on the way to a booking. Each step can be clicked to
// move the lead there. A stage off the way (Dead Lead, Turn Away...) is
// shown as the end of the track.
const LeadStageTrack = ({ stage, disabled, onStageChange }) => {
  const current = PIPELINE_STAGES.indexOf(stage);
  const isOffTrack = Boolean(stage) && current === -1;

  return (
    <section className="rounded-xl border border-app-border! bg-app-surface p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-app-text">Lead progress</h2>
        {isOffTrack && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-app-text-muted">
            <Icon icon={CircleSlash} size="sm" />
            Currently: {labelOf(stage)}
          </span>
        )}
      </div>

      <ol className="flex items-center overflow-x-auto pb-1">
        {PIPELINE_STAGES.map((step, index) => {
          const done = !isOffTrack && index < current;
          const active = !isOffTrack && index === current;
          const won = active && step === "Converted";

          return (
            <li key={step} className="flex min-w-28 flex-1 items-center">
              <button
                type="button"
                disabled={disabled || active}
                onClick={() => onStageChange(step)}
                title={active ? undefined : `Move to ${labelOf(step)}`}
                className="group flex flex-col items-center gap-1.5 px-1 disabled:cursor-default"
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition ${
                    won
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : active
                        ? "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/30"
                        : done
                          ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "border-app-text-faint/40! bg-app-surface text-app-text-muted group-hover:border-blue-400! group-hover:text-blue-500"
                  }`}
                >
                  {done || won ? <Icon icon={Check} size="sm" /> : index + 1}
                </span>
                <span
                  className={`whitespace-nowrap text-xs ${
                    active ? "font-semibold text-app-text" : "text-app-text-muted"
                  }`}
                >
                  {labelOf(step)}
                </span>
              </button>
              {index < PIPELINE_STAGES.length - 1 && (
                <span
                  className={`mb-5 h-0.5 flex-1 rounded-full ${done ? "bg-blue-500" : "bg-app-text-faint/25"}`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default LeadStageTrack;
