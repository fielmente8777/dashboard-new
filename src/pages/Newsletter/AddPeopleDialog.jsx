import { Contact, FileSpreadsheet, UserPlus, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Chip from "../../components/ui/Chip";
import Dialog from "../../components/ui/Dialog";
import { Field, Input } from "../../components/ui/Field";
import Segmented from "../../components/ui/Segmented";
import { Skeleton } from "../../components/ui/States";
import { useToast } from "../../context/ToastContext";
import {
  newsletterError,
  useAddPeopleToGroupMutation,
  useGetGroupPeopleSourcesQuery,
  useGetNewsletterGroupsQuery,
} from "../../redux/api/newsletterApi";
import { formatNumber, peopleSourceLabel } from "./newsletterUtils";

const FROM_OPTIONS = [
  { value: "leads", label: "Leads" },
  { value: "contacts", label: "Contacts" },
  { value: "file", label: "File or link" },
];

// Fills a group from anywhere in the dashboard: Leads (by source: website form, WhatsApp, Meta,
// Eazbot...), Contacts (by source), or a CSV / Excel file. Only people with an email address are
// added; people who unsubscribed stay unsubscribed.
//   group        - start with this group filled in ("" = type one)
//   onImportFile - opens the file import for the group (the "A file" choice)
export default function AddPeopleDialog({ open, onClose, group: initialGroup = "", onImportFile }) {
  const { showToast } = useToast();
  const [group, setGroup] = useState(initialGroup);
  const [from, setFrom] = useState("leads");
  const [picked, setPicked] = useState([]); // sources; empty = all
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState(null);
  const sources = useGetGroupPeopleSourcesQuery(undefined, { skip: !open, refetchOnMountOrArgChange: true });
  const groups = useGetNewsletterGroupsQuery(undefined, { skip: !open });
  const [add, { isLoading: adding }] = useAddPeopleToGroupMutation();

  useEffect(() => {
    if (!open) return;
    setGroup(initialGroup);
    setFrom("leads");
    setPicked([]);
    setConsent(false);
    setResult(null);
  }, [open, initialGroup]);

  const list = useMemo(() => (from === "file" ? [] : sources.data?.[from] || []), [sources.data, from]);
  const usable = list.filter((s) => s.withEmail > 0);
  const chosen = picked.length ? list.filter((s) => picked.includes(s.source)) : list;
  const count = chosen.reduce((n, s) => n + s.withEmail, 0);
  // in the chosen sources but without an email: never added
  const noEmail = chosen.reduce((n, s) => n + Math.max((s.total || 0) - (s.withEmail || 0), 0), 0);

  const toggle = (source) =>
    setPicked((now) => (now.includes(source) ? now.filter((s) => s !== source) : [...now, source]));

  const submit = async () => {
    try {
      const res = await add({ group: group.trim(), from, sources: picked }).unwrap();
      setResult(res);
    } catch (error) {
      showToast({ message: newsletterError(error), type: "error" });
    }
  };

  const footer = result ? (
    <Button onClick={onClose}>Done</Button>
  ) : from === "file" ? (
    <>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button icon={FileSpreadsheet} disabled={!group.trim()} onClick={() => onImportFile(group.trim())}>
        Next: file or link
      </Button>
    </>
  ) : (
    <>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button icon={UserPlus} loading={adding} disabled={!group.trim() || !consent || count === 0} onClick={submit}>
        Add {formatNumber(count)} {count === 1 ? "person" : "people"}
      </Button>
    </>
  );

  return (
    <Dialog
      open={open}
      title="Add people to a group"
      description="From your leads, your contacts, a file or a link. Only people with an email address are added."
      onClose={onClose}
      sheetOnPhone
      footer={footer}
    >
      {result ? (
        <div className="space-y-2 text-sm">
          <p className="font-medium text-app-text">Added to &ldquo;{group.trim()}&rdquo;</p>
          <ul className="space-y-1 text-app-text-muted">
            <li><strong className="text-app-text">{formatNumber(result.added)}</strong> new on your newsletter list</li>
            <li><strong className="text-app-text">{formatNumber(result.updated)}</strong> already on the list, now also in this group</li>
            {noEmail > 0 && (
              <li>
                <strong className="text-app-text">{formatNumber(noEmail)}</strong> left out: no email address
              </li>
            )}
            {result.skippedUnsubscribed > 0 && (
              <li>
                <strong className="text-app-text">{formatNumber(result.skippedUnsubscribed)}</strong> skipped: they had
                unsubscribed
              </li>
            )}
            {result.invalid + result.duplicatesInFile > 0 && (
              <li>
                <strong className="text-app-text">{formatNumber(result.invalid + result.duplicatesInFile)}</strong> skipped:
                not a valid email, or the same address twice
              </li>
            )}
          </ul>
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="Group" hint="Pick a group or type a new one, e.g. Past guests or Corporate.">
            <Input
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              list="newsletter-add-groups"
              maxLength={40}
              placeholder="e.g. Past guests"
            />
            <datalist id="newsletter-add-groups">
              {(groups.data || []).map((g) => (
                <option key={g.name} value={g.name} />
              ))}
            </datalist>
          </Field>

          <Field as="div" label="Add people from">
            <Segmented
              options={FROM_OPTIONS}
              value={from}
              onChange={(next) => {
                setFrom(next);
                setPicked([]);
              }}
              label="Add people from"
            />
          </Field>

          {from === "file" ? (
            <p className="flex items-start gap-2 text-sm text-app-text-muted">
              <FileSpreadsheet className="mt-0.5 size-4 shrink-0" aria-hidden />
              A CSV or Excel file, or a link to one (Google Sheet, CSV / Excel link, Drive, Dropbox, OneDrive), with an email column. Every other column (name, city, company…) is kept.
            </p>
          ) : (
            <Field
              as="div"
              label={from === "leads" ? "Lead sources" : "Contact sources"}
              hint={picked.length ? "Only the sources you picked." : "None picked: everyone from every source."}
            >
              {sources.isLoading ? (
                <Skeleton className="h-16" />
              ) : usable.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-app-text-muted">
                  {from === "leads" ? <Users className="size-4" aria-hidden /> : <Contact className="size-4" aria-hidden />}
                  No {from} with an email address yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {usable.map((s) => (
                    <Chip key={s.source} selected={picked.includes(s.source)} onClick={() => toggle(s.source)}>
                      {peopleSourceLabel(s.source)}
                      <span
                        className="tabular-nums opacity-70"
                        title={`${formatNumber(s.withEmail)} of ${formatNumber(s.total)} have an email address`}
                      >
                        {formatNumber(s.withEmail)}
                        {s.total > s.withEmail ? ` of ${formatNumber(s.total)}` : ""}
                      </span>
                    </Chip>
                  ))}
                </div>
              )}
            </Field>
          )}

          {from !== "file" && usable.length > 0 && (
            <p className="rounded-lg bg-app-surface-secondary px-3 py-2 text-xs text-app-text-muted">
              <strong className="text-app-text">{formatNumber(count)}</strong> with an email will be added.
              {noEmail > 0 && (
                <>
                  {" "}
                  <strong className="text-app-text">{formatNumber(noEmail)}</strong> without an email {noEmail === 1 ? "is" : "are"} left out.
                </>
              )}
            </p>
          )}

          {from !== "file" && usable.length > 0 && (
            <label className="flex items-start gap-2 text-sm text-app-text">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 size-4 accent-blue-600"
              />
              These people agreed to get emails from us. Anyone who unsubscribed stays unsubscribed.
            </label>
          )}
        </div>
      )}
    </Dialog>
  );
}
