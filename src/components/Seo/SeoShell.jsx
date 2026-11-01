import { ChevronRight, Globe, MapPin } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { PAGES, dashboardPath } from "../../routes/paths";
import Icon from "../ui/Icon";

const TOOLS = [
  { page: PAGES.SEO_LOCAL, label: "Local SEO", icon: MapPin },
  { page: PAGES.SEO_WEBSITE, label: "Website SEO", icon: Globe },
];

// One small fact in the header row under the title (place, last scan...).
export const MetaItem = ({ icon, children }) => (
  <span className="inline-flex min-w-0 items-center gap-1.5">
    {icon && <Icon icon={icon} size="sm" tone="faint" />}
    {children}
  </span>
);

// Frame of the SEO dashboards: breadcrumb, title, a row of facts (`meta`),
// the page actions and the tabs between Local and Website SEO. Everything
// inside sits in .seo-scope, which keeps card edges visible in dark mode
// (see index.css).
const SeoShell = ({ title, meta, actions, children }) => (
  <div className="seo-scope min-h-full p-4 sm:p-6">
    <div className="anim-stagger mx-auto space-y-5">
      <header>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1 text-xs font-medium text-app-text-muted"
            >
              <Link to={dashboardPath(PAGES.SEO)} className="transition-colors hover:text-app-text">
                SEO
              </Link>
              <Icon icon={ChevronRight} size="xs" tone="faint" />
              <span className="text-app-text">{title}</span>
            </nav>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-app-text">
              {title}
            </h1>
            {meta && (
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-app-text-muted">
                {meta}
              </div>
            )}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>

        <nav aria-label="SEO tools" className="mt-5 flex gap-1 border-b border-app-border!">
          {TOOLS.map((tool) => (
            <NavLink
              key={tool.page}
              to={dashboardPath(tool.page)}
              className={({ isActive }) =>
                `-mb-px inline-flex items-center gap-2 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-blue-600! text-blue-600 dark:border-blue-400! dark:text-blue-400"
                    : "border-transparent! text-app-text-muted hover:text-app-text"
                }`
              }
            >
              <Icon icon={tool.icon} size="sm" />
              {tool.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {children}
    </div>
  </div>
);

export default SeoShell;
