import React, { useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { AiOutlinePlus, AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { BsPencil, BsBoxArrowUpRight } from "react-icons/bs";
import { FaLink } from "react-icons/fa";
import { BASE_URL } from "../../data/constant";
import Loader from "../../components/Loader";
import TrashBin from "../../components/Icon/TrashBin";

const COLUMNS = [
  {
    key: "landingPages",
    label: "Landing Pages",
    placeholder: "yourhotel.com/lp/monsoon-offer",
  },
  {
    key: "websites",
    label: "Websites",
    placeholder: "yourhotel.com",
  },
];

/* shared class strings so every control uses one scale */
const ICON_BTN =
  "shrink-0 h-9 w-9 flex items-center justify-center rounded-lg transition-colors";
const FIELD =
  "w-full min-w-0 rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors bg-white dark:bg-app-surface text-gray-800 dark:text-app-text-muted placeholder:text-gray-400 dark:placeholder:text-app-text-faint focus:ring-2 focus:ring-orange-400/60 focus:border-orange-400";

let seq = 0;
const tempId = () => `tmp_${Date.now()}_${++seq}`;

/* an empty row sitting in edit mode, ready to type into.
   focus=false for seeded rows so the page doesn't jump on mount. */
const blankRow = (focus = false) => ({
  id: tempId(),
  url: "",
  draft: "",
  editing: true,
  error: "",
  confirmingDelete: false,
  isNew: true,
  focus,
});

/* every column always shows at least one row */
const withStarter = (rows) => (rows.length === 0 ? [blankRow()] : rows);

function normalizeUrl(raw) {
  const v = (raw || "").trim();
  if (!v) return { ok: false, error: "Enter a URL" };

  const withProtocol = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  let parsed;
  try {
    parsed = new URL(withProtocol);
  } catch {
    return { ok: false, error: "That isn't a valid URL" };
  }
  if (!parsed.hostname.includes(".")) {
    return { ok: false, error: "Include a domain, like yourhotel.com" };
  }
  return { ok: true, value: parsed.toString().replace(/\/$/, "") };
}

function hydrate(initial) {
  const out = {};
  for (const col of COLUMNS) {
    const list = Array.isArray(initial?.[col.key]) ? initial[col.key] : [];
    out[col.key] = withStarter(
      list
        .map((item) => ({
          id: item?.id ?? tempId(),
          url: typeof item === "string" ? item : item?.url ?? "",
          draft: "",
          editing: false,
          error: "",
          confirmingDelete: false,
          isNew: false,
          focus: false,
        }))
        .filter((r) => r.url)
    );
  }
  return out;
}

/* blank rows are invisible to the snapshot, so a starter row
   never counts as an unsaved change */
const snapshot = (data) =>
  JSON.stringify(
    Object.fromEntries(
      COLUMNS.map((c) => [
        c.key,
        data[c.key].filter((r) => r.url).map((r) => r.url),
      ])
    )
  );

const UrlManager = ({ initialLinks, onSave }) => {
  const { user: hotel } = useSelector((state) => state.userProfile);
  const profile = hotel?.Profile;

  const seed = useMemo(
    () => hydrate(initialLinks ?? profile?.urls ?? {}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialLinks, profile?.urls]
  );

  const [data, setData] = useState(seed);
  const [saved, setSaved] = useState(() => snapshot(seed));
  const [status, setStatus] = useState("idle");

  const dirty = useMemo(
    () =>
      snapshot(data) !== saved ||
      Object.values(data)
        .flat()
        .some((r) => r.editing && r.draft.trim()),
    [data, saved]
  );

  const patch = (colKey, id, changes) =>
    setData((d) => ({
      ...d,
      [colKey]: d[colKey].map((r) => (r.id === id ? { ...r, ...changes } : r)),
    }));

  const addRow = (colKey) => {
    setStatus("idle");
    setData((d) => ({ ...d, [colKey]: [...d[colKey], blankRow(true)] }));
  };

  const removeRow = (colKey, id) => {
    setStatus("idle");
    setData((d) => ({
      ...d,
      [colKey]: withStarter(d[colKey].filter((r) => r.id !== id)),
    }));
  };

  const startEdit = (colKey, row) => {
    setStatus("idle");
    patch(colKey, row.id, {
      editing: true,
      draft: row.url,
      error: "",
      confirmingDelete: false,
      focus: true,
    });
  };

  const cancelEdit = (colKey, row) => {
    /* the last remaining blank row stays put — just clear it */
    const isOnlyRow = data[colKey].length === 1;
    if (row.isNew && isOnlyRow) {
      return patch(colKey, row.id, { draft: "", error: "" });
    }
    if (row.isNew) return removeRow(colKey, row.id);
    patch(colKey, row.id, { editing: false, draft: "", error: "", focus: false });
  };

  const commitRow = (colKey, row) => {
    const result = normalizeUrl(row.draft);
    if (!result.ok) return patch(colKey, row.id, { error: result.error });

    const clash = data[colKey].some(
      (r) => r.id !== row.id && r.url === result.value
    );
    if (clash)
      return patch(colKey, row.id, { error: "This URL is already in the list" });

    patch(colKey, row.id, {
      url: result.value,
      editing: false,
      draft: "",
      error: "",
      isNew: false,
      focus: false,
    });
  };

  const handleSave = async () => {
    let hasError = false;
    const next = {};

    for (const col of COLUMNS) {
      next[col.key] = [];
      for (const row of data[col.key]) {
        if (!row.editing) {
          next[col.key].push(row);
          continue;
        }
        if (!row.draft.trim()) continue; // blank rows are dropped, not errors

        const result = normalizeUrl(row.draft);
        if (!result.ok) {
          hasError = true;
          next[col.key].push({ ...row, error: result.error });
          continue;
        }
        if (next[col.key].some((r) => r.url === result.value)) {
          hasError = true;
          next[col.key].push({
            ...row,
            error: "This URL is already in the list",
          });
          continue;
        }
        next[col.key].push({
          ...row,
          url: result.value,
          editing: false,
          draft: "",
          error: "",
          isNew: false,
          focus: false,
        });
      }
      next[col.key] = withStarter(next[col.key]);
    }

    setData(next);
    if (hasError) return setStatus("error");

    const payload = Object.fromEntries(
      COLUMNS.map((c) => [c.key, next[c.key].filter((r) => r.url).map((r) => r.url)])
    );

    setStatus("saving");
    try {
      if (onSave) {
        await onSave(payload);
      } else {
        const response = await axios.post(`${BASE_URL}/eazotel/edit/urls`, {
          token: localStorage.getItem("token"),
          ...payload,
        });
        if (response.data?.Status !== true) throw new Error("Save rejected");
      }
      setSaved(snapshot(next));
      setStatus("saved");
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "URLs updated",
        confirmButtonText: "OK",
      });
    } catch {
      setStatus("error");
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Couldn't save your URLs. Try again.",
      });
    }
  };

  const totalLinks = Object.values(data)
    .flat()
    .filter((r) => r.url).length;

  return (
    <div className="bg-app-surface-secondary rounded-xl p-4 sm:p-6 lg:p-8">
      {/* header */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="font-bold text-base sm:text-lg text-gray-800 dark:text-app-text flex items-center gap-3">
          <FaLink color="orange" className="text-xl sm:text-2xl shrink-0" />
          URLs
        </h3>
        <span className="text-xs text-gray-500 dark:text-app-text-faint">
          {totalLinks} {totalLinks === 1 ? "link" : "links"}
        </span>
      </div>

      <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-app-text-faint">
        Links you add here are used across SEO tracking and ad reporting.
      </p>

      {/* columns */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-8 gap-y-6">
        {COLUMNS.map((col) => (
          <section key={col.key} className="min-w-0">
            <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-app-text-muted">
              {col.label}
            </h4>

            <ul className="space-y-2">
              {data[col.key].map((row) => {
                const isBlankStarter =
                  row.isNew && !row.draft.trim() && data[col.key].length === 1;

                return row.editing ? (
                  <li key={row.id} className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <input
                        autoFocus={row.focus}
                        value={row.draft}
                        placeholder={col.placeholder}
                        inputMode="url"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                        onChange={(e) =>
                          patch(col.key, row.id, {
                            draft: e.target.value,
                            error: "",
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRow(col.key, row);
                          if (e.key === "Escape") cancelEdit(col.key, row);
                        }}
                        className={`${FIELD} ${
                          row.error
                            ? "border-red-500"
                            : "border-gray-300 dark:border-app-text-faint/25"
                        }`}
                      />
                      {/* a blank starter row has nothing to confirm or cancel yet */}
                      {!isBlankStarter && (
                        <>
                          <button
                            type="button"
                            aria-label="Confirm link"
                            onClick={() => commitRow(col.key, row)}
                            className={`${ICON_BTN} text-green-600 hover:bg-green-50 dark:hover:bg-app-surface`}
                          >
                            <AiOutlineCheck className="text-base" />
                          </button>
                          <button
                            type="button"
                            aria-label="Cancel"
                            onClick={() => cancelEdit(col.key, row)}
                            className={`${ICON_BTN} text-gray-500 dark:text-app-text-faint hover:bg-gray-100 dark:hover:bg-app-surface`}
                          >
                            <AiOutlineClose className="text-base" />
                          </button>
                        </>
                      )}
                    </div>
                    {row.error && (
                      <p className="mt-1 text-xs text-red-500">{row.error}</p>
                    )}
                  </li>
                ) : row.confirmingDelete ? (
                  <li
                    key={row.id}
                    className="rounded-lg bg-red-50 dark:bg-app-surface border border-red-200 dark:border-red-500/30 px-3 py-2.5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="min-w-0 flex-1 text-sm text-gray-700 dark:text-app-text-muted">
                        Remove this link?
                      </span>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => removeRow(col.key, row.id)}
                          className="rounded-md px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            patch(col.key, row.id, { confirmingDelete: false })
                          }
                          className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-app-text-faint hover:bg-gray-200 dark:hover:bg-app-surface-secondary transition-colors"
                        >
                          Keep
                        </button>
                      </div>
                    </div>
                  </li>
                ) : (
                  <li
                    key={row.id}
                    className="group flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-app-surface pl-3 pr-1.5 py-1.5 transition-colors hover:bg-gray-200/70 dark:hover:bg-app-surface/70"
                  >
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      title={row.url}
                      className="flex min-w-0 flex-1 items-center gap-1.5 py-1 text-sm text-gray-800 dark:text-app-text-muted hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                    >
                      <span className="truncate">
                        {row.url.replace(/^https?:\/\//, "")}
                      </span>
                      <BsBoxArrowUpRight className="shrink-0 text-[10px] opacity-50" />
                    </a>
                    <button
                      type="button"
                      aria-label={`Edit ${row.url}`}
                      onClick={() => startEdit(col.key, row)}
                      className={`${ICON_BTN} text-gray-500 dark:text-app-text-faint hover:bg-white dark:hover:bg-app-surface-secondary hover:text-gray-900 dark:hover:text-app-text`}
                    >
                      <BsPencil className="text-sm" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${row.url}`}
                      onClick={() =>
                        patch(col.key, row.id, { confirmingDelete: true })
                      }
                      className={`${ICON_BTN} hover:bg-white dark:hover:bg-app-surface-secondary`}
                    >
                      <TrashBin />
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={() => addRow(col.key)}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 dark:border-app-text-faint/25 px-3 py-2 text-sm font-medium text-gray-600 dark:text-app-text-faint hover:border-orange-400 hover:text-orange-500 transition-colors sm:w-auto"
            >
              <AiOutlinePlus className="text-base" />
              Add link
            </button>
          </section>
        ))}
      </div>

      {/* footer */}
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-gray-200 dark:border-app-text-faint/15 pt-5">
        <button
          type="button"
          onClick={handleSave}
          disabled={status === "saving"}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/90 hover:bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-60 sm:w-auto"
        >
          Save
          {status === "saving" && <Loader size={16} color="white" />}
        </button>

        {status === "saved" && !dirty && (
          <span className="text-sm text-green-600">Saved</span>
        )}
        {status === "error" && (
          <span className="text-sm text-red-500">
            Fix the highlighted links, then save
          </span>
        )}
        {dirty && status !== "error" && status !== "saving" && (
          <span className="text-sm text-gray-500 dark:text-app-text-faint">
            Unsaved changes
          </span>
        )}
      </div>
    </div>
  );
};

export default UrlManager;