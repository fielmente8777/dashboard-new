import { AlertTriangle } from "lucide-react";
import { getSectionConfig, isAlertSection } from "../utils/sectionConfig";
import NestedSection from "./NestedSection";
import Icon from "../../../components/ui/Icon";

// One top-level section of the knowledge base (kb_meta, business, ...) in
// its own card. Gap sections use the amber "needs attention" style.
const KnowledgeBaseSection = ({ sectionKey, value, onChange, onDelete }) => {
  const { title, icon, iconClassName } = getSectionConfig(sectionKey);
  const isAlert = isAlertSection(sectionKey);

  return (
    <section
      className={`rounded-xl border p-4 sm:p-5 ${
        isAlert
          ? "border-amber-500/40! bg-amber-500/5"
          : "border-app-border! bg-app-surface"
      }`}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className={`flex size-8 items-center justify-center rounded-lg ${
            isAlert ? "bg-amber-500/15 text-amber-500" : iconClassName
          }`}
        >
          <Icon icon={isAlert ? AlertTriangle : icon} size="lg" />
        </span>
        <h2 className="text-base font-semibold text-app-text">{title}</h2>
      </div>

      {isAlert && (
        <p className="mb-4 text-sm text-amber-700 dark:text-amber-200/80">
          Info the generator couldn&apos;t confirm, or found conflicting across
          pages. Review and fill these in.
        </p>
      )}

      <NestedSection
        value={value}
        path={[sectionKey]}
        onChange={onChange}
        onDelete={onDelete}
      />
    </section>
  );
};

export default KnowledgeBaseSection;
