import { useEffect, useRef, useState } from "react";
import Icon from "../../../components/ui/Icon";

// "On this page" menu beside a long settings page. Highlights the section in
// view and scrolls to one when it is clicked. Shown on wide screens only.
//   sections - [{ id, label, icon }], in page order; each id is a SettingsCard id
const SectionNav = ({ sections }) => {
  const [active, setActive] = useState(sections[0]?.id);
  const visible = useRef(new Set());
  const ids = sections.map((section) => section.id).join();

  useEffect(() => {
    const order = ids.split(",");
    // a section counts as "in view" while it crosses the top 40% of the screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          entry.isIntersecting
            ? visible.current.add(entry.target.id)
            : visible.current.delete(entry.target.id),
        );
        const first = order.find((id) => visible.current.has(id));
        if (first) setActive(first);
      },
      { rootMargin: "0px 0px -60% 0px" },
    );
    order.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [ids]);

  const go = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav aria-label="Profile sections" className="sticky top-0 hidden self-start lg:block">
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-app-text-faint">
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-app-border!">
        {sections.map(({ id, label, icon }) => {
          const current = id === active;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => go(id)}
                aria-current={current ? "true" : undefined}
                className={`-ml-px flex w-full items-center gap-2.5 border-l-2 py-1.5 pl-3 pr-2 text-left text-sm transition-colors ${
                  current
                    ? "border-blue-500! font-medium text-app-text"
                    : "border-transparent! text-app-text-muted hover:text-app-text"
                }`}
              >
                <Icon icon={icon} size="sm" className={current ? "text-blue-500" : ""} />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SectionNav;
