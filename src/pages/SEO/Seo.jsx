import { ChevronRight, Globe, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import PageShell from "../../components/ui/PageShell";
import { PAGES, dashboardPath } from "../../routes/paths";
import Icon from "../../components/ui/Icon";

const SECTIONS = [
  {
    page: PAGES.SEO_LOCAL,
    icon: MapPin,
    title: "Local SEO",
    description:
      "Where your property ranks on Google Maps around you, keyword by keyword, with a rank grid of your area.",
  },
  {
    page: PAGES.SEO_WEBSITE,
    icon: Globe,
    title: "Website SEO",
    description:
      "Where your website ranks in Google search for the keywords you track.",
  },
];

// Landing page of the SEO section: one card per tool.
const Seo = () => (
  <PageShell
    title="SEO"
    description="Track how easily guests find your property on Google."
  >
    <div className="anim-stagger grid grid-cols-1 gap-4 lg:grid-cols-2">
      {SECTIONS.map((section) => (
        <Link
          key={section.page}
          to={dashboardPath(section.page)}
          className="anim-lift group flex items-start gap-3 rounded-xl border border-app-border! bg-app-surface p-5 hover:border-blue-500!"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <Icon icon={section.icon} size="2xl" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-app-text">
              {section.title}
            </span>
            <span className="mt-1 block text-sm text-app-text-muted">
              {section.description}
            </span>
          </span>
          <Icon
            icon={ChevronRight}
            className="mt-1 shrink-0 text-app-text-faint transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      ))}
    </div>
  </PageShell>
);

export default Seo;
