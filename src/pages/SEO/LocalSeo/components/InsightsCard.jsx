import { Lightbulb, Sparkles } from "lucide-react";
import Card from "../../../../components/ui/Card";
import Icon from "../../../../components/ui/Icon";

const Insight = ({ insight }) => (
  <li className="flex items-start gap-3 rounded-lg bg-app-surface-secondary/60 p-3">
    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
      <Icon icon={insight.icon} size="lg" />
    </span>
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-app-text-muted">
        {insight.chip}
      </p>
      <h3 className="mt-0.5 text-sm font-semibold text-app-text">{insight.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-app-text-muted">
        {insight.parts.map((part, i) =>
          typeof part === "string" ? (
            part
          ) : (
            <span key={i} className="font-semibold text-app-text">
              {part.strong}
            </span>
          ),
        )}
      </p>
    </div>
  </li>
);

// The tips from buildInsights(). Grows to fill the column it sits in.
const InsightsCard = ({ insights, className = "" }) => (
  <Card
    className={`flex flex-col ${className}`}
    title={
      <span className="flex items-center gap-1.5">
        <Icon icon={Sparkles} tone="primary" /> Smart insights
      </span>
    }
  >
    {insights.length ? (
      <ul className="anim-stagger space-y-2.5">
        {insights.map((insight) => (
          <Insight key={insight.title} insight={insight} />
        ))}
      </ul>
    ) : (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
        <Icon icon={Lightbulb} size="2xl" tone="faint" />
        <p className="max-w-xs text-sm text-app-text-muted">
          Tips show up here once your keywords have rankings.
        </p>
      </div>
    )}
  </Card>
);

export default InsightsCard;
