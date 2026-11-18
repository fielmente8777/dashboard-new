import { AlertTriangle, Send } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Dialog from "../../components/ui/Dialog";
import { Field, Select } from "../../components/ui/Field";
import { useGetNewsletterTagsQuery, useLazyGetNewsletterAudienceQuery } from "../../redux/api/newsletterApi";
import { formatNumber } from "./newsletterUtils";

// Step one of sending: who gets it (everyone subscribed, or one tag). onContinue(emails) then
// opens the compose window.
//   group - start with this group picked (from the Groups tab)
export default function SendNewsletterDialog({ open, onClose, onContinue, preparing, linksOn, group = "" }) {
  const [tag, setTag] = useState(group);
  useEffect(() => {
    if (open) setTag(group);
  }, [open, group]);
  const tags = useGetNewsletterTagsQuery(undefined, { skip: !open });
  const [loadAudience, audience] = useLazyGetNewsletterAudienceQuery();

  useEffect(() => {
    if (open) loadAudience(tag ? { tag } : {});
  }, [open, tag, loadAudience]);

  const count = audience.data?.count ?? 0;
  const options = [
    { value: "", label: "Everyone subscribed" },
    ...(tags.data || []).map((t) => ({ value: t, label: `Group: ${t}` })),
  ];

  return (
    <Dialog
      open={open}
      title="Send a newsletter"
      description="Write it next: start blank, from a template, or let AI draft it."
      onClose={onClose}
      sheetOnPhone
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            icon={Send}
            loading={preparing}
            disabled={audience.isFetching || count === 0}
            onClick={() => onContinue(audience.data?.emails || [])}
          >
            Write to {formatNumber(count)}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Send to" hint={audience.isFetching ? "Counting…" : `${formatNumber(count)} subscribed ${count === 1 ? "person" : "people"}`}>
          <Select options={options} value={tag} onChange={(e) => setTag(e.target.value)} aria-label="Send to" />
        </Field>
        <p className="text-xs text-app-text-muted">
          People who unsubscribed are never sent to. It shows on Email marketing → Campaigns with who opened and clicked.
        </p>
        {!linksOn && (
          <p className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            Unsubscribe links aren&apos;t switched on for your account yet, so add a line telling people how to opt out (for
            example, reply &quot;unsubscribe&quot;). Contact Eazotel support to switch them on.
          </p>
        )}
      </div>
    </Dialog>
  );
}
