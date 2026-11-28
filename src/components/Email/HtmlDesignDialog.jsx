import { CheckCircle2, FolderOpen, ImagePlus, Loader2, Monitor, Smartphone, Sparkles, TriangleAlert, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AiPausedNotice from "../AiCredits/AiPausedNotice";
import { useAiAccess } from "../AiCredits/useAiAccess";
import { FittedEmailPreview } from "../../pages/EmailMarketing/components/EmailPreviewFrame";
import { aiMobileEmail, createEmailTemplate, updateEmailTemplate } from "../../redux/api/emailMarketingApi";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import { htmlTemplateImporter } from "./htmlTemplateImporter";

const isHtmlFile = (f) => /\.html?$/i.test(f.name) || f.type === "text/html";

function Check({ ok, children, action }) {
  return (
    <li className="flex items-start gap-2.5 py-2">
      {ok ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
      )}
      <div className="min-w-0 flex-1 text-sm text-app-text">
        {children}
        {action && <div className="mt-2 flex flex-wrap gap-2">{action}</div>}
      </div>
    </li>
  );
}

// "Upload HTML design": reads the picked .html (and any picture files picked
// with it), then shows, before it goes into the email:
//  - a desktop / phone preview,
//  - pictures: embedded ones are uploaded and linked; ones pointing at the
//    computer ("images/hero.jpg") can be picked here (files or the folder),
//  - whether it will fit a phone, with "Make it mobile-ready with AI",
//    which rebuilds the layout (1–3 minutes) and can be undone.
//
//  - saved by itself to Email marketing → Templates (whole, styles included) as
//    soon as it is read, and updated after the AI rebuild or added pictures. The
//    server keeps one template per design, so uploading it again adds no copy.
//    (Before, an uploaded design was used for one email only.)
//
//   files     the File[] chosen (null = closed)
//   onUse({ name, subject, html })
export default function HtmlDesignDialog({ files, onClose, onUse }) {
  const aiAccess = useAiAccess();
  const [templateId, setTemplateId] = useState(null); // the template this design is saved as
  const [savedHtml, setSavedHtml] = useState(""); // the html the template has now
  const [saveState, setSaveState] = useState(""); // "" | "saving" | "saved" | "failed"
  const saving = useRef(false);
  const [design, setDesign] = useState(null); // what htmlTemplateImporter.read gives back
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(""); // "" | "reading" | "pictures" | "ai"
  const [device, setDevice] = useState("ios");
  const [beforeAi, setBeforeAi] = useState(null); // html before the AI, for Undo
  const [aiNote, setAiNote] = useState(null); // { missing }
  const [seconds, setSeconds] = useState(0);
  const pictureInput = useRef(null);
  const folderInput = useRef(null);
  const open = Boolean(files);

  useEffect(() => {
    if (!files) return;
    const html = files.find(isHtmlFile);
    setDesign(null);
    setError("");
    setTemplateId(null);
    setSavedHtml("");
    setSaveState("");
    setBeforeAi(null);
    setAiNote(null);
    setDevice("ios");
    if (!html) {
      setError("Pick an .html file (you can pick its pictures together with it).");
      return;
    }
    setBusy("reading");
    htmlTemplateImporter
      .read(html, files.filter((f) => f !== html))
      .then(setDesign)
      .catch((e) => setError(e?.message || "Couldn't read that file."))
      .finally(() => setBusy(""));
  }, [files]);

  // a clock while the AI works, so a long wait doesn't look stuck
  useEffect(() => {
    if (busy !== "ai") return undefined;
    setSeconds(0);
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [busy]);

  const update = (html) => {
    const bytes = new Blob([html]).size;
    setDesign((d) => ({
      ...d,
      html,
      sizeKb: Math.round(bytes / 1024),
      tooLongForGmail: bytes > 102 * 1024,
      localImages: htmlTemplateImporter.localImagePaths(html),
    }));
  };

  const addPictures = async (picked) => {
    if (!picked.length || !design) return;
    setBusy("pictures");
    setError("");
    try {
      const result = await htmlTemplateImporter.linkLocalImages(design.html, picked);
      update(result.html);
      setDesign((d) => ({ ...d, hostedImages: (d.hostedImages || 0) + result.linked }));
      if (!result.linked) setError("None of those files match the picture names in the design. Check the file names.");
    } catch (e) {
      setError(e?.message || "Couldn't upload the pictures.");
    } finally {
      setBusy("");
    }
  };

  const makeMobileReady = async () => {
    setBusy("ai");
    setError("");
    try {
      const doc = (await aiMobileEmail(design.html))?.doc;
      if (!doc?.html) throw new Error("The AI didn't return a design. Try again.");
      setBeforeAi(design.html);
      setAiNote({ missing: doc.missing || { links: [], images: [] } });
      update(doc.html);
      setDevice("ios");
    } catch (e) {
      setError(e?.message || "The AI couldn't rebuild this design.");
    } finally {
      setBusy("");
    }
  };

  const undoAi = () => {
    update(beforeAi);
    setBeforeAi(null);
    setAiNote(null);
  };

  const issues = design ? htmlTemplateImporter.mobileCheck(design.html) : [];
  const lostSomething = aiNote && (aiNote.missing.links.length || aiNote.missing.images.length);
  const working = Boolean(busy);

  // auto-save: a moment after the design is read or changed (not while the AI or an upload
  // is working); one save at a time, a failed one is tried again on the next change
  const saveDesign = async (d) => {
    if (!d?.html || saving.current) return;
    saving.current = true;
    setSaveState("saving");
    const fields = { name: d.name || "Uploaded design", subject: d.subject || "", html: d.html };
    try {
      const result = templateId ? await updateEmailTemplate(templateId, fields) : await createEmailTemplate({ ...fields, source: "manual" });
      if (result?.doc?._id) setTemplateId(result.doc._id);
      setSavedHtml(d.html);
      setSaveState("saved");
    } catch {
      setSaveState("failed");
    } finally {
      saving.current = false;
    }
  };

  useEffect(() => {
    if (!design?.html || working || design.html === savedHtml) return undefined;
    const timer = setTimeout(() => saveDesign(design), 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design, working, savedHtml, templateId]);

  // "Use this design" before the auto-save had its turn: save it now too
  const pickDesign = () => {
    if (design.html !== savedHtml) void saveDesign(design);
    onUse({ name: design.name, subject: design.subject, html: design.html });
  };

  return (
    <Dialog
      open={open}
      onClose={working ? () => {} : onClose}
      title="Upload HTML design"
      description="Check how it looks on a phone and a computer before it goes into the email."
      size="xl"
      footer={
        <>
          {/* auto-save status, on the left of the buttons */}
          <span className="mr-auto flex items-center gap-1.5 text-xs text-app-text-muted" aria-live="polite">
            {saveState === "saving" && (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Saving to your templates…
              </>
            )}
            {saveState === "saved" && (
              <>
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" /> Saved to your templates
              </>
            )}
            {saveState === "failed" && <span className="text-amber-600 dark:text-amber-400">Couldn&apos;t save to your templates</span>}
          </span>
          <Button variant="secondary" onClick={onClose} disabled={working}>
            Cancel
          </Button>
          <Button
            disabled={!design || working}
            onClick={pickDesign}
          >
            Use this design
          </Button>
        </>
      }
    >
      {busy === "reading" ? (
        <p className="flex items-center gap-2 py-10 text-sm text-app-text-muted">
          <Loader2 className="size-4 animate-spin" /> Reading the file and uploading its pictures…
        </p>
      ) : !design ? (
        <p className="py-6 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">
            <div className="mb-2 flex justify-center gap-1">
              {[
                { value: "ios", label: "Phone", icon: Smartphone },
                { value: "desktop", label: "Computer", icon: Monitor },
              ].map((d) => {
                const DIcon = d.icon;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDevice(d.value)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                      device === d.value ? "bg-blue-600 text-white" : "text-app-text-muted hover:bg-app-surface-secondary"
                    }`}
                  >
                    <DIcon className="size-3.5" /> {d.label}
                  </button>
                );
              })}
            </div>
            <div className="relative">
              <FittedEmailPreview html={design.html} device={device} className="h-[60vh] rounded-lg" />
              {busy === "ai" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-app-surface/85 text-center backdrop-blur-sm">
                  <Loader2 className="size-6 animate-spin text-blue-600" />
                  <p className="text-sm font-medium text-app-text">Rebuilding the design for phones and tablets…</p>
                  <p className="text-xs text-app-text-muted">
                    {seconds}s · usually 1–3 minutes. Keep this window open.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-app-text-muted">Checks</h3>
            <ul className="divide-y divide-app-border">
              <Check
                ok={!design.localImages.length}
                action={
                  design.localImages.length > 0 && (
                    <>
                      <Button size="sm" variant="secondary" icon={ImagePlus} loading={busy === "pictures"} disabled={working} onClick={() => pictureInput.current?.click()}>
                        Add pictures
                      </Button>
                      <Button size="sm" variant="secondary" icon={FolderOpen} disabled={working} onClick={() => folderInput.current?.click()}>
                        Choose folder
                      </Button>
                    </>
                  )
                }
              >
                {design.localImages.length ? (
                  <>
                    <b>{design.localImages.length} picture(s) are on your computer</b> and guests won't see them, e.g.{" "}
                    <code className="break-all text-xs">{design.localImages[0]}</code>. Pick those pictures (or the folder
                    the design came in) and they'll be put online.
                  </>
                ) : (
                  <>All pictures are online{design.hostedImages ? ` (${design.hostedImages} uploaded for you)` : ""}.</>
                )}
              </Check>

              <Check
                ok={!issues.length}
                action={
                  issues.length > 0 &&
                  !beforeAi && (
                    <Button size="sm" icon={Sparkles} onClick={makeMobileReady} disabled={working || aiAccess.paused}>
                      Make it mobile-ready with AI
                    </Button>
                  )
                }
              >
                {issues.length ? (
                  <>
                    <b>May not fit a phone.</b>
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-app-text-muted">
                      {issues.map((i) => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>
                    <p className="mt-1 text-xs text-app-text-muted">
                      The AI rebuilds the layout so it reflows on phones and tablets, keeping your text, links and pictures.
                    </p>
                  </>
                ) : (
                  <>Fits phones, tablets and computers. Sizes are also adjusted automatically when it's sent.</>
                )}
              </Check>

              <Check ok={!design.tooLongForGmail}>
                {design.tooLongForGmail
                  ? `It is ${design.sizeKb} KB. Gmail cuts emails over about 100 KB short (“View entire message”).`
                  : `Size ${design.sizeKb} KB, fine for Gmail.`}
              </Check>
            </ul>

            {aiAccess.paused && issues.length > 0 && (
              <AiPausedNotice access={aiAccess} feature="AI design fixes" compact className="mt-2" />
            )}

            {beforeAi && (
              <div
                className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
                  lostSomething
                    ? "border-amber-500/40! bg-amber-500/10 text-amber-800 dark:text-amber-300"
                    : "border-emerald-500/40! bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                }`}
              >
                {lostSomething ? (
                  <>
                    The AI left out {aiNote.missing.links.length} link(s) and {aiNote.missing.images.length} picture(s) of
                    your design. Check the preview, or undo.
                  </>
                ) : (
                  <>Rebuilt by AI. Every link and picture of your design is still there. Check the phone preview.</>
                )}
                <Button size="sm" variant="ghost" icon={Undo2} className="mt-1 -ml-2" onClick={undoAi} disabled={working}>
                  Undo AI changes
                </Button>
              </div>
            )}

            {error && <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>}
          </div>

          <input
            ref={pictureInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              addPictures(Array.from(e.target.files || []));
              e.target.value = "";
            }}
          />
          <input
            ref={folderInput}
            type="file"
            webkitdirectory=""
            directory=""
            multiple
            hidden
            onChange={(e) => {
              addPictures(Array.from(e.target.files || []));
              e.target.value = "";
            }}
          />
        </div>
      )}
    </Dialog>
  );
}
