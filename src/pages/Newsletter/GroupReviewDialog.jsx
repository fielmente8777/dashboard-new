import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import {
  newsletterError,
  useBulkSubscribersMutation,
  useImportSubscribersMutation,
  useLazyGetSubscribersQuery,
} from "../../redux/api/newsletterApi";
import ReviewPeopleDialog from "./ReviewPeopleDialog";
import { formatNumber } from "./newsletterUtils";

const PAGE = 200;
const BULK = 1000;

// Who is in a group (subscribed people, the ones an email goes to). Remove people or add
// addresses; nothing changes until "Save changes". Removed people only leave the group: they
// stay on the newsletter list and in their other groups.
export default function GroupReviewDialog({ group, onClose }) {
  const { showToast } = useToast();
  const [load] = useLazyGetSubscribersQuery();
  const [bulk] = useBulkSubscribersMutation();
  const [importRows] = useImportSubscribersMutation();
  const [people, setPeople] = useState([]); // [{ id, email, name }]
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // everyone in the group, page by page
  useEffect(() => {
    if (!group) return;
    let stop = false;
    (async () => {
      setLoading(true);
      setPeople([]);
      try {
        const all = [];
        for (let page = 1; ; page++) {
          const res = await load({ tag: group, status: "subscribed", page, limit: PAGE }).unwrap();
          all.push(...(res.items || []).map(({ id, email, name }) => ({ id, email, name })));
          if (stop || all.length >= res.total || !res.items?.length) break;
        }
        if (!stop) setPeople(all);
      } catch (error) {
        if (!stop) showToast({ message: newsletterError(error, "Could not load the group."), type: "error" });
      } finally {
        if (!stop) setLoading(false);
      }
    })();
    return () => {
      stop = true;
    };
  }, [group, load, showToast]);

  const save = async ({ removed, added }) => {
    if (!removed.length && !added.length) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      const idOf = new Map(people.map((p) => [p.email.toLowerCase(), p.id]));
      const ids = removed.map((e) => idOf.get(e.toLowerCase())).filter(Boolean);
      for (let i = 0; i < ids.length; i += BULK) {
        await bulk({ ids: ids.slice(i, i + BULK), action: "removeTags", tags: [group] }).unwrap();
      }
      let skipped = 0;
      if (added.length) {
        const res = await importRows({ rows: added.map((email) => ({ email })), tags: [group] }).unwrap();
        skipped = res.skippedUnsubscribed || 0;
      }
      const parts = [];
      if (added.length - skipped > 0) parts.push(`${formatNumber(added.length - skipped)} added`);
      if (ids.length) parts.push(`${formatNumber(ids.length)} removed from the group`);
      if (skipped) parts.push(`${formatNumber(skipped)} skipped (they had unsubscribed)`);
      showToast({ message: `"${group}": ${parts.join(", ")}`, type: skipped ? "warning" : "success" });
      onClose();
    } catch (error) {
      showToast({ message: newsletterError(error), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ReviewPeopleDialog
      open={Boolean(group)}
      onClose={onClose}
      title={`People in "${group || ""}"`}
      description="Everyone subscribed in this group gets the emails you send to it. Removed people leave this group only; they stay on your list."
      people={people}
      loading={loading}
      addConsent
      confirming={saving}
      confirmLabel={() => "Save changes"}
      onConfirm={save}
    />
  );
}
