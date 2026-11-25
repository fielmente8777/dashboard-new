import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { Field, Input, Textarea } from "../../../components/ui/Field";
import { useToast } from "../../../context/ToastContext";
import { useTenant } from "../../../hooks/useTenant";
import { useStartMediaImportMutation } from "../../../redux/api/mediaApi";
import LinkBrowser from "./browse/LinkBrowser";
import useLinkBrowse from "./browse/useLinkBrowse";
import TitleRoute from "./TitleRoute";

const MAX_LINKS = 20;

const MODES = [
  { value: "manual", title: "Let me choose", text: "See every image first. Pick the ones to import and edit their names, collections and tags." },
  { value: "ai", title: "Let AI choose", text: "Tell us what you need (rooms, inventory, menus…). AI finds matching files; you just confirm." },
];

// "Import from link": paste links -> choose folders (or preview images) -> import.
// Browsing only lists the link; nothing is downloaded or charged until the client confirms.
const ImportPanel = ({ onStarted }) => {
  const { showToast } = useToast();
  const [text, setText] = useState("");
  const [mode, setMode] = useState("manual");
  const [userHint, setUserHint] = useState("");
  const [title, setTitle] = useState("");
  const { hid } = useTenant();
  const [keepLocation, setKeepLocation] = useState(false);
  const [startImport, { isLoading }] = useStartMediaImportMutation();

  const links = useMemo(() => [...new Set(text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean))], [text]);
  const browseLinks = useMemo(() => links.slice(0, MAX_LINKS), [links]);
  const browse = useLinkBrowse(browseLinks);
  const blocked = browse.missingChoice.length > 0;

  const handleImport = async () => {
    if (links.length > MAX_LINKS) {
      showToast({ message: `Paste at most ${MAX_LINKS} links at a time.`, type: "warning" });
      return;
    }
    if (blocked) {
      showToast({ message: "Choose at least one folder or image for each link.", type: "warning" });
      return;
    }
    try {
      const jobs = await startImport({
        links,
        hid,
        title: title.trim() || undefined,
        reviewMode: true,
        userHint: userHint.trim() || undefined,
        keepLocation,
        selections: browse.selections,
      }).unwrap();
      setText("");
      onStarted?.(jobs, mode);
    } catch (error) {
      showToast({ message: error?.data?.error || "The import could not be started.", type: "error" });
    }
  };

  return (
    <Card title="Import media from a link" description="Google Drive, Amazon S3, Dropbox, OneDrive, direct file links or a web page. One link per line.">
      <div className="space-y-4">
        <Field label="Links" hint={`${links.length} link${links.length === 1 ? "" : "s"} · up to ${MAX_LINKS}`}>
          <Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} className="font-mono text-xs" placeholder={"https://drive.google.com/drive/folders/…\ns3://my-bucket/rooms/"} />
        </Field>

        {browse.entries.length > 0 && (
          <div className="space-y-2">
            {browse.entries.map((entry) => (
              <LinkBrowser key={entry.link} entry={entry} onChange={(sel) => browse.setSelection(entry.link, () => sel)} />
            ))}
          </div>
        )}

        <fieldset className="space-y-2">
          <legend className="mb-1.5 text-xs font-medium text-app-text-muted">How do you want to import?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {MODES.map((m) => (
              <label key={m.value} className={`flex cursor-pointer gap-3 rounded-lg border p-3.5 ${mode === m.value ? "border-blue-500! bg-blue-500/5 ring-1 ring-blue-500" : "border-app-border!"}`}>
                <input type="radio" name="import-mode" checked={mode === m.value} onChange={() => setMode(m.value)} className="mt-1" />
                <span>
                  <span className="block text-sm font-semibold text-app-text">{m.title}</span>
                  <span className="block text-xs text-app-text-muted">{m.text}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title (where the files go)" hint={<TitleRoute title={title} />}>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="e.g. Aroha Palms Majestic" />
          </Field>
          <Field label="Hint for the AI (optional)">
            <Input value={userHint} onChange={(e) => setUserHint(e.target.value)} maxLength={500} placeholder="e.g. these are hotel room photos" />
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-app-text-muted">
            <input type="checkbox" checked={keepLocation} onChange={(e) => setKeepLocation(e.target.checked)} /> Keep GPS location in stored originals
          </label>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-app-text-muted sm:inline">
              {browse.selectedCount ? `${browse.selectedCount} image${browse.selectedCount === 1 ? "" : "s"} selected · ` : ""}Nothing is charged until you confirm.
            </span>
            {/* wait for the folder list; a link that cannot be browsed can still be imported whole */}
            <Button icon={Search} loading={isLoading} disabled={!links.length || blocked || browse.loading} onClick={handleImport}>
              Import files
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ImportPanel;
