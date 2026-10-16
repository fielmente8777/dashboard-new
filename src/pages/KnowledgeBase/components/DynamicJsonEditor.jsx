import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { memo, useState } from "react";
import Button from "../../../components/ui/Button";
import { Input, Select } from "../../../components/ui/Field";
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
import Icon from "../../../components/ui/Icon";

const boxClassName =
  "rounded-xl border border-app-border! bg-app-surface-secondary";

const FIELD_TYPES = [
  { value: "text", label: "Text", initial: "" },
  { value: "number", label: "Number", initial: 0 },
  { value: "boolean", label: "Boolean", initial: false },
  { value: "media", label: "Media" },
  { value: "object", label: "Object", initial: {} },
  { value: "array", label: "Array", initial: [] },
];

const SUMMARY_KEYS = ["name", "title", "kb_name", "brand", "label"];

// The title of a collapsed array item: its name-like field, or its position.
const getItemSummary = (item, index) => {
  const key = Object.keys(item).find((k) =>
    SUMMARY_KEYS.includes(k.toLowerCase()),
  );
  const value = key ? item[key] : null;
  return typeof value === "string" && value.trim() ? value : `Item ${index + 1}`;
};

// --- a single string / number / boolean ------------------------------------

const PrimitiveField = ({ value, path, onChange }) => {
  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm text-app-text">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(path, e.target.checked)}
          className="size-4 rounded"
        />
        {value ? "Enabled" : "Disabled"}
      </label>
    );
  }

  if (isMediaUrl(value)) {
    return <MediaValue value={value} onChange={(url) => onChange(path, url)} />;
  }

  const isNumber = typeof value === "number";

  return (
    <Input
      type={isNumber ? "number" : "text"}
      value={value ?? ""}
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

  const deleteItem = (index) => {
    onDelete([...path, index]);
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
      <div className="space-y-3">
        <p className="rounded-lg border border-dashed border-app-border! p-5 text-center text-sm text-app-text-muted">
          No {itemLabel.toLowerCase()} items added yet.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="dashed" icon={Plus} onClick={() => pushItem("")}>
            Add {itemLabel} (text)
          </Button>
          <Button variant="dashed" icon={Plus} onClick={() => pushItem({})}>
            Add {itemLabel} (with fields)
          </Button>
          <AddMediaButton onAdd={pushItem} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {value.map((item, index) => {
        const editor = (
          <DynamicJsonEditor
            value={item}
            path={[...path, index]}
            onChange={onChange}
            onDelete={onDelete}
          />
        );
        const deleteButton = (
          <IconButton
            icon={Trash2}
            label="Delete"
            tone="danger"
            onClick={() => deleteItem(index)}
          />
        );

        // plain values have nothing to hide, so they are always open
        if (!isPlainObject(item)) {
          return (
            <div key={index} className={`${boxClassName} p-4`}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-app-text">
                  Item {index + 1}
                </span>
                {deleteButton}
              </div>
              {editor}
            </div>
          );
        }

        const isOpen = expanded.has(index);

        return (
          <div key={index} className={boxClassName}>
            <div className="flex items-center justify-between gap-2 px-4 py-2.5">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggleItem(index)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-medium text-app-text"
              >
                <Icon icon={ChevronDown} className={`shrink-0 text-app-text-muted transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                <span className="truncate">{getItemSummary(item, index)}</span>
              </button>
              {deleteButton}
            </div>
            {isOpen && (
              <div className="anim-enter border-t border-app-border! p-4">
                {editor}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap gap-2">
        {/* a new item copies the fields of the last one, left empty */}
        <Button
          variant="dashed"
          icon={Plus}
          onClick={() =>
            pushItem(isPlainObject(lastItem) ? blankLikeTemplate(lastItem) : "")
          }
        >
          Add {itemLabel}
        </Button>
        <AddMediaButton onAdd={pushItem} />
      </div>
    </div>
  );
};

// --- an object: one box per field, plus "Add field" -------------------------

const ObjectField = ({ value, path, onChange, onDelete, existingKeys }) => {
  const { showToast } = useToast();
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState("text");

  const fieldKey = newKey.trim();
  const takenKeys = existingKeys || Object.keys(value);

  const addField = (fieldValue) => {
    onChange([...path, fieldKey], fieldValue);
    setNewKey("");
    setNewType("text");
  };

  // A media field is only created once its file has uploaded, so it is never
  // left empty.
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

  const entries = Object.entries(value).filter(
    ([key]) => !HIDDEN_FIELDS.has(key),
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {entries.map(([key, child]) => {
          // nested values and long text get the full width
          const isWide =
            (child !== null && typeof child === "object") ||
            (typeof child === "string" && child.length > 150);

          return (
            <div
              key={key}
              className={`${boxClassName} p-4 ${isWide ? "sm:col-span-2" : ""}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-app-text-muted">
                  {formatLabel(key)}
                </span>
                <IconButton
                  icon={Trash2}
                  label="Delete"
                  tone="danger"
                  onClick={() => onDelete([...path, key])}
                />
              </div>
              <DynamicJsonEditor
                value={child}
                path={[...path, key]}
                onChange={onChange}
                onDelete={onDelete}
              />
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-dashed border-app-border! p-4">
        <p className="mb-3 text-sm font-medium text-app-text">Add field</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Field name"
            aria-label="Field name"
            className="sm:flex-1"
          />
          <Select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            options={FIELD_TYPES}
            aria-label="Field type"
            className="sm:w-36"
          />
          <Button
            icon={Plus}
            loading={mediaPicker.uploading}
            disabled={!fieldKey}
            onClick={handleAddField}
          >
            {mediaPicker.uploading ? "Uploading..." : "Add"}
          </Button>
        </div>
        {mediaPicker.input}
      </div>
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

const samePath = (a, b) =>
  a.length === b.length && a.every((key, index) => key === b[index]);

const sameKeys = (a, b) =>
  a === b || (a && b && a.length === b.length && a.every((k, i) => k === b[i]));

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
    prev.onChange === next.onChange &&
    prev.onDelete === next.onDelete &&
    samePath(prev.path || [], next.path || []) &&
    sameKeys(prev.existingKeys, next.existingKeys),
);

export default DynamicJsonEditor;
