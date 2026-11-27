import { AlertTriangle, CheckCircle2, Loader2, Plus, Wand2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import { Input } from "../../../components/ui/Field";
import IconButton from "../../../components/ui/IconButton";
import Notice from "../../../components/ui/Notice";
import { checkEmails } from "../../../redux/api/emailMarketingApi";
import { EMAIL_REGEX, normalizeEmail } from "../emailUtils";

// rows shown for review; the rest are still sent
const SHOWN = 300;

/** an address as typed: trimmed, lower case (the server's key) */
const keyOf = (value) => String(value ?? "").trim().toLowerCase();
/** shaped like an address as typed, or once accents / spaces / <> are taken out */
const shapeOk = (value) => EMAIL_REGEX.test(value) || EMAIL_REGEX.test(normalizeEmail(value));

// what each problem means, in words; "bounce" ones are left out of the send
const PROBLEM = {
  typo: { text: "Mistyped provider", bounce: true },
  no_domain: { text: "This domain can't receive email", bounce: true },
  syntax: { text: "Not a valid address", bounce: true },
  bounced: { text: "Bounced before (the mailbox doesn't exist) or blocked by Amazon", bounce: true },
  disposable: { text: "Throwaway inbox (nobody reads it)", bounce: false },
  unknown: { text: "Couldn't check the domain right now", bounce: false },
};

/**
 * Review the addresses found in an imported file (or a sheet link) before writing the email.
 * Each address's domain is checked on the server (does it exist and take email? is it a
 * mistyped gmail / hotmail?), so addresses that would only bounce are fixed or removed here.
 * `emails` is null while closed.
 */
const ExcelRecipientsDialog = ({ emails, onClose, onContinue, preparing }) => {
  const [list, setList] = useState([]);
  // email → { verdict, suggestion } for every address that isn't ok
  const [problems, setProblems] = useState(() => new Map());
  // address as typed → the cleaned one that will be used (accents, spaces, <> removed)
  const [corrected, setCorrected] = useState(() => new Map());
  const [checking, setChecking] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);
  const checked = useRef(new Set());

  useEffect(() => {
    if (emails) {
      setList(emails);
      setProblems(new Map());
      setCorrected(new Map());
      setCheckFailed(false);
      checked.current = new Set();
    }
  }, [emails]);

  // addresses as typed (trimmed, lower case): the server checks them like that first, and only
  // when that fails tries them without accents / spaces / <> (so nothing that works is changed)
  const entries = useMemo(() => [...new Set(list.map(keyOf).filter(Boolean))], [list]);
  const valid = useMemo(() => entries.filter(shapeOk), [entries]);
  const invalidCount = entries.length - valid.length;

  // check the addresses not checked yet (the whole list when opened, then edited ones), after a pause in typing
  useEffect(() => {
    if (!emails) return undefined;
    const fresh = valid.filter((e) => !checked.current.has(e));
    if (!fresh.length) return undefined;
    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const result = await checkEmails(fresh.slice(0, 20000));
        fresh.forEach((e) => checked.current.add(e));
        setProblems((prev) => {
          const next = new Map(prev);
          for (const p of result?.problems || []) next.set(keyOf(p.original || p.email), p);
          return next;
        });
        setCorrected((prev) => {
          const next = new Map(prev);
          for (const c of result?.corrected || []) next.set(keyOf(c.original), c.email);
          return next;
        });
        setCheckFailed(false);
      } catch {
        setCheckFailed(true);
      } finally {
        setChecking(false);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [emails, valid]);

  const problemOf = (email) => problems.get(keyOf(email));
  const bouncing = valid.filter((e) => PROBLEM[problems.get(e)?.verdict]?.bounce);
  const typos = bouncing.filter((e) => problems.get(e)?.verdict === "typo");
  const risky = valid.filter((e) => problems.has(e) && !PROBLEM[problems.get(e)?.verdict]?.bounce && problems.get(e)?.verdict !== "unknown");
  const sendable = valid.filter((e) => !PROBLEM[problems.get(e)?.verdict]?.bounce);

  const update = (index, value) => setList((prev) => prev.map((e, i) => (i === index ? value : e)));
  const remove = (index) => setList((prev) => prev.filter((_, i) => i !== index));
  const fixTypos = () =>
    setList((prev) =>
      prev.map((e) => {
        const p = problemOf(e);
        return p?.verdict === "typo" && p.suggestion ? p.suggestion : e;
      }),
    );
  const removeBouncing = () => setList((prev) => prev.filter((e) => !PROBLEM[problemOf(e)?.verdict]?.bounce));

  return (
    <Dialog
      open={Boolean(emails)}
      onClose={onClose}
      size="lg"
      title="Check the imported list"
      description={`${valid.length.toLocaleString("en-IN")} valid ${valid.length === 1 ? "address" : "addresses"}${invalidCount ? `, ${invalidCount} to fix or remove` : ""}.`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={preparing}>
            Cancel
          </Button>
          <Button onClick={() => onContinue(sendable)} loading={preparing} disabled={!sendable.length || checking}>
            Write email to {sendable.length.toLocaleString("en-IN")}
          </Button>
        </>
      }
    >
      <div className="mb-3 space-y-2">
        {checking ? (
          <p className="flex items-center gap-2 text-sm text-app-text-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden /> Checking that each address can receive email…
          </p>
        ) : checkFailed ? (
          <Notice tone="warning">Couldn&apos;t check the addresses right now. They are checked again when the email is sent.</Notice>
        ) : bouncing.length ? (
          <Notice
            tone="warning"
            icon={AlertTriangle}
            title={`${bouncing.length.toLocaleString("en-IN")} ${bouncing.length === 1 ? "address" : "addresses"} would bounce`}
            actions={
              <div className="flex flex-wrap gap-2">
                {typos.length > 0 && (
                  <Button size="sm" variant="secondary" icon={Wand2} onClick={fixTypos}>
                    Fix {typos.length} typo{typos.length === 1 ? "" : "s"}
                  </Button>
                )}
                <Button size="sm" variant="secondary" icon={X} onClick={removeBouncing}>
                  Remove {bouncing.length === 1 ? "it" : "them"}
                </Button>
              </div>
            }
          >
            Their domain doesn&apos;t exist or is a mistyped provider (like gmial.com). They are left out of the send: each bounce hurts
            your sender reputation and comes back to your inbox as a failure notice.
          </Notice>
        ) : (
          valid.length > 0 &&
          checked.current.size > 0 && (
            <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" aria-hidden /> Every domain can receive email.
            </p>
          )
        )}
        {!checking && risky.length > 0 && (
          <p className="text-xs text-app-text-muted">
            {risky.length.toLocaleString("en-IN")} throwaway {risky.length === 1 ? "inbox" : "inboxes"}: kept, but nobody may read {risky.length === 1 ? "it" : "them"}.
          </p>
        )}
      </div>

      <div className="max-h-[50vh] space-y-1.5 overflow-y-auto pr-1">
        {list.slice(0, SHOWN).map((email, index) => {
          const bad = email.trim() && !shapeOk(keyOf(email));
          const p = !bad && problemOf(email);
          const cleanedTo = !bad && !p && corrected.get(keyOf(email));
          const flagged = p && p.verdict !== "unknown" ? PROBLEM[p.verdict] : null;
          return (
            <div key={index}>
              <div className="flex items-center gap-2">
                <span className="w-8 shrink-0 text-right text-xs text-app-text-faint">{index + 1}</span>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => update(index, e.target.value)}
                  aria-invalid={bad || flagged?.bounce}
                  className={bad || flagged?.bounce ? "border-red-500!" : flagged ? "border-amber-500!" : ""}
                />
                <IconButton icon={X} label="Remove" tone="danger" onClick={() => remove(index)} />
              </div>
              {cleanedTo && (
                <p className="mt-0.5 ml-10 text-xs text-app-text-muted">
                  Will be sent as <b className="text-app-text">{cleanedTo}</b> (accents, spaces or symbols removed)
                </p>
              )}
              {flagged && (
                <p className={`mt-0.5 ml-10 text-xs ${flagged.bounce ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {flagged.text}
                  {p.verdict === "typo" && p.suggestion && (
                    <>
                      {" "}
                      · did you mean{" "}
                      <button type="button" className="font-medium underline" onClick={() => update(index, p.suggestion)}>
                        {p.suggestion}
                      </button>
                      ?
                    </>
                  )}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {list.length > SHOWN && (
        <p className="mt-2 text-xs text-app-text-muted">
          Showing the first {SHOWN}. The other {(list.length - SHOWN).toLocaleString("en-IN")} are included too (and checked).
        </p>
      )}
      <Button variant="dashed" size="sm" icon={Plus} className="mt-3" onClick={() => setList((prev) => ["", ...prev])}>
        Add address
      </Button>
    </Dialog>
  );
};

export default ExcelRecipientsDialog;
