import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiCheck,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiLayout,
  FiMonitor,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiSmartphone,
  FiX,
  FiZap,
} from "react-icons/fi";

import EmailPreviewFrame from "./EmailPreviewFrame";
import {
  createEmailTemplate,
  generateEmailTemplate,
  getEmailTemplates,
  updateEmailTemplate,
} from "../../../services/api/emailTemplate";

/* ---------------------------------------------------------
   CONSTANTS
--------------------------------------------------------- */

const SUGGESTIONS = [
  "Festive season offer: 20% off direct bookings for stays in November and December",
  "Welcome email for guests who just booked, with check-in tips and what to pack",
  "Monthly newsletter with property updates, a new experience and a seasonal menu",
  "Win back past guests who haven't stayed with us in over a year",
];

const TONES = [
  { value: "friendly", label: "Friendly" },
  { value: "warm", label: "Warm" },
  { value: "professional", label: "Professional" },
  { value: "luxurious", label: "Luxurious" },
  { value: "playful", label: "Playful" },
  { value: "urgent", label: "Urgent" },
];

const BRAND_STORAGE_KEY = "eazomail:ai-brand";

const loadBrand = () => {
  try {
    return JSON.parse(localStorage.getItem(BRAND_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

const saveBrand = (brand) => {
  try {
    localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(brand));
  } catch {
    /* storage unavailable — ignore */
  }
};

// API errors carry the server's message; network errors fall back to a friendly one
const getErrorMessage = (error, fallback) =>
  error?.isApiError && error?.message ? error.message : fallback;

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60";

const labelClass = "mb-1.5 block text-xs font-medium text-gray-600";

/* =========================================================
   MODAL
   mode="compose" → "Use this template" + saved templates tab
   mode="manage"  → create / edit from the Templates page
========================================================= */

export default function AITemplateModal({
  isOpen,
  onClose,
  mode = "compose",
  initialTemplate = null,
  onUse,
  onSaved,
}) {
  const isComposeMode = mode === "compose";

  const [tab, setTab] = useState("generate"); // generate | saved
  const [mobilePane, setMobilePane] = useState("brief"); // brief | preview

  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("friendly");
  const [brand, setBrand] = useState(() => ({
    brandName: "",
    primaryColor: "#2563eb",
    logoUrl: "",
    ...loadBrand(),
  }));
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  // Each generation is a version, so the user can go back
  const [versions, setVersions] = useState([]);
  const [versionIndex, setVersionIndex] = useState(-1);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [refineText, setRefineText] = useState("");
  const [device, setDevice] = useState("desktop");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savedId, setSavedId] = useState(null);
  // What's currently stored on the server — lets "Save & use" skip an
  // unnecessary update when nothing changed
  const [savedSnapshot, setSavedSnapshot] = useState("");

  const promptRef = useRef(null);

  const current = versionIndex >= 0 ? versions[versionIndex] : null;
  const busy = isGenerating || isSaving;

  const makeSnapshot = (tplName, tplSubject, tplHtml) =>
    JSON.stringify([tplName.trim(), tplSubject.trim(), tplHtml || ""]);

  const hasUnsavedChanges =
    !savedId || makeSnapshot(name, subject, current?.html) !== savedSnapshot;

  /* ---------------------------------------------------------
     RESET ON OPEN
  --------------------------------------------------------- */

  useEffect(() => {
    if (!isOpen) return;

    setTab("generate");
    setError("");
    setNotice("");
    setRefineText("");
    setDevice("desktop");

    if (initialTemplate?.html) {
      setVersions([
        {
          html: initialTemplate.html,
          previewText: initialTemplate.previewText || "",
        },
      ]);
      setVersionIndex(0);
      setName(initialTemplate.name || "");
      setSubject(initialTemplate.subject || "");
      setPrompt(initialTemplate.prompt || "");
      setSavedId(initialTemplate._id || null);
      setSavedSnapshot(
        initialTemplate._id
          ? makeSnapshot(
              initialTemplate.name || "",
              initialTemplate.subject || "",
              initialTemplate.html,
            )
          : "",
      );
      setMobilePane("preview");
    } else {
      setVersions([]);
      setVersionIndex(-1);
      setName("");
      setSubject("");
      setPrompt("");
      setSavedId(null);
      setSavedSnapshot("");
      setMobilePane("brief");
      setTimeout(() => promptRef.current?.focus(), 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* ---------------------------------------------------------
     ESC TO CLOSE
  --------------------------------------------------------- */

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busy) onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, busy, onClose]);

  /* ---------------------------------------------------------
     GENERATE / REFINE
  --------------------------------------------------------- */

  const runGenerate = async (isRefine = false) => {
    if (isGenerating) return;

    const brief = (isRefine ? refineText : prompt).trim();

    if (brief.length < 5) {
      setError(
        isRefine
          ? "Describe what you want to change."
          : "Describe the email: the offer, who it's for, and any dates or details.",
      );
      return;
    }

    setError("");
    setNotice("");
    setIsGenerating(true);
    setMobilePane("preview");
    saveBrand(brand);

    try {
      const res = await generateEmailTemplate({
        prompt: brief,
        tone,
        brandName: brand.brandName,
        primaryColor: brand.primaryColor,
        logoUrl: brand.logoUrl,
        ctaText,
        ctaUrl,
        previousTemplate:
          isRefine && current ? { subject, html: current.html } : undefined,
      });

      const doc = res?.doc;
      if (!doc?.html) throw new Error("Empty template");

      const nextVersions = [
        ...versions.slice(0, versionIndex + 1),
        { html: doc.html, previewText: doc.previewText || "" },
      ];

      setVersions(nextVersions);
      setVersionIndex(nextVersions.length - 1);

      if (doc.subject) setSubject(doc.subject);
      if (doc.name && (!name.trim() || (!isRefine && !savedId))) {
        setName(doc.name);
      }
      if (isRefine) setRefineText("");
    } catch (err) {
      setError(
        getErrorMessage(err, "Could not generate the template. Try again."),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptKeyDown = (event) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      runGenerate(false);
    }
  };

  /* ---------------------------------------------------------
     PICK SAVED (compose mode)
  --------------------------------------------------------- */

  const handlePickSaved = useCallback((template) => {
    setVersions([
      { html: template.html, previewText: template.previewText || "" },
    ]);
    setVersionIndex(0);
    setName(template.name || "");
    setSubject(template.subject || "");
    setPrompt(template.prompt || "");
    setSavedId(template._id || null);
    setSavedSnapshot(
      JSON.stringify([
        (template.name || "").trim(),
        (template.subject || "").trim(),
        template.html || "",
      ]),
    );
    setError("");
    setNotice("");
    setMobilePane("preview");
  }, []);

  /* ---------------------------------------------------------
     SAVE / USE
  --------------------------------------------------------- */

  /**
   * Creates the template (first time) or updates it (already saved).
   * Returns the saved doc, or null if saving failed (error is shown).
   */
  const saveCurrent = async () => {
    if (!current) return null;

    const wasSaved = Boolean(savedId);
    const payload = {
      name: name.trim() || "Untitled template",
      subject: subject.trim(),
      previewText: current.previewText,
      html: current.html,
      prompt: prompt.trim(),
    };

    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      const res = wasSaved
        ? await updateEmailTemplate(savedId, payload)
        : await createEmailTemplate(payload);

      const doc = res?.doc;
      if (doc?._id) setSavedId(doc._id);
      setSavedSnapshot(
        makeSnapshot(payload.name, payload.subject, payload.html),
      );
      if (payload.name !== name) setName(payload.name);

      onSaved?.(doc);
      return doc || { ...payload, _id: savedId };
    } catch (err) {
      setError(getErrorMessage(err, "Could not save the template."));
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // "Save template" — stays open in compose mode, closes on the Templates page
  const handleSave = async () => {
    if (!current || isSaving) return;

    const wasSaved = Boolean(savedId);
    const doc = await saveCurrent();
    if (!doc) return;

    if (!isComposeMode) {
      onClose?.();
      return;
    }

    setNotice(wasSaved ? "Template updated." : "Template saved.");
  };

  // "Save & use" — saves (only if something changed), then puts it in the email
  const handleSaveAndUse = async () => {
    if (!current || busy) return;

    let templateId = savedId;

    if (hasUnsavedChanges) {
      const doc = await saveCurrent();
      if (!doc) return; // save failed — stay open so the user sees the error
      templateId = doc._id || templateId;
    }

    onUse?.({
      _id: templateId,
      name: name.trim() || "Untitled template",
      subject: subject.trim(),
      previewText: current.previewText,
      html: current.html,
      prompt: prompt.trim(),
    });
    onClose?.();
  };

  if (!isOpen) return null;

  /* =========================================================
     RENDER
  ========================================================= */

  return createPortal(
    <div
      className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/40 sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-template-title"
        className="flex h-full w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl sm:h-[90vh] sm:rounded-2xl"
      >
        {/* HEADER */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FiZap size={16} />
            </span>
            <div className="min-w-0">
              <h2
                id="ai-template-title"
                className="truncate text-sm font-semibold text-gray-900"
              >
                {savedId && !isComposeMode ? "Edit template" : "Email template"}
              </h2>
              <p className="hidden truncate text-xs text-gray-500 sm:block">
                Describe the email, preview it, and refine until it's right.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <FiX size={19} />
          </button>
        </div>

        {/* MOBILE PANE SWITCH */}
        <div className="flex shrink-0 border-b border-gray-200 md:hidden">
          {[
            { key: "brief", label: "Brief" },
            { key: "preview", label: "Preview" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setMobilePane(item.key)}
              className={`flex-1 border-b-2 py-2.5 text-sm font-medium transition ${
                mobilePane === item.key
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="flex min-h-0 flex-1">
          {/* ---------------- LEFT: BRIEF ---------------- */}
          <div
            className={`${
              mobilePane === "brief" ? "flex" : "hidden"
            } min-h-0 w-full flex-col border-gray-200 md:flex md:w-[360px] md:shrink-0 md:border-r`}
          >
            {isComposeMode && (
              <div className="flex shrink-0 gap-1 border-b border-gray-200 p-2">
                <TabButton
                  active={tab === "generate"}
                  onClick={() => setTab("generate")}
                  icon={<FiZap size={14} />}
                  label="Generate with AI"
                />
                <TabButton
                  active={tab === "saved"}
                  onClick={() => setTab("saved")}
                  icon={<FiLayout size={14} />}
                  label="Saved templates"
                />
              </div>
            )}

            {tab === "saved" && isComposeMode ? (
              <SavedTemplatesPicker
                selectedId={savedId}
                onPick={handlePickSaved}
              />
            ) : (
              <>
                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                  <div>
                    <label htmlFor="ai-template-prompt" className={labelClass}>
                      What should this email say?
                    </label>
                    <textarea
                      id="ai-template-prompt"
                      ref={promptRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={handlePromptKeyDown}
                      rows={6}
                      maxLength={2000}
                      disabled={isGenerating}
                      placeholder="e.g. Diwali offer: 25% off 2-night stays at our Goa villas, valid till 15 November. Breakfast and late checkout included."
                      className={`${inputClass} resize-none leading-6`}
                    />
                    <p className="mt-1 text-[11px] text-gray-400">
                      Include the offer, dates, audience and anything the email
                      must mention. Ctrl + Enter to generate.
                    </p>
                  </div>

                  {!prompt.trim() && !current && (
                    <div>
                      <p className={labelClass}>Or start from an idea</p>
                      <div className="space-y-1.5">
                        {SUGGESTIONS.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              setPrompt(suggestion);
                              promptRef.current?.focus();
                            }}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left text-xs leading-5 text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="ai-template-tone" className={labelClass}>
                        Tone
                      </label>
                      <select
                        id="ai-template-tone"
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        disabled={isGenerating}
                        className={inputClass}
                      >
                        {TONES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="ai-template-brand" className={labelClass}>
                        Brand name
                      </label>
                      <input
                        id="ai-template-brand"
                        type="text"
                        value={brand.brandName}
                        onChange={(e) =>
                          setBrand((b) => ({ ...b, brandName: e.target.value }))
                        }
                        disabled={isGenerating}
                        placeholder="Your property"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowOptions((v) => !v)}
                      aria-expanded={showOptions}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <span>Brand colour, logo and button</span>
                      <FiChevronDown
                        size={15}
                        className={`text-gray-400 transition ${
                          showOptions ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showOptions && (
                      <div className="space-y-3 border-t border-gray-200 p-3">
                        <div>
                          <label
                            htmlFor="ai-template-color"
                            className={labelClass}
                          >
                            Brand colour
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              id="ai-template-color"
                              type="color"
                              value={brand.primaryColor || "#2563eb"}
                              onChange={(e) =>
                                setBrand((b) => ({
                                  ...b,
                                  primaryColor: e.target.value,
                                }))
                              }
                              disabled={isGenerating}
                              className="h-9 w-11 shrink-0 cursor-pointer rounded-md border border-gray-200 bg-white p-1"
                            />
                            <input
                              type="text"
                              value={brand.primaryColor}
                              onChange={(e) =>
                                setBrand((b) => ({
                                  ...b,
                                  primaryColor: e.target.value,
                                }))
                              }
                              disabled={isGenerating}
                              aria-label="Brand colour hex"
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="ai-template-logo"
                            className={labelClass}
                          >
                            Logo URL (optional)
                          </label>
                          <input
                            id="ai-template-logo"
                            type="url"
                            value={brand.logoUrl}
                            onChange={(e) =>
                              setBrand((b) => ({
                                ...b,
                                logoUrl: e.target.value,
                              }))
                            }
                            disabled={isGenerating}
                            placeholder="https://…/logo.png"
                            className={inputClass}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor="ai-template-cta"
                              className={labelClass}
                            >
                              Button text
                            </label>
                            <input
                              id="ai-template-cta"
                              type="text"
                              value={ctaText}
                              onChange={(e) => setCtaText(e.target.value)}
                              disabled={isGenerating}
                              placeholder="Book now"
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="ai-template-cta-url"
                              className={labelClass}
                            >
                              Button link
                            </label>
                            <input
                              id="ai-template-cta-url"
                              type="url"
                              value={ctaUrl}
                              onChange={(e) => setCtaUrl(e.target.value)}
                              disabled={isGenerating}
                              placeholder="https://"
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 border-t border-gray-200 p-4">
                  <button
                    type="button"
                    onClick={() => runGenerate(false)}
                    disabled={isGenerating || prompt.trim().length < 5}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <FiRefreshCw size={15} className="animate-spin" />
                    ) : (
                      <FiZap size={15} />
                    )}
                    {isGenerating
                      ? "Generating…"
                      : current
                        ? "Generate a new version"
                        : "Generate template"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ---------------- RIGHT: PREVIEW ---------------- */}
          <div
            className={`${
              mobilePane === "preview" ? "flex" : "hidden"
            } min-h-0 min-w-0 flex-1 flex-col bg-gray-50 md:flex`}
          >
            {/* Name + subject */}
            {current && (
              <div className="grid shrink-0 grid-cols-1 gap-2 border-b border-gray-200 bg-white px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:px-5">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Template name"
                  aria-label="Template name"
                  disabled={busy}
                  className={inputClass}
                />
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line"
                  aria-label="Subject line"
                  disabled={busy}
                  className={inputClass}
                />
              </div>
            )}

            {/* Toolbar */}
            <div className="flex h-11 shrink-0 items-center justify-between gap-2 px-4 sm:px-5">
              <div className="min-w-0 truncate text-xs text-gray-500">
                {current?.previewText ? (
                  <span title="Inbox preview text">{current.previewText}</span>
                ) : (
                  <span>Preview</span>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {versions.length > 1 && (
                  <div className="flex items-center gap-0.5 text-xs text-gray-500">
                    <button
                      type="button"
                      onClick={() => setVersionIndex((i) => Math.max(0, i - 1))}
                      disabled={versionIndex <= 0 || isGenerating}
                      className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-200 disabled:opacity-30"
                      aria-label="Previous version"
                    >
                      <FiChevronLeft size={15} />
                    </button>
                    <span className="whitespace-nowrap">
                      Version {versionIndex + 1} of {versions.length}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setVersionIndex((i) =>
                          Math.min(versions.length - 1, i + 1),
                        )
                      }
                      disabled={
                        versionIndex >= versions.length - 1 || isGenerating
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-200 disabled:opacity-30"
                      aria-label="Next version"
                    >
                      <FiChevronRight size={15} />
                    </button>
                  </div>
                )}

                <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
                  <DeviceButton
                    active={device === "desktop"}
                    onClick={() => setDevice("desktop")}
                    label="Desktop preview"
                    icon={<FiMonitor size={14} />}
                  />
                  <DeviceButton
                    active={device === "mobile"}
                    onClick={() => setDevice("mobile")}
                    label="Mobile preview"
                    icon={<FiSmartphone size={14} />}
                  />
                </div>
              </div>
            </div>

            {/* Frame */}
            <div className="relative min-h-0 flex-1 px-3 pb-3 sm:px-5">
              {current ? (
                <div
                  className={`mx-auto h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-[width] duration-200 ${
                    device === "mobile"
                      ? "w-[375px] max-w-full"
                      : "w-full max-w-[760px]"
                  }`}
                >
                  <EmailPreviewFrame html={current.html} className="h-full" />
                </div>
              ) : (
                !isGenerating && (
                  <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-6 text-center">
                    <FiLayout size={34} className="mb-3 text-gray-300" />
                    <p className="text-sm font-medium text-gray-700">
                      Your email will appear here
                    </p>
                    <p className="mt-1 max-w-xs text-xs text-gray-400">
                      {isComposeMode
                        ? "Describe the email and generate it, or pick one of your saved templates."
                        : "Describe the email on the left and generate it."}
                    </p>
                  </div>
                )
              )}

              {isGenerating && (
                <div className="absolute inset-0 mx-3 mb-3 flex flex-col items-center justify-center rounded-xl bg-white/85 backdrop-blur-[1px] sm:mx-5">
                  <FiRefreshCw
                    size={24}
                    className="mb-3 animate-spin text-blue-600"
                  />
                  <p className="text-sm font-medium text-gray-800">
                    {current
                      ? "Applying your changes…"
                      : "Designing your email…"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    This usually takes 15–40 seconds.
                  </p>
                </div>
              )}
            </div>

            {/* Refine */}
            {current && (
              <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={refineText}
                    onChange={(e) => setRefineText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        runGenerate(true);
                      }
                    }}
                    disabled={isGenerating}
                    maxLength={1000}
                    placeholder="Ask for a change — e.g. make it shorter, use a dark green header"
                    aria-label="Describe a change"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => runGenerate(true)}
                    disabled={isGenerating || refineText.trim().length < 5}
                    className="flex h-[38px] shrink-0 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiZap size={14} />
                    <span className="hidden sm:inline">Apply change</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex shrink-0 flex-col gap-2 border-t border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p
            className={`min-h-[18px] text-xs ${
              error ? "text-red-600" : "text-green-600"
            }`}
            role={error ? "alert" : "status"}
          >
            {error || notice}
          </p>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="h-9 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            {/* On the Templates page: Save / Update. In compose, "Save & use" does both. */}
            {!isComposeMode && (
              <button
                type="button"
                onClick={handleSave}
                disabled={!current || busy}
                className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiSave size={15} />
                {isSaving
                  ? "Saving…"
                  : savedId
                    ? "Update template"
                    : "Save template"}
              </button>
            )}

            {isComposeMode && (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!current || busy || !hasUnsavedChanges}
                  title={
                    hasUnsavedChanges
                      ? "Save without closing"
                      : "No changes to save"
                  }
                  className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiSave size={15} />
                  <span className="hidden sm:inline">
                    {savedId ? "Update" : "Save"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndUse}
                  disabled={!current || busy}
                  className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiCheck size={15} />
                  {isSaving
                    ? "Saving…"
                    : hasUnsavedChanges
                      ? "Save & use"
                      : "Use this template"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ---------------------------------------------------------
   SMALL PIECES
--------------------------------------------------------- */

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
        active ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function DeviceButton({ active, onClick, label, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex h-7 w-8 items-center justify-center rounded-md transition ${
        active ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      {icon}
    </button>
  );
}

function SavedTemplatesPicker({ selectedId, onPick }) {
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        const res = await getEmailTemplates({
          page: 1,
          limit: 50,
          search: search.trim(),
        });
        if (!cancelled) setTemplates(res?.doc || []);
      } catch (err) {
        console.error("Failed to load templates:", err);
        if (!cancelled) setLoadError("Could not load your templates.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 p-3">
        <div className="relative">
          <FiSearch
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates"
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-gray-400">
            Loading templates…
          </p>
        ) : loadError ? (
          <p className="py-10 text-center text-sm text-red-600">{loadError}</p>
        ) : templates.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-medium text-gray-700">
              {search.trim()
                ? "No matching templates"
                : "No saved templates yet"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Generate one with AI and save it to reuse it here.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {templates.map((template) => {
              const isSelected = template._id === selectedId;
              return (
                <button
                  key={template._id}
                  type="button"
                  onClick={() => onPick(template)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
                    isSelected
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <p className="truncate text-sm font-medium text-gray-900">
                    {template.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {template.subject || "No subject"}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// import { useCallback, useEffect, useRef, useState } from "react";
// import { createPortal } from "react-dom";
// import {
//   FiCheck,
//   FiChevronDown,
//   FiChevronLeft,
//   FiChevronRight,
//   FiLayout,
//   FiMonitor,
//   FiRefreshCw,
//   FiSave,
//   FiSearch,
//   FiSmartphone,
//   FiX,
//   FiZap,
// } from "react-icons/fi";

// import {
//   createEmailTemplate,
//   generateEmailTemplate,
//   getEmailTemplates,
//   updateEmailTemplate,
// } from "../../../services/api/emailTemplate";
// import EmailPreviewFrame from "./EmailPreviewFrame";

// /* ---------------------------------------------------------
//    CONSTANTS
// --------------------------------------------------------- */

// const SUGGESTIONS = [
//   "Festive season offer: 20% off direct bookings for stays in November and December",
//   "Welcome email for guests who just booked, with check-in tips and what to pack",
//   "Monthly newsletter with property updates, a new experience and a seasonal menu",
//   "Win back past guests who haven't stayed with us in over a year",
// ];

// const TONES = [
//   { value: "friendly", label: "Friendly" },
//   { value: "warm", label: "Warm" },
//   { value: "professional", label: "Professional" },
//   { value: "luxurious", label: "Luxurious" },
//   { value: "playful", label: "Playful" },
//   { value: "urgent", label: "Urgent" },
// ];

// const BRAND_STORAGE_KEY = "eazomail:ai-brand";

// const loadBrand = () => {
//   try {
//     return JSON.parse(localStorage.getItem(BRAND_STORAGE_KEY)) || {};
//   } catch {
//     return {};
//   }
// };

// const saveBrand = (brand) => {
//   try {
//     localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(brand));
//   } catch {
//     /* storage unavailable — ignore */
//   }
// };

// // API errors carry the server's message; network errors fall back to a friendly one
// const getErrorMessage = (error, fallback) =>
//   error?.isApiError && error?.message ? error.message : fallback;

// const inputClass =
//   "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60";

// const labelClass = "mb-1.5 block text-xs font-medium text-gray-600";

// /* =========================================================
//    MODAL
//    mode="compose" → "Use this template" + saved templates tab
//    mode="manage"  → create / edit from the Templates page
// ========================================================= */

// export default function AITemplateModal({
//   isOpen,
//   onClose,
//   mode = "compose",
//   initialTemplate = null,
//   onUse,
//   onSaved,
// }) {
//   const isComposeMode = mode === "compose";

//   const [tab, setTab] = useState("generate"); // generate | saved
//   const [mobilePane, setMobilePane] = useState("brief"); // brief | preview

//   const [prompt, setPrompt] = useState("");
//   const [tone, setTone] = useState("friendly");
//   const [brand, setBrand] = useState(() => ({
//     brandName: "",
//     primaryColor: "#2563eb",
//     logoUrl: "",
//     ...loadBrand(),
//   }));
//   const [ctaText, setCtaText] = useState("");
//   const [ctaUrl, setCtaUrl] = useState("");
//   const [showOptions, setShowOptions] = useState(false);

//   // Each generation is a version, so the user can go back
//   const [versions, setVersions] = useState([]);
//   const [versionIndex, setVersionIndex] = useState(-1);
//   const [name, setName] = useState("");
//   const [subject, setSubject] = useState("");
//   const [refineText, setRefineText] = useState("");
//   const [device, setDevice] = useState("desktop");

//   const [isGenerating, setIsGenerating] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [savedId, setSavedId] = useState(null);

//   const promptRef = useRef(null);

//   const current = versionIndex >= 0 ? versions[versionIndex] : null;
//   const busy = isGenerating || isSaving;

//   /* ---------------------------------------------------------
//      RESET ON OPEN
//   --------------------------------------------------------- */

//   useEffect(() => {
//     if (!isOpen) return;

//     setTab("generate");
//     setError("");
//     setNotice("");
//     setRefineText("");
//     setDevice("desktop");

//     if (initialTemplate?.html) {
//       setVersions([
//         {
//           html: initialTemplate.html,
//           previewText: initialTemplate.previewText || "",
//         },
//       ]);
//       setVersionIndex(0);
//       setName(initialTemplate.name || "");
//       setSubject(initialTemplate.subject || "");
//       setPrompt(initialTemplate.prompt || "");
//       setSavedId(initialTemplate._id || null);
//       setMobilePane("preview");
//     } else {
//       setVersions([]);
//       setVersionIndex(-1);
//       setName("");
//       setSubject("");
//       setPrompt("");
//       setSavedId(null);
//       setMobilePane("brief");
//       setTimeout(() => promptRef.current?.focus(), 60);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isOpen]);

//   /* ---------------------------------------------------------
//      ESC TO CLOSE
//   --------------------------------------------------------- */

//   useEffect(() => {
//     if (!isOpen) return undefined;

//     const onKeyDown = (event) => {
//       if (event.key === "Escape" && !busy) onClose?.();
//     };

//     window.addEventListener("keydown", onKeyDown);
//     return () => window.removeEventListener("keydown", onKeyDown);
//   }, [isOpen, busy, onClose]);

//   /* ---------------------------------------------------------
//      GENERATE / REFINE
//   --------------------------------------------------------- */

//   const runGenerate = async (isRefine = false) => {
//     if (isGenerating) return;

//     const brief = (isRefine ? refineText : prompt).trim();

//     if (brief.length < 5) {
//       setError(
//         isRefine
//           ? "Describe what you want to change."
//           : "Describe the email: the offer, who it's for, and any dates or details.",
//       );
//       return;
//     }

//     setError("");
//     setNotice("");
//     setIsGenerating(true);
//     setMobilePane("preview");
//     saveBrand(brand);

//     try {
//       const res = await generateEmailTemplate({
//         prompt: brief,
//         tone,
//         brandName: brand.brandName,
//         primaryColor: brand.primaryColor,
//         logoUrl: brand.logoUrl,
//         ctaText,
//         ctaUrl,
//         previousTemplate:
//           isRefine && current ? { subject, html: current.html } : undefined,
//       });

//       const doc = res?.doc;
//       if (!doc?.html) throw new Error("Empty template");

//       const nextVersions = [
//         ...versions.slice(0, versionIndex + 1),
//         { html: doc.html, previewText: doc.previewText || "" },
//       ];

//       setVersions(nextVersions);
//       setVersionIndex(nextVersions.length - 1);

//       if (doc.subject) setSubject(doc.subject);
//       if (doc.name && (!name.trim() || (!isRefine && !savedId))) {
//         setName(doc.name);
//       }
//       if (isRefine) setRefineText("");
//     } catch (err) {
//       setError(
//         getErrorMessage(err, "Could not generate the template. Try again."),
//       );
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const handlePromptKeyDown = (event) => {
//     if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
//       event.preventDefault();
//       runGenerate(false);
//     }
//   };

//   /* ---------------------------------------------------------
//      PICK SAVED (compose mode)
//   --------------------------------------------------------- */

//   const handlePickSaved = useCallback((template) => {
//     setVersions([
//       { html: template.html, previewText: template.previewText || "" },
//     ]);
//     setVersionIndex(0);
//     setName(template.name || "");
//     setSubject(template.subject || "");
//     setPrompt(template.prompt || "");
//     setSavedId(template._id || null);
//     setError("");
//     setNotice("");
//     setMobilePane("preview");
//   }, []);

//   /* ---------------------------------------------------------
//      SAVE / USE
//   --------------------------------------------------------- */

//   const handleSave = async () => {
//     if (!current || isSaving) return;

//     const wasSaved = Boolean(savedId);
//     const payload = {
//       name: name.trim() || "Untitled template",
//       subject: subject.trim(),
//       previewText: current.previewText,
//       html: current.html,
//       prompt: prompt.trim(),
//     };

//     setIsSaving(true);
//     setError("");
//     setNotice("");

//     try {
//       const res = wasSaved
//         ? await updateEmailTemplate(savedId, payload)
//         : await createEmailTemplate(payload);

//       const doc = res?.doc;
//       if (doc?._id) setSavedId(doc._id);

//       onSaved?.(doc);

//       if (!isComposeMode) {
//         onClose?.();
//         return;
//       }

//       setNotice(wasSaved ? "Template updated." : "Template saved.");
//     } catch (err) {
//       setError(getErrorMessage(err, "Could not save the template."));
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleUse = () => {
//     if (!current) return;

//     onUse?.({
//       _id: savedId,
//       name: name.trim(),
//       subject: subject.trim(),
//       previewText: current.previewText,
//       html: current.html,
//       prompt: prompt.trim(),
//     });
//     onClose?.();
//   };

//   if (!isOpen) return null;

//   /* =========================================================
//      RENDER
//   ========================================================= */

//   return createPortal(
//     <div
//       className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/40 sm:p-4"
//       onMouseDown={(event) => {
//         if (event.target === event.currentTarget && !busy) onClose?.();
//       }}
//     >
//       <div
//         role="dialog"
//         aria-modal="true"
//         aria-labelledby="ai-template-title"
//         className="flex h-full w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl sm:h-[90vh] sm:rounded-2xl"
//       >
//         {/* HEADER */}
//         <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-4 sm:px-5">
//           <div className="flex min-w-0 items-center gap-3">
//             <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
//               <FiZap size={16} />
//             </span>
//             <div className="min-w-0">
//               <h2
//                 id="ai-template-title"
//                 className="truncate text-sm font-semibold text-gray-900"
//               >
//                 {savedId && !isComposeMode ? "Edit template" : "Email template"}
//               </h2>
//               <p className="hidden truncate text-xs text-gray-500 sm:block">
//                 Describe the email, preview it, and refine until it's right.
//               </p>
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={onClose}
//             disabled={busy}
//             className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
//             aria-label="Close"
//           >
//             <FiX size={19} />
//           </button>
//         </div>

//         {/* MOBILE PANE SWITCH */}
//         <div className="flex shrink-0 border-b border-gray-200 md:hidden">
//           {[
//             { key: "brief", label: "Brief" },
//             { key: "preview", label: "Preview" },
//           ].map((item) => (
//             <button
//               key={item.key}
//               type="button"
//               onClick={() => setMobilePane(item.key)}
//               className={`flex-1 border-b-2 py-2.5 text-sm font-medium transition ${
//                 mobilePane === item.key
//                   ? "border-blue-600 text-blue-700"
//                   : "border-transparent text-gray-500"
//               }`}
//             >
//               {item.label}
//             </button>
//           ))}
//         </div>

//         {/* BODY */}
//         <div className="flex min-h-0 flex-1">
//           {/* ---------------- LEFT: BRIEF ---------------- */}
//           <div
//             className={`${
//               mobilePane === "brief" ? "flex" : "hidden"
//             } min-h-0 w-full flex-col border-gray-200 md:flex md:w-[360px] md:shrink-0 md:border-r`}
//           >
//             {isComposeMode && (
//               <div className="flex shrink-0 gap-1 border-b border-gray-200 p-2">
//                 <TabButton
//                   active={tab === "generate"}
//                   onClick={() => setTab("generate")}
//                   icon={<FiZap size={14} />}
//                   label="Generate with AI"
//                 />
//                 <TabButton
//                   active={tab === "saved"}
//                   onClick={() => setTab("saved")}
//                   icon={<FiLayout size={14} />}
//                   label="Saved templates"
//                 />
//               </div>
//             )}

//             {tab === "saved" && isComposeMode ? (
//               <SavedTemplatesPicker
//                 selectedId={savedId}
//                 onPick={handlePickSaved}
//               />
//             ) : (
//               <>
//                 <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
//                   <div>
//                     <label htmlFor="ai-template-prompt" className={labelClass}>
//                       What should this email say?
//                     </label>
//                     <textarea
//                       id="ai-template-prompt"
//                       ref={promptRef}
//                       value={prompt}
//                       onChange={(e) => setPrompt(e.target.value)}
//                       onKeyDown={handlePromptKeyDown}
//                       rows={6}
//                       maxLength={2000}
//                       disabled={isGenerating}
//                       placeholder="e.g. Diwali offer: 25% off 2-night stays at our Goa villas, valid till 15 November. Breakfast and late checkout included."
//                       className={`${inputClass} resize-none leading-6`}
//                     />
//                     <p className="mt-1 text-[11px] text-gray-400">
//                       Include the offer, dates, audience and anything the email
//                       must mention. Ctrl + Enter to generate.
//                     </p>
//                   </div>

//                   {!prompt.trim() && !current && (
//                     <div>
//                       <p className={labelClass}>Or start from an idea</p>
//                       <div className="space-y-1.5">
//                         {SUGGESTIONS.map((suggestion) => (
//                           <button
//                             key={suggestion}
//                             type="button"
//                             onClick={() => {
//                               setPrompt(suggestion);
//                               promptRef.current?.focus();
//                             }}
//                             className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left text-xs leading-5 text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
//                           >
//                             {suggestion}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   <div className="grid grid-cols-2 gap-3">
//                     <div>
//                       <label htmlFor="ai-template-tone" className={labelClass}>
//                         Tone
//                       </label>
//                       <select
//                         id="ai-template-tone"
//                         value={tone}
//                         onChange={(e) => setTone(e.target.value)}
//                         disabled={isGenerating}
//                         className={inputClass}
//                       >
//                         {TONES.map((t) => (
//                           <option key={t.value} value={t.value}>
//                             {t.label}
//                           </option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label htmlFor="ai-template-brand" className={labelClass}>
//                         Brand name
//                       </label>
//                       <input
//                         id="ai-template-brand"
//                         type="text"
//                         value={brand.brandName}
//                         onChange={(e) =>
//                           setBrand((b) => ({ ...b, brandName: e.target.value }))
//                         }
//                         disabled={isGenerating}
//                         placeholder="Your property"
//                         className={inputClass}
//                       />
//                     </div>
//                   </div>

//                   <div className="rounded-lg border border-gray-200">
//                     <button
//                       type="button"
//                       onClick={() => setShowOptions((v) => !v)}
//                       aria-expanded={showOptions}
//                       className="flex w-full items-center justify-between px-3 py-2.5 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
//                     >
//                       <span>Brand colour, logo and button</span>
//                       <FiChevronDown
//                         size={15}
//                         className={`text-gray-400 transition ${
//                           showOptions ? "rotate-180" : ""
//                         }`}
//                       />
//                     </button>

//                     {showOptions && (
//                       <div className="space-y-3 border-t border-gray-200 p-3">
//                         <div>
//                           <label
//                             htmlFor="ai-template-color"
//                             className={labelClass}
//                           >
//                             Brand colour
//                           </label>
//                           <div className="flex items-center gap-2">
//                             <input
//                               id="ai-template-color"
//                               type="color"
//                               value={brand.primaryColor || "#2563eb"}
//                               onChange={(e) =>
//                                 setBrand((b) => ({
//                                   ...b,
//                                   primaryColor: e.target.value,
//                                 }))
//                               }
//                               disabled={isGenerating}
//                               className="h-9 w-11 shrink-0 cursor-pointer rounded-md border border-gray-200 bg-white p-1"
//                             />
//                             <input
//                               type="text"
//                               value={brand.primaryColor}
//                               onChange={(e) =>
//                                 setBrand((b) => ({
//                                   ...b,
//                                   primaryColor: e.target.value,
//                                 }))
//                               }
//                               disabled={isGenerating}
//                               aria-label="Brand colour hex"
//                               className={inputClass}
//                             />
//                           </div>
//                         </div>

//                         <div>
//                           <label
//                             htmlFor="ai-template-logo"
//                             className={labelClass}
//                           >
//                             Logo URL (optional)
//                           </label>
//                           <input
//                             id="ai-template-logo"
//                             type="url"
//                             value={brand.logoUrl}
//                             onChange={(e) =>
//                               setBrand((b) => ({
//                                 ...b,
//                                 logoUrl: e.target.value,
//                               }))
//                             }
//                             disabled={isGenerating}
//                             placeholder="https://…/logo.png"
//                             className={inputClass}
//                           />
//                         </div>

//                         <div className="grid grid-cols-2 gap-3">
//                           <div>
//                             <label
//                               htmlFor="ai-template-cta"
//                               className={labelClass}
//                             >
//                               Button text
//                             </label>
//                             <input
//                               id="ai-template-cta"
//                               type="text"
//                               value={ctaText}
//                               onChange={(e) => setCtaText(e.target.value)}
//                               disabled={isGenerating}
//                               placeholder="Book now"
//                               className={inputClass}
//                             />
//                           </div>
//                           <div>
//                             <label
//                               htmlFor="ai-template-cta-url"
//                               className={labelClass}
//                             >
//                               Button link
//                             </label>
//                             <input
//                               id="ai-template-cta-url"
//                               type="url"
//                               value={ctaUrl}
//                               onChange={(e) => setCtaUrl(e.target.value)}
//                               disabled={isGenerating}
//                               placeholder="https://"
//                               className={inputClass}
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="shrink-0 border-t border-gray-200 p-4">
//                   <button
//                     type="button"
//                     onClick={() => runGenerate(false)}
//                     disabled={isGenerating || prompt.trim().length < 5}
//                     className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
//                   >
//                     {isGenerating ? (
//                       <FiRefreshCw size={15} className="animate-spin" />
//                     ) : (
//                       <FiZap size={15} />
//                     )}
//                     {isGenerating
//                       ? "Generating…"
//                       : current
//                         ? "Generate a new version"
//                         : "Generate template"}
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>

//           {/* ---------------- RIGHT: PREVIEW ---------------- */}
//           <div
//             className={`${
//               mobilePane === "preview" ? "flex" : "hidden"
//             } min-h-0 min-w-0 flex-1 flex-col bg-gray-50 md:flex`}
//           >
//             {/* Name + subject */}
//             {current && (
//               <div className="grid shrink-0 grid-cols-1 gap-2 border-b border-gray-200 bg-white px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:px-5">
//                 <input
//                   type="text"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   placeholder="Template name"
//                   aria-label="Template name"
//                   disabled={busy}
//                   className={inputClass}
//                 />
//                 <input
//                   type="text"
//                   value={subject}
//                   onChange={(e) => setSubject(e.target.value)}
//                   placeholder="Subject line"
//                   aria-label="Subject line"
//                   disabled={busy}
//                   className={inputClass}
//                 />
//               </div>
//             )}

//             {/* Toolbar */}
//             <div className="flex h-11 shrink-0 items-center justify-between gap-2 px-4 sm:px-5">
//               <div className="min-w-0 truncate text-xs text-gray-500">
//                 {current?.previewText ? (
//                   <span title="Inbox preview text">{current.previewText}</span>
//                 ) : (
//                   <span>Preview</span>
//                 )}
//               </div>

//               <div className="flex shrink-0 items-center gap-2">
//                 {versions.length > 1 && (
//                   <div className="flex items-center gap-0.5 text-xs text-gray-500">
//                     <button
//                       type="button"
//                       onClick={() => setVersionIndex((i) => Math.max(0, i - 1))}
//                       disabled={versionIndex <= 0 || isGenerating}
//                       className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-200 disabled:opacity-30"
//                       aria-label="Previous version"
//                     >
//                       <FiChevronLeft size={15} />
//                     </button>
//                     <span className="whitespace-nowrap">
//                       Version {versionIndex + 1} of {versions.length}
//                     </span>
//                     <button
//                       type="button"
//                       onClick={() =>
//                         setVersionIndex((i) =>
//                           Math.min(versions.length - 1, i + 1),
//                         )
//                       }
//                       disabled={
//                         versionIndex >= versions.length - 1 || isGenerating
//                       }
//                       className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-gray-200 disabled:opacity-30"
//                       aria-label="Next version"
//                     >
//                       <FiChevronRight size={15} />
//                     </button>
//                   </div>
//                 )}

//                 <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
//                   <DeviceButton
//                     active={device === "desktop"}
//                     onClick={() => setDevice("desktop")}
//                     label="Desktop preview"
//                     icon={<FiMonitor size={14} />}
//                   />
//                   <DeviceButton
//                     active={device === "mobile"}
//                     onClick={() => setDevice("mobile")}
//                     label="Mobile preview"
//                     icon={<FiSmartphone size={14} />}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Frame */}
//             <div className="relative min-h-0 flex-1 px-3 pb-3 sm:px-5">
//               {current ? (
//                 <div
//                   className={`mx-auto h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-[width] duration-200 ${
//                     device === "mobile"
//                       ? "w-[375px] max-w-full"
//                       : "w-full max-w-[760px]"
//                   }`}
//                 >
//                   <EmailPreviewFrame html={current.html} className="h-full" />
//                 </div>
//               ) : (
//                 !isGenerating && (
//                   <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-6 text-center">
//                     <FiLayout size={34} className="mb-3 text-gray-300" />
//                     <p className="text-sm font-medium text-gray-700">
//                       Your email will appear here
//                     </p>
//                     <p className="mt-1 max-w-xs text-xs text-gray-400">
//                       {isComposeMode
//                         ? "Describe the email and generate it, or pick one of your saved templates."
//                         : "Describe the email on the left and generate it."}
//                     </p>
//                   </div>
//                 )
//               )}

//               {isGenerating && (
//                 <div className="absolute inset-0 mx-3 mb-3 flex flex-col items-center justify-center rounded-xl bg-white/85 backdrop-blur-[1px] sm:mx-5">
//                   <FiRefreshCw
//                     size={24}
//                     className="mb-3 animate-spin text-blue-600"
//                   />
//                   <p className="text-sm font-medium text-gray-800">
//                     {current
//                       ? "Applying your changes…"
//                       : "Designing your email…"}
//                   </p>
//                   <p className="mt-1 text-xs text-gray-500">
//                     This usually takes 15–40 seconds.
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Refine */}
//             {current && (
//               <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3 sm:px-5">
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="text"
//                     value={refineText}
//                     onChange={(e) => setRefineText(e.target.value)}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") {
//                         e.preventDefault();
//                         runGenerate(true);
//                       }
//                     }}
//                     disabled={isGenerating}
//                     maxLength={1000}
//                     placeholder="Ask for a change — e.g. make it shorter, use a dark green header"
//                     aria-label="Describe a change"
//                     className={inputClass}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => runGenerate(true)}
//                     disabled={isGenerating || refineText.trim().length < 5}
//                     className="flex h-[38px] shrink-0 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
//                   >
//                     <FiZap size={14} />
//                     <span className="hidden sm:inline">Apply change</span>
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* FOOTER */}
//         <div className="flex shrink-0 flex-col gap-2 border-t border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
//           <p
//             className={`min-h-[18px] text-xs ${
//               error ? "text-red-600" : "text-green-600"
//             }`}
//             role={error ? "alert" : "status"}
//           >
//             {error || notice}
//           </p>

//           <div className="flex flex-wrap items-center justify-end gap-2">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={busy}
//               className="h-9 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
//             >
//               Cancel
//             </button>

//             <button
//               type="button"
//               onClick={handleSave}
//               disabled={!current || busy}
//               className={`flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
//                 isComposeMode
//                   ? "border border-gray-200 text-gray-700 hover:bg-gray-50"
//                   : "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
//               }`}
//             >
//               <FiSave size={15} />
//               {isSaving
//                 ? "Saving…"
//                 : savedId
//                   ? "Update template"
//                   : "Save template"}
//             </button>

//             {isComposeMode && (
//               <button
//                 type="button"
//                 onClick={handleUse}
//                 disabled={!current || busy}
//                 className="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 <FiCheck size={15} />
//                 Use this template
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>,
//     document.body,
//   );
// }

// /* ---------------------------------------------------------
//    SMALL PIECES
// --------------------------------------------------------- */

// function TabButton({ active, onClick, icon, label }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
//         active ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"
//       }`}
//     >
//       {icon}
//       {label}
//     </button>
//   );
// }

// function DeviceButton({ active, onClick, label, icon }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       aria-label={label}
//       aria-pressed={active}
//       title={label}
//       className={`flex h-7 w-8 items-center justify-center rounded-md transition ${
//         active ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
//       }`}
//     >
//       {icon}
//     </button>
//   );
// }

// function SavedTemplatesPicker({ selectedId, onPick }) {
//   const [templates, setTemplates] = useState([]);
//   const [search, setSearch] = useState("");
//   const [isLoading, setIsLoading] = useState(true);
//   const [loadError, setLoadError] = useState("");

//   useEffect(() => {
//     let cancelled = false;

//     const timer = setTimeout(async () => {
//       try {
//         setIsLoading(true);
//         setLoadError("");
//         const res = await getEmailTemplates({
//           page: 1,
//           limit: 50,
//           search: search.trim(),
//         });
//         if (!cancelled) setTemplates(res?.doc || []);
//       } catch (err) {
//         console.error("Failed to load templates:", err);
//         if (!cancelled) setLoadError("Could not load your templates.");
//       } finally {
//         if (!cancelled) setIsLoading(false);
//       }
//     }, 250);

//     return () => {
//       cancelled = true;
//       clearTimeout(timer);
//     };
//   }, [search]);

//   return (
//     <div className="flex min-h-0 flex-1 flex-col">
//       <div className="shrink-0 p-3">
//         <div className="relative">
//           <FiSearch
//             size={16}
//             className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//           />
//           <input
//             type="text"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search templates"
//             className={`${inputClass} pl-9`}
//           />
//         </div>
//       </div>

//       <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
//         {isLoading ? (
//           <p className="py-10 text-center text-sm text-gray-400">
//             Loading templates…
//           </p>
//         ) : loadError ? (
//           <p className="py-10 text-center text-sm text-red-600">{loadError}</p>
//         ) : templates.length === 0 ? (
//           <div className="py-10 text-center">
//             <p className="text-sm font-medium text-gray-700">
//               {search.trim()
//                 ? "No matching templates"
//                 : "No saved templates yet"}
//             </p>
//             <p className="mt-1 text-xs text-gray-400">
//               Generate one with AI and save it to reuse it here.
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-1.5">
//             {templates.map((template) => {
//               const isSelected = template._id === selectedId;
//               return (
//                 <button
//                   key={template._id}
//                   type="button"
//                   onClick={() => onPick(template)}
//                   className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
//                     isSelected
//                       ? "border-blue-300 bg-blue-50"
//                       : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
//                   }`}
//                 >
//                   <p className="truncate text-sm font-medium text-gray-900">
//                     {template.name}
//                   </p>
//                   <p className="mt-0.5 truncate text-xs text-gray-500">
//                     {template.subject || "No subject"}
//                   </p>
//                 </button>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
