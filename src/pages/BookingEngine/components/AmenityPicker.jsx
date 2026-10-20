import { Check, Plus, Search, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import Icon from "../../../components/ui/Icon";
import {
  FACILITIES,
  FACILITY_GROUPS,
  POPULAR_FACILITIES,
} from "../constants";

const ALL = "all";
const normalize = (text) => text.trim().toLowerCase();

// One amenity as a tick box.
const AmenityTile = ({ name, selected, onToggle }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={selected}
    onClick={() => onToggle(name)}
    className={`flex min-w-0 items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
      selected
        ? "border-blue-500! bg-blue-500/10 text-app-text"
        : "border-app-border! text-app-text-muted hover:border-app-text-faint! hover:text-app-text"
    }`}
  >
    <span
      className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
        selected
          ? "border-blue-500! bg-blue-500 text-white"
          : "border-app-text-faint! bg-transparent"
      }`}
    >
      {selected && <Icon icon={Check} size="xs" />}
    </span>
    <span className="truncate">{name}</span>
  </button>
);

// Pick room amenities: search, filter by category, one-tap common picks, and
// custom amenities when the list does not have one. `value` is an array of
// names, in the order they were picked.
const AmenityPicker = ({ value, onChange }) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const selected = useMemo(() => new Set(value), [value]);
  const term = normalize(query);

  const toggle = (name) =>
    onChange(selected.has(name) ? value.filter((item) => item !== name) : [...value, name]);

  const setGroup = (items, on) =>
    onChange(
      on
        ? [...value, ...items.filter((item) => !selected.has(item))]
        : value.filter((item) => !items.includes(item)),
    );

  // groups to show: the picked category, narrowed by the search
  const groups = useMemo(
    () =>
      FACILITY_GROUPS.filter((group) => category === ALL || group.key === category)
        .map((group) => ({
          ...group,
          items: term
            ? group.items.filter((item) => item.toLowerCase().includes(term))
            : group.items,
        }))
        .filter((group) => group.items.length > 0),
    [category, term],
  );

  const exactMatch =
    term &&
    [...FACILITIES, ...value].some((item) => item.toLowerCase() === term);
  const customName = query.trim().replace(/\s+/g, " ");

  const addCustom = () => {
    if (!customName || exactMatch) return;
    onChange([...value, customName]);
    setQuery("");
  };

  const popularLeft = POPULAR_FACILITIES.filter((item) => !selected.has(item));

  return (
    <div className="space-y-4">
      {/* Picked so far */}
      <div className="rounded-lg border border-dashed border-app-border! p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-app-text-muted">
            {value.length
              ? `${value.length} selected`
              : "Nothing selected yet. Tick amenities below or search for one."}
          </p>
          {value.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs font-medium text-red-500 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
        {value.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {value.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => toggle(name)}
                  aria-label={`Remove ${name}`}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 py-1 pl-2.5 pr-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-red-500/10 hover:text-red-500 dark:text-blue-400"
                >
                  {name}
                  <Icon icon={X} size="xs" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Common picks */}
      {popularLeft.length > 0 && !term && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 flex items-center gap-1 text-xs font-medium text-app-text-muted">
            <Icon icon={Sparkles} size="xs" />
            Common:
          </span>
          {popularLeft.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              className="inline-flex items-center gap-1 rounded-full border border-app-border! px-2.5 py-1 text-xs text-app-text transition-colors hover:border-blue-500! hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Icon icon={Plus} size="xs" />
              {name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setGroup(popularLeft, true)}
            className="ml-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Add all
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Icon
          icon={Search}
          size="sm"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-app-text-faint"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // Enter adds a custom amenity instead of submitting the form
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Search amenities, e.g. pool, view, breakfast"
          aria-label="Search amenities"
          className="w-full rounded-lg border border-app-border! bg-app-surface py-2 pl-9 pr-3 text-sm text-app-text outline-none transition placeholder:text-app-text-faint focus:border-blue-500! focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Categories */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-hidden">
        {[{ key: ALL, label: "All", items: FACILITIES }, ...FACILITY_GROUPS].map((group) => {
          const active = category === group.key;
          const picked = group.items.filter((item) => selected.has(item)).length;

          return (
            <button
              key={group.key}
              type="button"
              onClick={() => setCategory(group.key)}
              aria-pressed={active}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-primary text-white dark:bg-blue-600"
                  : "bg-app-surface-secondary text-app-text-muted hover:text-app-text"
              }`}
            >
              {group.label}
              {picked > 0 && group.key !== ALL && (
                <span
                  className={`rounded-full px-1.5 text-[10px] ${
                    active ? "bg-white/20" : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {picked}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* The list */}
      <div className="max-h-[26rem] space-y-5 overflow-y-auto pr-1">
        {groups.map((group) => {
          const allPicked = group.items.every((item) => selected.has(item));

          return (
            <section key={group.key}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-app-text-muted">
                  {group.label}
                </h4>
                <button
                  type="button"
                  onClick={() => setGroup(group.items, !allPicked)}
                  className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  {allPicked ? "Clear" : "Select all"}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {group.items.map((name) => (
                  <AmenityTile
                    key={name}
                    name={name}
                    selected={selected.has(name)}
                    onToggle={toggle}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {groups.length === 0 && (
          <p className="py-6 text-center text-sm text-app-text-muted">
            No amenity matches “{customName}”
            {category !== ALL && " in this category"}.
          </p>
        )}

        {term && !exactMatch && (
          <button
            type="button"
            onClick={addCustom}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-500/60! px-3 py-2.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-500/10 dark:text-blue-400"
          >
            <Icon icon={Plus} size="sm" />
            Add “{customName}” as a custom amenity
          </button>
        )}
      </div>
    </div>
  );
};

export default AmenityPicker;
