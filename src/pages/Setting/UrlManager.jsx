import { Check, ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Icon from "../../components/ui/Icon";
import IconButton from "../../components/ui/IconButton";
import { Input } from "../../components/ui/Field";
import { useApiAction } from "../../hooks/useApiAction";
import { useUpdateProfileUrlsMutation } from "../../redux/api/profileApi";

const COLUMNS = [
  { key: "websites", label: "Websites", placeholder: "yourhotel.com" },
  { key: "landingPages", label: "Landing pages", placeholder: "yourhotel.com/lp/monsoon-offer" },
];

// "yourhotel.com/" -> { value: "https://yourhotel.com" } or { error }
const normalizeUrl = (raw) => {
  const text = String(raw || "").trim();
  if (!text) return { error: "Enter a URL." };
  let parsed;
  try {
    parsed = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return { error: "That isn't a valid URL." };
  }
  if (!parsed.hostname.includes(".")) return { error: "Include a domain, like yourhotel.com." };
  return { value: parsed.toString().replace(/\/$/, "") };
};

// the saved lists, whatever shape the profile stored them in
const readLinks = (urls) =>
  Object.fromEntries(
    COLUMNS.map(({ key }) => [
      key,
      (Array.isArray(urls?.[key]) ? urls[key] : [])
        .map((item) => (typeof item === "string" ? item : item?.url))
        .filter(Boolean),
    ]),
  );

const display = (url) => url.replace(/^https?:\/\//, "");

// One list of links: add, edit in place, remove.
const LinkColumn = ({ column, links, onChange }) => {
  // null = nothing being edited; { index: null } = a new link
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const start = (index) => {
    setEditing({ index });
    setDraft(index === null ? "" : links[index]);
    setError("");
  };
  const cancel = () => {
    setEditing(null);
    setError("");
  };

  const commit = () => {
    const result = normalizeUrl(draft);
    if (result.error) return setError(result.error);
    if (links.some((url, i) => url === result.value && i !== editing.index)) {
      return setError("This link is already in the list.");
    }
    onChange(
      editing.index === null
        ? [...links, result.value]
        : links.map((url, i) => (i === editing.index ? result.value : url)),
    );
    cancel();
  };

  const editor = (
    <li>
      <div className="flex items-center gap-1">
        <Input
          autoFocus
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") {
              e.stopPropagation();
              cancel();
            }
          }}
          placeholder={column.placeholder}
          inputMode="url"
          autoCapitalize="none"
          spellCheck="false"
          aria-label={`${column.label} link`}
          aria-invalid={Boolean(error)}
          className={error ? "border-red-500!" : ""}
        />
        <IconButton icon={Check} label="Keep this link" tone="success" onClick={commit} />
        <IconButton icon={X} label="Cancel" onClick={cancel} />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </li>
  );

  return (
    <section className="min-w-0">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-app-text-muted">
        {column.label} <span className="font-normal normal-case text-app-text-faint">· {links.length}</span>
      </h3>
      <ul className="space-y-1.5">
        {links.map((url, index) =>
          editing?.index === index ? (
            <Fragment key={url}>{editor}</Fragment>
          ) : (
            <li
              key={url}
              className="flex items-center gap-1 rounded-lg border border-app-border! py-1 pl-3 pr-1 hover:bg-app-surface-secondary"
            >
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                title={url}
                className="flex min-w-0 flex-1 items-center gap-1.5 text-sm text-app-text hover:text-blue-500"
              >
                <span className="truncate">{display(url)}</span>
                <Icon icon={ExternalLink} size={12} className="shrink-0 opacity-50" />
              </a>
              <IconButton icon={Pencil} label={`Edit ${display(url)}`} size="sm" onClick={() => start(index)} />
              <IconButton
                icon={Trash2}
                label={`Remove ${display(url)}`}
                tone="danger"
                size="sm"
                onClick={() => onChange(links.filter((_, i) => i !== index))}
              />
            </li>
          ),
        )}
        {editing?.index === null && editor}
      </ul>
      {links.length === 0 && !editing && (
        <p className="mb-2 text-sm text-app-text-faint">No {column.label.toLowerCase()} yet.</p>
      )}
      {!editing && (
        <Button variant="dashed" size="sm" icon={Plus} className="mt-2 w-full" onClick={() => start(null)}>
          Add link
        </Button>
      )}
    </section>
  );
};

// The hotel's websites and landing pages, used by SEO tracking and ad reporting.
const UrlManager = ({ urls, onSaved }) => {
  const run = useApiAction();
  const [updateProfileUrls, { isLoading }] = useUpdateProfileUrlsMutation();

  const saved = useMemo(() => readLinks(urls), [urls]);
  const [links, setLinks] = useState(saved);
  useEffect(() => setLinks(saved), [saved]);

  const dirty = JSON.stringify(links) !== JSON.stringify(saved);

  const handleSave = async () => {
    const response = await run(updateProfileUrls(links), {
      success: "Links saved",
      error: "Could not save your links.",
    });
    if (response) onSaved(links);
  };

  return (
    <Card
      title="Websites & landing pages"
      description="Links added here are used for SEO tracking and ad reporting."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {COLUMNS.map((column) => (
          <LinkColumn
            key={column.key}
            column={column}
            links={links[column.key]}
            onChange={(list) => setLinks({ ...links, [column.key]: list })}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-app-border! pt-4">
        {dirty && <span className="mr-auto text-xs text-amber-600 dark:text-amber-400">Unsaved changes</span>}
        {dirty && (
          <Button variant="ghost" onClick={() => setLinks(saved)} disabled={isLoading}>
            Discard
          </Button>
        )}
        <Button onClick={handleSave} disabled={!dirty} loading={isLoading}>
          Save links
        </Button>
      </div>
    </Card>
  );
};

export default UrlManager;
