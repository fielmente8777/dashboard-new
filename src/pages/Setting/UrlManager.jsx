import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import {
  AiOutlinePlus,
  AiOutlineCheck,
  AiOutlineClose,
} from "react-icons/ai";
import { BsPencil, BsBoxArrowUpRight } from "react-icons/bs";
import { FaLink } from "react-icons/fa";

import { NEW_BASE_URL } from "../../data/constant";
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

const ICON_BTN =
  "shrink-0 h-9 w-9 flex items-center justify-center rounded-lg transition-colors";

const FIELD =
  "w-full min-w-0 rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors bg-white dark:bg-app-surface text-gray-800 dark:text-app-text-muted placeholder:text-gray-400 dark:placeholder:text-app-text-faint focus:ring-2 focus:ring-orange-400/60 focus:border-orange-400";

let seq = 0;

const tempId = () => `tmp_${Date.now()}_${++seq}`;

const EMPTY_ROW = (focus = false) => ({
  id: tempId(),
  url: "",
  draft: "",
  editing: true,
  error: "",
  confirmingDelete: false,
  isNew: true,
  focus,
});

const withStarter = (rows) => {
  return rows.length === 0 ? [EMPTY_ROW()] : rows;
};

function normalizeUrl(raw) {
  const value = (raw || "").trim();

  if (!value) {
    return {
      ok: false,
      error: "Enter a URL",
    };
  }

  const withProtocol = /^https?:\/\//i.test(value)
    ? value
    : `https://${value}`;

  let parsed;

  try {
    parsed = new URL(withProtocol);
  } catch {
    return {
      ok: false,
      error: "That isn't a valid URL",
    };
  }

  if (!parsed.hostname.includes(".")) {
    return {
      ok: false,
      error: "Include a domain, like yourhotel.com",
    };
  }

  return {
    ok: true,
    value: parsed.toString().replace(/\/$/, ""),
  };
}

function hydrate(initial) {
  const output = {};

  for (const column of COLUMNS) {
    const list = Array.isArray(initial?.[column.key])
      ? initial[column.key]
      : [];

    output[column.key] = withStarter(
      list
        .map((item) => ({
          id: item?.id ?? tempId(),
          url:
            typeof item === "string"
              ? item
              : item?.url ?? "",
          draft: "",
          editing: false,
          error: "",
          confirmingDelete: false,
          isNew: false,
          focus: false,
        }))
        .filter((row) => row.url)
    );
  }

  return output;
}

const snapshot = (data) =>
  JSON.stringify(
    Object.fromEntries(
      COLUMNS.map((column) => [
        column.key,
        data[column.key]
          .filter((row) => row.url)
          .map((row) => row.url),
      ])
    )
  );

const UrlManager = ({ initialLinks, onSave }) => {
  const { user: hotel } = useSelector(
    (state) => state.userProfile
  );

  const profile = hotel?.Profile;

  const seed = useMemo(
    () =>
      hydrate(
        initialLinks ??
          profile?.urls ??
          {}
      ),
    [initialLinks, profile?.urls]
  );

  const [data, setData] = useState(seed);
  const [saved, setSaved] = useState(() =>
    snapshot(seed)
  );
  const [status, setStatus] = useState("idle");

  // Prevent multiple API requests
  const savingRef = useRef(false);

  useEffect(() => {
    const nextData = hydrate(
      initialLinks ??
        profile?.urls ??
        {}
    );

    setData(nextData);
    setSaved(snapshot(nextData));
    setStatus("idle");
  }, [initialLinks, profile?.urls]);

  const dirty = useMemo(() => {
    return (
      snapshot(data) !== saved ||
      Object.values(data)
        .flat()
        .some(
          (row) =>
            row.editing &&
            row.draft.trim()
        )
    );
  }, [data, saved]);

  const patch = (columnKey, id, changes) => {
    setData((current) => ({
      ...current,
      [columnKey]: current[columnKey].map(
        (row) =>
          row.id === id
            ? {
                ...row,
                ...changes,
              }
            : row
      ),
    }));
  };

  const addRow = (columnKey) => {
    setStatus("idle");

    setData((current) => ({
      ...current,
      [columnKey]: [
        ...current[columnKey],
        EMPTY_ROW(true),
      ],
    }));
  };

  const removeRow = (columnKey, id) => {
    setStatus("idle");

    setData((current) => ({
      ...current,
      [columnKey]: withStarter(
        current[columnKey].filter(
          (row) => row.id !== id
        )
      ),
    }));
  };

  const startEdit = (columnKey, row) => {
    setStatus("idle");

    patch(columnKey, row.id, {
      editing: true,
      draft: row.url,
      error: "",
      confirmingDelete: false,
      focus: true,
    });
  };

  const cancelEdit = (columnKey, row) => {
    const isOnlyRow =
      data[columnKey].length === 1;

    if (row.isNew && isOnlyRow) {
      return patch(columnKey, row.id, {
        draft: "",
        error: "",
      });
    }

    if (row.isNew) {
      return removeRow(
        columnKey,
        row.id
      );
    }

    patch(columnKey, row.id, {
      editing: false,
      draft: "",
      error: "",
      focus: false,
    });
  };

  const commitRow = (columnKey, row) => {
    const result = normalizeUrl(row.draft);

    if (!result.ok) {
      return patch(columnKey, row.id, {
        error: result.error,
      });
    }

    const duplicate = data[columnKey].some(
      (currentRow) =>
        currentRow.id !== row.id &&
        currentRow.url === result.value
    );

    if (duplicate) {
      return patch(columnKey, row.id, {
        error:
          "This URL is already in the list",
      });
    }

    patch(columnKey, row.id, {
      url: result.value,
      editing: false,
      draft: "",
      error: "",
      isNew: false,
      focus: false,
    });
  };

  // =====================================
  // SAVE URLS
  // =====================================

  const handleSave = async () => {
    if (savingRef.current) {
      console.log(
        "URL SAVE ALREADY IN PROGRESS"
      );
      return;
    }

    let hasError = false;

    const next = {};

    // -----------------------------
    // Validate all rows
    // -----------------------------

    for (const column of COLUMNS) {
      next[column.key] = [];

      for (const row of data[column.key]) {
        // Existing saved row
        if (!row.editing) {
          next[column.key].push(row);
          continue;
        }

        // Empty starter row
        if (!row.draft.trim()) {
          continue;
        }

        const result = normalizeUrl(
          row.draft
        );

        if (!result.ok) {
          hasError = true;

          next[column.key].push({
            ...row,
            error: result.error,
          });

          continue;
        }

        const duplicate = next[
          column.key
        ].some(
          (existingRow) =>
            existingRow.url ===
            result.value
        );

        if (duplicate) {
          hasError = true;

          next[column.key].push({
            ...row,
            error:
              "This URL is already in the list",
          });

          continue;
        }

        next[column.key].push({
          ...row,
          url: result.value,
          editing: false,
          draft: "",
          error: "",
          isNew: false,
          focus: false,
        });
      }

      next[column.key] = withStarter(
        next[column.key]
      );
    }

    setData(next);

    console.log(
      "========== URL SAVE =========="
    );

    console.log(
      "URL HAS ERROR:",
      hasError
    );

    console.log(
      "URL DATA:",
      data
    );

    console.log(
      "URL NEXT:",
      next
    );

    // -----------------------------
    // Stop if validation failed
    // -----------------------------

    if (hasError) {
      console.log(
        "API NOT HIT: VALIDATION FAILED"
      );

      setStatus("error");

      return;
    }

    // -----------------------------
    // Prepare payload
    // -----------------------------

    const payload =
      Object.fromEntries(
        COLUMNS.map((column) => [
          column.key,
          next[column.key]
            .filter((row) => row.url)
            .map((row) => row.url),
        ])
      );

    console.log(
      "FINAL URL PAYLOAD:",
      payload
    );

    console.log(
      "FINAL API URL:",
      `${NEW_BASE_URL}/api/v1/profile/urls`
    );

    // -----------------------------
    // Get token
    // -----------------------------

    const token =
      localStorage.getItem("token");

    if (!token) {
      console.error(
        "TOKEN NOT FOUND"
      );

      setStatus("error");

      Swal.fire({
        icon: "error",
        title: "Authentication required",
        text: "Please login again.",
      });

      return;
    }

    try {
      savingRef.current = true;

      setStatus("saving");

      console.log(
        "CALLING URL API..."
      );

      // -----------------------------
      // If parent provides onSave
      // -----------------------------

      if (onSave) {
        await onSave(payload);
      } else {
        // -----------------------------
        // Direct backend API
        // -----------------------------

        const response =
          await axios.put(
            `${NEW_BASE_URL}/api/v1/profile/urls`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type":
                  "application/json",
              },
            }
          );

        console.log(
          "URL API RESPONSE:",
          response.data
        );

        if (
          response.data?.Status === false
        ) {
          throw new Error(
            response.data?.message ||
              "Save rejected"
          );
        }
      }

      // -----------------------------
      // Success
      // -----------------------------

      setSaved(
        snapshot(next)
      );

      setStatus("saved");

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "URLs updated",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error(
        "========== URL API ERROR =========="
      );

      console.error(
        "ERROR:",
        error
      );

      console.error(
        "STATUS:",
        error?.response?.status
      );

      console.error(
        "SERVER RESPONSE:",
        error?.response?.data
      );

      console.error(
        "MESSAGE:",
        error?.message
      );

      setStatus("error");

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text:
          error?.response?.data
            ?.message ||
          error?.response?.data
            ?.responseMessage ||
          error?.message ||
          "Couldn't save your URLs. Try again.",
      });
    } finally {
      savingRef.current = false;
    }
  };

  const totalLinks = Object.values(data)
    .flat()
    .filter((row) => row.url)
    .length;

  return (
    <div className="bg-app-surface-secondary rounded-xl p-4 sm:p-6 lg:p-8">

      {/* Header */}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="font-bold text-base sm:text-lg text-gray-800 dark:text-app-text flex items-center gap-3">
          <FaLink
            color="orange"
            className="text-xl sm:text-2xl shrink-0"
          />

          URLs
        </h3>

        <span className="text-xs text-gray-500 dark:text-app-text-faint">
          {totalLinks}{" "}
          {totalLinks === 1
            ? "link"
            : "links"}
        </span>
      </div>

      <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-app-text-faint">
        Links you add here are used across SEO tracking and ad reporting.
      </p>

      {/* Columns */}

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-8 gap-y-6">

        {COLUMNS.map((column) => (
          <section
            key={column.key}
            className="min-w-0"
          >
            <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-app-text-muted">
              {column.label}
            </h4>

            <ul className="space-y-2">

              {data[column.key].map(
                (row) => {
                  const isBlankStarter =
                    row.isNew &&
                    !row.draft.trim() &&
                    data[column.key]
                      .length === 1;

                  // =========================
                  // EDITING ROW
                  // =========================

                  if (row.editing) {
                    return (
                      <li
                        key={row.id}
                        className="min-w-0"
                      >
                        <div className="flex items-center gap-1.5">

                          <input
                            autoFocus={
                              row.focus
                            }
                            value={
                              row.draft
                            }
                            placeholder={
                              column.placeholder
                            }
                            inputMode="url"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck="false"
                            onChange={(e) =>
                              patch(
                                column.key,
                                row.id,
                                {
                                  draft:
                                    e.target
                                      .value,
                                  error: "",
                                }
                              )
                            }
                            onKeyDown={(e) => {
                              if (
                                e.key ===
                                "Enter"
                              ) {
                                commitRow(
                                  column.key,
                                  row
                                );
                              }

                              if (
                                e.key ===
                                "Escape"
                              ) {
                                cancelEdit(
                                  column.key,
                                  row
                                );
                              }
                            }}
                            className={`${FIELD} ${
                              row.error
                                ? "border-red-500"
                                : "border-gray-300 dark:border-app-text-faint/25"
                            }`}
                          />

                          {!isBlankStarter && (
                            <>
                              <button
                                type="button"
                                aria-label="Confirm link"
                                onClick={() =>
                                  commitRow(
                                    column.key,
                                    row
                                  )
                                }
                                className={`${ICON_BTN} text-green-600 hover:bg-green-50 dark:hover:bg-app-surface`}
                              >
                                <AiOutlineCheck className="text-base" />
                              </button>

                              <button
                                type="button"
                                aria-label="Cancel"
                                onClick={() =>
                                  cancelEdit(
                                    column.key,
                                    row
                                  )
                                }
                                className={`${ICON_BTN} text-gray-500 dark:text-app-text-faint hover:bg-gray-100 dark:hover:bg-app-surface`}
                              >
                                <AiOutlineClose className="text-base" />
                              </button>
                            </>
                          )}
                        </div>

                        {row.error && (
                          <p className="mt-1 text-xs text-red-500">
                            {row.error}
                          </p>
                        )}
                      </li>
                    );
                  }

                  // =========================
                  // DELETE CONFIRMATION
                  // =========================

                  if (
                    row.confirmingDelete
                  ) {
                    return (
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
                              onClick={() =>
                                removeRow(
                                  column.key,
                                  row.id
                                )
                              }
                              className="rounded-md px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                            >
                              Remove
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                patch(
                                  column.key,
                                  row.id,
                                  {
                                    confirmingDelete:
                                      false,
                                  }
                                )
                              }
                              className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-app-text-faint hover:bg-gray-200 dark:hover:bg-app-surface-secondary transition-colors"
                            >
                              Keep
                            </button>

                          </div>
                        </div>
                      </li>
                    );
                  }

                  // =========================
                  // NORMAL ROW
                  // =========================

                  return (
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
                          {row.url.replace(
                            /^https?:\/\//,
                            ""
                          )}
                        </span>

                        <BsBoxArrowUpRight className="shrink-0 text-[10px] opacity-50" />
                      </a>

                      <button
                        type="button"
                        aria-label={`Edit ${row.url}`}
                        onClick={() =>
                          startEdit(
                            column.key,
                            row
                          )
                        }
                        className={`${ICON_BTN} text-gray-500 dark:text-app-text-faint hover:bg-white dark:hover:bg-app-surface-secondary hover:text-gray-900 dark:hover:text-app-text`}
                      >
                        <BsPencil className="text-sm" />
                      </button>

                      <button
                        type="button"
                        aria-label={`Delete ${row.url}`}
                        onClick={() =>
                          patch(
                            column.key,
                            row.id,
                            {
                              confirmingDelete:
                                true,
                            }
                          )
                        }
                        className={`${ICON_BTN} hover:bg-white dark:hover:bg-app-surface-secondary`}
                      >
                        <TrashBin />
                      </button>
                    </li>
                  );
                }
              )}

            </ul>

            {/* Add link */}

            <button
              type="button"
              onClick={() =>
                addRow(column.key)
              }
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 dark:border-app-text-faint/25 px-3 py-2 text-sm font-medium text-gray-600 dark:text-app-text-faint hover:border-orange-400 hover:text-orange-500 transition-colors sm:w-auto"
            >
              <AiOutlinePlus className="text-base" />

              Add link
            </button>
          </section>
        ))}

      </div>

      {/* Footer */}

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-gray-200 dark:border-app-text-faint/15 pt-5">

        <button
          type="button"
          onClick={handleSave}
          disabled={
            status === "saving"
          }
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/90 hover:bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-60 sm:w-auto"
        >
          Save

          {status === "saving" && (
            <Loader
              size={16}
              color="white"
            />
          )}
        </button>

        {status === "saved" &&
          !dirty && (
            <span className="text-sm text-green-600">
              Saved
            </span>
          )}

        {status === "error" && (
          <span className="text-sm text-red-500">
            Fix the highlighted links, then save
          </span>
        )}

        {dirty &&
          status !== "error" &&
          status !== "saving" && (
            <span className="text-sm text-gray-500 dark:text-app-text-faint">
              Unsaved changes
            </span>
          )}

      </div>
    </div>
  );
};

export default UrlManager;