import { ArrowRight, ExternalLink, FileText, Phone, Reply, Search } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../../../../components/ui/Badge";
import Icon from "../../../../components/ui/Icon";
import { Input } from "../../../../components/ui/Field";
import { EmptyState } from "../../../../components/ui/States";
import Tabs from "../../../../components/ui/Tabs";
import { LIBRARY_TEMPLATES } from "./templateLibraryData";
import TemplateText from "./TemplateText";
import { CATEGORY_TONE } from "./templateUtils";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "UTILITY", label: "Utility" },
  { value: "MARKETING", label: "Marketing" },
  { value: "AUTHENTICATION", label: "Authentication" },
];
const BUTTON_ICONS = { URL: ExternalLink, CALL: Phone, PHONE_NUMBER: Phone, QUICK_REPLY: Reply };

const matches = (template, term) =>
  [template.name, template.header, template.body].some((value) =>
    value?.toLowerCase().includes(term),
  );

// Ready-made templates; picking one opens it in "Create template".
const TemplateLibrary = ({ onSelectTemplate }) => {
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  const term = search.trim().toLowerCase();
  const searched = useMemo(
    () => (term ? LIBRARY_TEMPLATES.filter((t) => matches(t, term)) : LIBRARY_TEMPLATES),
    [term],
  );
  const shown = category ? searched.filter((t) => t.category === category) : searched;

  const tabs = CATEGORIES.map((c) => ({
    ...c,
    label: `${c.label} (${c.value ? searched.filter((t) => t.category === c.value).length : searched.length})`,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-app-text">Template library</h2>
        <p className="text-xs text-app-text-muted">
          Ready-made messages for hotels. Pick one to edit it and send it to Meta for
          approval.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-80">
          <Icon
            icon={Search}
            size="sm"
            tone="faint"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates"
            className="pl-9"
          />
        </div>
        <Tabs tabs={tabs} value={category} onChange={setCategory} />
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No templates match"
          description="Try another word or category."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelectTemplate(template)}
              className="group flex flex-col rounded-xl border border-app-border! bg-app-surface p-4 text-left transition hover:border-blue-500! hover:shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-app-text">{template.header}</h3>
                <Badge tone={CATEGORY_TONE[template.category]}>
                  {template.category.toLowerCase()}
                </Badge>
              </div>

              {/* message bubble */}
              <div className="flex-1 rounded-lg rounded-tl-none bg-app-surface-secondary p-3">
                <TemplateText
                  text={template.body}
                  className="line-clamp-4 text-sm text-app-text"
                />
                {template.footer && (
                  <p className="mt-2 text-xs text-app-text-faint">{template.footer}</p>
                )}
              </div>

              {template.buttons?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {template.buttons.map((button, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded-md border border-app-border! px-2 py-1 text-xs text-blue-600 dark:text-blue-400"
                    >
                      <Icon icon={BUTTON_ICONS[button.type] || Reply} size="xs" />
                      {button.text}
                    </span>
                  ))}
                </div>
              )}

              <span className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 transition-all group-hover:gap-2 dark:text-blue-400">
                Use this template <Icon icon={ArrowRight} size="xs" />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateLibrary;
