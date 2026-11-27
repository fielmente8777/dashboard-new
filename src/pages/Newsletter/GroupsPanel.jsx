import { FolderOpen, Pencil, Send, ShieldCheck, Trash2, UserPlus, Users, X } from "lucide-react";
import { useState } from "react";
import Button from "../../components/ui/Button";
import Dialog from "../../components/ui/Dialog";
import { Field, Input } from "../../components/ui/Field";
import IconButton from "../../components/ui/IconButton";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import { useToast } from "../../context/ToastContext";
import {
  newsletterError,
  useDeleteNewsletterGroupMutation,
  useGetNewsletterGroupsQuery,
  useRenameNewsletterGroupMutation,
} from "../../redux/api/newsletterApi";
import AddPeopleDialog from "./AddPeopleDialog";
import GroupCheckDialog from "./GroupCheckDialog";
import GroupReviewDialog from "./GroupReviewDialog";
import { formatNumber } from "./newsletterUtils";

// Groups split one list into audiences that each get their own newsletter, e.g. past guests,
// corporate clients or wedding enquiries. A person can be in several groups. People are added
// from the dashboard's leads and contacts (by source) or from a file.
//   onSend(names)  - send one newsletter / email to the group(s): a name, or several ticked
//   (Check & export: who would bounce or is unsubscribed, remove them, export the clean list)
//   kind           - "newsletter" (Newsletter page) or "email" (Email marketing): only the wording changes
//   (Review people on a card opens GroupReviewDialog: remove or add people, saved on confirm)
//   onImport(name) - import a file into it
export default function GroupsPanel({ onSend, onImport, kind = "newsletter" }) {
  const word = kind === "email" ? "email" : "newsletter";
  const { showToast } = useToast();
  const groups = useGetNewsletterGroupsQuery();
  const [rename, { isLoading: renaming }] = useRenameNewsletterGroupMutation();
  const [remove, { isLoading: removing }] = useDeleteNewsletterGroupMutation();
  const [renameOf, setRenameOf] = useState(null);
  const [newName, setNewName] = useState("");
  const [deleteOf, setDeleteOf] = useState(null);
  const [addTo, setAddTo] = useState(null); // the group people are added to ("" = choose), or null
  const [reviewing, setReviewing] = useState(null); // the group whose people are being reviewed
  const [ticked, setTicked] = useState([]); // groups ticked for one email / one check together
  const [checking, setChecking] = useState(null); // group names being checked, or null
  const tick = (name) => setTicked((now) => (now.includes(name) ? now.filter((n) => n !== name) : [...now, name]));

  if (groups.isError) {
    return <ErrorState message={newsletterError(groups.error, "Could not load your groups.")} onRetry={groups.refetch} />;
  }
  if (groups.isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    );
  }

  const list = groups.data || [];
  const existing = renameOf && list.some((g) => g.name === newName.trim() && g.name !== renameOf);

  const saveRename = async () => {
    try {
      await rename({ name: renameOf, to: newName.trim() }).unwrap();
      showToast({ message: existing ? `Merged into "${newName.trim()}"` : "Group renamed" });
      setRenameOf(null);
    } catch (error) {
      showToast({ message: newsletterError(error), type: "error" });
    }
  };

  const confirmDelete = async () => {
    try {
      await remove(deleteOf).unwrap();
      showToast({ message: `Group "${deleteOf}" deleted` });
      setDeleteOf(null);
    } catch (error) {
      showToast({ message: newsletterError(error), type: "error" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-app-border! bg-app-surface p-4">
        <div className="max-w-2xl">
          <h2 className="text-sm font-semibold text-app-text">Send different {word}s to different people</h2>
          <p className="mt-1 text-sm text-app-text-muted">
            Put each audience in its own group, for example past guests, corporate clients or wedding enquiries, and send
            each group its own {word}. Add people from your leads or contacts by source (website, WhatsApp, Meta,
            Eazbot and more), or from a file.
          </p>
        </div>
        <Button icon={UserPlus} onClick={() => setAddTo("")}>
          Add people
        </Button>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No groups yet"
          description="Click Add people to make your first group from your leads, contacts or a file."
          action={
            <Button icon={UserPlus} onClick={() => setAddTo("")}>
              Add people
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((g) => (
            <li
              key={g.name}
              className={`flex flex-col rounded-xl border bg-app-surface p-4 ${ticked.includes(g.name) ? "border-blue-500! ring-1 ring-blue-500/30" : "border-app-border!"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <input
                  type="checkbox"
                  checked={ticked.includes(g.name)}
                  onChange={() => tick(g.name)}
                  aria-label={`Tick ${g.name} to send or check several groups together`}
                  className="mt-1.5 size-4 shrink-0 accent-primary"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-app-text" title={g.name}>
                    {g.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-app-text-muted">
                    <span className="font-semibold tabular-nums text-app-text">{formatNumber(g.subscribed)}</span> subscribed
                    {g.total > g.subscribed && <> · {formatNumber(g.total - g.subscribed)} unsubscribed</>}
                  </p>
                </div>
                <div className="flex shrink-0">
                  <IconButton
                    icon={Pencil}
                    label={`Rename ${g.name}`}
                    onClick={() => {
                      setRenameOf(g.name);
                      setNewName(g.name);
                    }}
                  />
                  <IconButton icon={Trash2} label={`Delete ${g.name}`} onClick={() => setDeleteOf(g.name)} />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" icon={Send} disabled={!g.subscribed} onClick={() => onSend([g.name])}>
                  Send {word}
                </Button>
                <Button size="sm" variant="secondary" icon={ShieldCheck} onClick={() => setChecking([g.name])}>
                  Check & export
                </Button>
                <Button size="sm" variant="secondary" icon={Users} onClick={() => setReviewing(g.name)}>
                  Review people
                </Button>
                <Button size="sm" variant="ghost" icon={UserPlus} onClick={() => setAddTo(g.name)}>
                  Add people
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {ticked.length > 0 && (
        <div className="sticky bottom-3 z-20 mr-16 flex flex-wrap items-center gap-2 rounded-xl border border-app-border bg-app-surface p-2.5 shadow-lg sm:mr-20">
          <span className="w-full text-sm font-medium text-app-text sm:mr-auto sm:w-auto">
            {ticked.length} {ticked.length === 1 ? "group" : "groups"} ticked
          </span>
          <Button size="sm" icon={Send} onClick={() => onSend(ticked)}>
            Send one {word} to {ticked.length === 1 ? "it" : `all ${ticked.length}`}
          </Button>
          <Button size="sm" variant="secondary" icon={ShieldCheck} onClick={() => setChecking(ticked)}>
            Check & export
          </Button>
          <Button size="sm" variant="ghost" icon={X} onClick={() => setTicked([])}>
            Clear
          </Button>
        </div>
      )}

      <GroupCheckDialog groups={checking} onClose={() => setChecking(null)} />
      <GroupReviewDialog group={reviewing} onClose={() => setReviewing(null)} />

      <AddPeopleDialog
        open={addTo !== null}
        group={addTo || ""}
        onClose={() => setAddTo(null)}
        onImportFile={(name) => {
          setAddTo(null);
          onImport(name);
        }}
      />

      <Dialog
        open={Boolean(renameOf)}
        title="Rename group"
        description={existing ? `"${newName.trim()}" already exists: everyone in "${renameOf}" joins it.` : undefined}
        onClose={() => setRenameOf(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRenameOf(null)}>Cancel</Button>
            <Button loading={renaming} disabled={!newName.trim() || newName.trim() === renameOf} onClick={saveRename}>
              {existing ? "Merge groups" : "Rename"}
            </Button>
          </>
        }
      >
        <Field label="Name">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={40} autoFocus />
        </Field>
      </Dialog>

      <Dialog
        open={Boolean(deleteOf)}
        title={`Delete the group "${deleteOf}"?`}
        description="The group is taken off everyone in it. The people stay on your list and in their other groups. To remove the people too, view them, tick them and delete."
        onClose={() => setDeleteOf(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOf(null)}>Cancel</Button>
            <Button variant="danger" icon={Trash2} loading={removing} onClick={confirmDelete}>
              Delete group
            </Button>
          </>
        }
      />
    </div>
  );
}
