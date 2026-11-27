import { ChevronDown, ListPlus, Plus, Trash2, X } from "lucide-react";
import { memo, useState } from "react";
import Button from "../../../components/ui/Button";
import { Input, Select, Textarea } from "../../../components/ui/Field";
import IconButton from "../../../components/ui/IconButton";
import { useToast } from "../../../context/ToastContext";
import { useMediaPicker } from "../hooks/useMediaPicker";
import {
  HIDDEN_FIELDS,
  blankLikeTemplate,
  formatLabel,
  isMediaUrl,
  isPlainObject,
  singularize,
} from "../utils/kbHelpers";
import { AddMediaButton, MediaValue } from "./MediaValue";
import KbImageGallery from "./KbImageGallery";
import { fieldIcon } from "../utils/fieldIcons";
import Icon from "../../../components/ui/Icon";

// Layout (2026-11-28 redesign): no box around every field. An object is one card of rows, the
// label on the left and the value on the right (label above on phones), split by thin lines.
// Lists and nested groups take the full width under their label; lists of things open like an
// accordion; lists of plain text are numbered rows; lists of pictures are a photo grid.

const FIELD_TYPES = [
  { value: "text", label: "Text", initial: "" },
  { value: "number", label: "Number", initial: 0 },
  { value: "boolean", label: "Yes / no", initial: false },
  { value: "media", label: "Photo or file" },
  { value: "object", label: "Group of fields", initial: {} },
  { value: "array", label: "List", initial: [] },
];

const SUMMARY_KEYS = ["name", "title", "kb_name", "brand", "label", "room_name", "type"];

// The title of a collapsed list item: its name-like field, or its position.
const getItemSummary = (item, index) => {
  const key = Object.keys(item).find((k) => SUMMARY_KEYS.includes(k.toLowerCase()));
  const value = key ? item[key] : null;
  return typeof value === "string" && value.trim() ? value : `Item ${index + 1}`;
};

// a short line under a collapsed item: how many fields / photos it holds
const getItemHint = (item) => {
  const fields = Object.keys(item).filter((k) => !HIDDEN_FIELDS.has(k)).length;
  const photos = Object.values(item).reduce(
    (n, v) => n + (Array.isArray(v) ? v.filter((x) => typeof x === "string" && isMediaUrl(x)).length : typeof v === "string" && isMediaUrl(v) ? 1 : 0),
    0,
  );
  return [`${fields} ${fields === 1 ? "field" : "fields"}`, photos ? `${photos} ${photos === 1 ? "photo" : "photos"}` : null].filter(Boolean).join(" · ");
};

// long text gets a text area that grows with it
const LONG_TEXT = 90;

// --- a single string / number / boolean ------------------------------------

const PrimitiveField = ({ value, path, onChange, mimeType, label }) => {
  // decided once, when the field appears: switching while typing would lose the cursor
  const [multiline] = useState(() => typeof value === "string" && (value.length > LONG_TEXT || value.includes("\n")));

  if (typeof value === "boolean") {
    return (
      <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-app-text">
        <span className="relative inline-flex">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(path, e.target.checked)}
            className="peer sr-only"
          />
          <span className="h-5 w-9 rounded-full bg-app-border transition peer-checked:bg-blue-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-500" />
          <span className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
        </span>
        {value ? "Yes" : "No"}
      </label>
    );
  }

  if (typeof value === "string" && isMediaUrl(value, mimeType)) {
    return <MediaValue value={value} mimeType={mimeType} onChange={(url) => onChange(path, url)} />;
  }

  const isNumber = typeof value === "number";
  if (!isNumber && multiline) {
    return (
      <Textarea
        value={value}
        rows={Math.min(8, Math.max(3, Math.ceil(value.length / 90)))}
        aria-label={label}
        onChange={(e) => onChange(path, e.target.value)}
      />
    );
  }

  return (
    <Input
      type={isNumber ? "number" : "text"}
      value={value ?? ""}
      aria-label={label}
      onChange={(e) => {
        const next = e.target.value;
        onChange(path, isNumber && next !== "" ? Number(next) : next);
      }}
    />
  );
};

// --- a list -----------------------------------------------------------------

const ArrayField = ({ value, path, onChange, onDelete }) => {
  const [expanded, setExpanded] = useState(() => new Set());

  // "Rooms" -> "Room", so the button reads "Add Room"
  const itemLabel = singularize(formatLabel(path[path.length - 1] ?? "item"));
  const lastItem = value[value.length - 1];

  const pushItem = (item) => {
    onChange(path, [...value, item]);
    setExpanded((prev) => new Set(prev).add(value.length));
  };

  const toggleItem = (index) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(index)) next.add(index);
      return next;
    });

  const deleteItem = async (index) => {
    // onDelete asks first; nothing moves if the user cancels
    if (!(await onDelete([...path, index]))) return;
    // everything after the deleted item moves up by one
    setExpanded((prev) => {
      const next = new Set();
      prev.forEach((i) => {
        if (i !== index) next.add(i > index ? i - 1 : i);
      });
      return next;
    });
  };

  if (value.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-app-border! px-4 py-5 text-center">
        <p className="text-sm text-app-text-muted">No {itemLabel.toLowerCase()} added yet.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Button size="sm" variant="secondary" icon={Plus} onClick={() => pushItem("")}>
            Add text
          </Button>
          <Button size="sm" variant="secondary" icon={ListPlus} onClick={() => pushItem({})}>
            Add {itemLabel.toLowerCase()} with fields
          </Button>
          <AddMediaButton onAdd={pushItem} />
        </div>
      </div>
    );
  }

  // a list of pictures / videos (room photos, gallery…): a grid of tiles with a full-screen viewer
  if (value.every((item) => typeof item === "string" && isMediaUrl(item))) {
    return (
      <KbImageGallery
        items={value}
        onReplace={(index, url) => onChange([...path, index], url)}
        onDelete={(index) => deleteItem(index)}
        onAdd={pushItem}
      />
    );
  }

  // a list of plain values (amenities, policies…): numbered rows, one input each
  if (value.every((item) => !isPlainObject(item) && !Array.isArray(item))) {
    return (
      <div className="space-y-2">
        <ol className="divide-y divide-app-border overflow-hidden rounded-xl border border-app-border! bg-app-surface">
          {value.map((item, index) => (
            <li key={index} className="group flex items-start gap-2 px-2.5 py-2 sm:gap-3 sm:px-3">
              <span className="mt-2 w-6 shrink-0 text-right text-xs tabular-nums text-app-text-faint">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <PrimitiveField value={item} path={[...path, index]} onChange={onChange} label={`${itemLabel} ${index + 1}`} />
              </div>
              <RowDelete onClick={() => deleteItem(index)} label={`Delete ${itemLabel.toLowerCase()} ${index + 1}`} />
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" icon={Plus} onClick={() => pushItem("")}>
            Add {itemLabel.toLowerCase()}
          </Button>
          <AddMediaButton onAdd={pushItem} />
        </div>
      </div>
    );
  }

  // a list of things with fields (rooms, packages…): an accordion
  return (
    <div className="space-y-2">
      <div className="divide-y divide-app-border overflow-hidden rounded-xl border border-app-border! bg-app-surface">
        {value.map((item, index) => {
          const editor = <DynamicJsonEditor value={item} path={[...path, index]} onChange={onChange} onDelete={onDelete} />;

          if (!isPlainObject(item)) {
            return (
              <div key={index} className="group flex items-start gap-3 px-3 py-3">
                <span className="mt-2 w-6 shrink-0 text-right text-xs tabular-nums text-app-text-faint">{index + 1}</span>
                <div className="min-w-0 flex-1">{editor}</div>
                <RowDelete onClick={() => deleteItem(index)} label={`Delete item ${index + 1}`} />
              </div>
            );
          }

          const isOpen = expanded.has(index);
          return (
            <div key={index} className={isOpen ? "bg-app-surface-secondary/40" : ""}>
              <div className="flex items-center gap-2 px-3 py-2.5 sm:px-4">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleItem(index)}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-semibold tabular-nums text-blue-600 dark:text-blue-300">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-app-text">{getItemSummary(item, index)}</span>
                    <span className="block truncate text-xs text-app-text-muted">{getItemHint(item)}</span>
                  </span>
                  <Icon icon={ChevronDown} className={`shrink-0 text-app-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <IconButton icon={Trash2} label={`Delete ${getItemSummary(item, index)}`} tone="danger" onClick={() => deleteItem(index)} />
              </div>
              {isOpen && <div className="anim-enter border-t border-app-border! px-3 py-4 sm:px-4">{editor}</div>}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {/* a new item copies the fields of the last one, left empty */}
        <Button size="sm" variant="ghost" icon={Plus} onClick={() => pushItem(isPlainObject(lastItem) ? blankLikeTemplate(lastItem) : "")}>
          Add {itemLabel.toLowerCase()}
        </Button>
        <AddMediaButton onAdd={pushItem} />
      </div>
    </div>
  );
};

/** the field's icon in a soft colour chip, picked from its name (utils/fieldIcons) */
const FieldIcon = ({ name, value }) => {
  const { icon, tone } = fieldIcon(name, value);
  return (
    <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${tone}`} aria-hidden>
      <Icon icon={icon} size="sm" />
    </span>
  );
};

/** long text, links and photos take a whole row; a short field left alone on its row does too */
const isWideValue = (child) =>
  typeof child === "string" && (child.length > 60 || child.includes("\n") || isMediaUrl(child) || /^https?:\/\//i.test(child));

const layoutCells = (entries) => {
  const cells = entries.map(([key, child]) => ({ key, child, wide: isWideValue(child) }));
  // a short field with no partner beside it (next is wide, or it is last) spans the row,
  // so the grid never shows an empty half
  let column = 0;
  cells.forEach((cell, i) => {
    if (cell.wide) {
      column = 0;
      return;
    }
    const next = cells[i + 1];
    if (column === 0 && (!next || next.wide)) cell.wide = true;
    else column = column === 0 ? 1 : 0;
  });
  return cells;
};

/** a delete button that shows on hover with a mouse, and always on touch screens */
const RowDelete = ({ onClick, label }) => (
  <span className="shrink-0 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
    <IconButton icon={Trash2} label={label} tone="danger" onClick={onClick} />
  </span>
);

// --- an object: one card of label / value rows, plus "Add field" -------------

const ObjectField = ({ value, path, onChange, onDelete, existingKeys }) => {
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState("text");

  const fieldKey = newKey.trim();
  const takenKeys = existingKeys || Object.keys(value);

  const addField = (fieldValue) => {
    onChange([...path, fieldKey], fieldValue);
    setNewKey("");
    setNewType("text");
    setAdding(false);
  };

  // A media field is only created once its file has uploaded, so it is never left empty.
  const mediaPicker = useMediaPicker(addField);

  const handleAddField = () => {
    if (takenKeys.includes(fieldKey)) {
      showToast({ message: "Field already exists", type: "warning" });
      return;
    }
    if (newType === "media") {
      mediaPicker.open();
      return;
    }
    addField(FIELD_TYPES.find((type) => type.value === newType).initial);
  };

  const entries = Object.entries(value).filter(([key]) => !HIDDEN_FIELDS.has(key));
  // plain fields first (a form), then lists and groups, each under its own heading
  const simple = entries.filter(([, child]) => child === null || typeof child !== "object");
  const nested = entries.filter(([, child]) => child !== null && typeof child === "object");

  return (
    <div className="space-y-5">
      {simple.length > 0 && (
        // a grid that arranges itself: short fields two per row on wide screens, long text,
        // links and photos across the whole row; thin lines between cells (gap-px on a border colour)
        <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-app-border! bg-app-border lg:grid-cols-2">
          {layoutCells(simple).map(({ key, child, wide }) => (
            <div key={key} className={`group min-w-0 bg-app-surface p-3 sm:p-4 ${wide ? "lg:col-span-2" : ""}`}>
              <dt className="mb-2 flex items-center gap-2">
                <FieldIcon name={key} value={child} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-app-text" title={formatLabel(key)}>
                  {formatLabel(key)}
                </span>
                <RowDelete onClick={() => onDelete([...path, key])} label={`Delete ${formatLabel(key)}`} />
              </dt>
              <dd className="min-w-0">
                <DynamicJsonEditor
                  value={child}
                  label={formatLabel(key)}
                  mimeType={/^(url|src|href|file_url|media_url)$/i.test(key) ? value.mimeType || value.mime_type : undefined}
                  path={[...path, key]}
                  onChange={onChange}
                  onDelete={onDelete}
                />
              </dd>
            </div>
          ))}
        </dl>
      )}

      {nested.map(([key, child]) => (
        <section key={key} className="group space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-app-text">
              <FieldIcon name={key} value={child} />
              <span className="truncate">{formatLabel(key)}</span>
              <span className="rounded-full bg-app-surface-secondary px-2 py-0.5 text-[11px] font-medium tabular-nums text-app-text-muted">
                {Array.isArray(child) ? child.length : Object.keys(child).filter((k) => !HIDDEN_FIELDS.has(k)).length}
              </span>
            </h4>
            <RowDelete onClick={() => onDelete([...path, key])} label={`Delete ${formatLabel(key)}`} />
          </div>
          <DynamicJsonEditor value={child} path={[...path, key]} onChange={onChange} onDelete={onDelete} />
        </section>
      ))}

      {adding ? (
        <div className="anim-enter rounded-xl border border-app-border! bg-app-surface-secondary/50 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-app-text">New field</p>
            <IconButton icon={X} label="Cancel" onClick={() => setAdding(false)} />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              autoFocus
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fieldKey && handleAddField()}
              placeholder="Field name, e.g. Check-in time"
              aria-label="Field name"
              className="sm:flex-1"
            />
            <Select value={newType} onChange={(e) => setNewType(e.target.value)} options={FIELD_TYPES} aria-label="Field type" className="sm:w-44" />
            <Button icon={Plus} loading={mediaPicker.uploading} disabled={!fieldKey} onClick={handleAddField}>
              {mediaPicker.uploading ? "Uploading..." : "Add"}
            </Button>
          </div>
          {mediaPicker.input}
        </div>
      ) : (
        <Button size="sm" variant="ghost" icon={Plus} onClick={() => setAdding(true)}>
          Add field
        </Button>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Editor for any JSON value: picks the right field for its type and recurses.
//
// `existingKeys` overrides what counts as "already taken" for Add field. It
// is needed when `value` is a filtered subset of an object (see the General
// tab in NestedSection), so a new field cannot collide with a hidden sibling.
// ---------------------------------------------------------------------------

const samePath = (a, b) => a.length === b.length && a.every((key, index) => key === b[index]);

const sameKeys = (a, b) => a === b || (a && b && a.length === b.length && a.every((k, i) => k === b[i]));

const DynamicJsonEditor = memo(
  function DynamicJsonEditor({ value, path = [], ...props }) {
    if (Array.isArray(value)) {
      return <ArrayField value={value} path={path} {...props} />;
    }
    if (isPlainObject(value)) {
      return <ObjectField value={value} path={path} {...props} />;
    }
    return <PrimitiveField value={value} path={path} {...props} />;
  },
  // `path` is a new array on every render, so compare what is inside it.
  // With this, typing in one field only re-renders the fields on its path.
  (prev, next) =>
    prev.value === next.value &&
    prev.mimeType === next.mimeType &&
    prev.label === next.label &&
    prev.onChange === next.onChange &&
    prev.onDelete === next.onDelete &&
    samePath(prev.path || [], next.path || []) &&
    sameKeys(prev.existingKeys, next.existingKeys),
);

export default DynamicJsonEditor;
