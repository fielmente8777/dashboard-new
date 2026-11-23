import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Button from "../../../components/ui/Button";
import { ErrorState, Skeleton } from "../../../components/ui/States";
import { useConfirm } from "../../../context/ConfirmContext";
import { useToast } from "../../../context/ToastContext";
import { useDeleteAiAgentActionMutation, useGetAiAgentActionsQuery, useToggleAiAgentActionMutation } from "../../../redux/api/aiAgentsApi";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import ActionsOverview from "./ActionsOverview";
import ActionsTab from "./ActionsTab";
import CustomActionDialog from "./CustomActionDialog";

// The Actions tab: the overview (business / custom API grouped into intents /
// system actions) with the "Edit custom action" dialog. A link with ?action=<id>
// (or "new") opens the full editor (Simple and Advanced forms) as before.
const ActionsHome = ({ channel, hid, agentHours }) => {
  const [params, setParams] = useSearchParams();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const query = useGetAiAgentActionsQuery({ channel, hid }, { refetchOnMountOrArgChange: true });
  const [toggleAction] = useToggleAiAgentActionMutation();
  const [deleteAction] = useDeleteAiAgentActionMutation();
  const [dialog, setDialog] = useState(null); // { action } | { action: null } (new)

  const openEditor = (id) => setParams((p) => { p.set("action", id); return p; });

  if (params.get("action")) {
    return (
      <div className="space-y-3">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => setParams((p) => { p.delete("action"); return p; })}>All actions</Button>
        <ActionsTab channel={channel} hid={hid} agentHours={agentHours} />
      </div>
    );
  }

  if (query.isError) return <ErrorState message="Could not load the actions." onRetry={query.refetch} />;
  const data = query.currentData;
  if (!data) return <Skeleton className="h-96" />;

  const toggle = async (action, enabled) => {
    try {
      await toggleAction({ channel, hid, id: action.id, enabled }).unwrap();
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Could not change the action."), type: "error" });
    }
  };

  const remove = async (action) => {
    if (!(await confirm(`Delete "${action.draft.name}"? This can't be undone, and the agent stops using it straight away.`, { title: "Delete action", confirmText: "Delete", variant: "danger" }))) return;
    try {
      await deleteAction({ channel, hid, id: action.id }).unwrap();
      showToast({ message: "Action deleted." });
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Could not delete the action."), type: "error" });
    }
  };

  return (
    <>
      <ActionsOverview
        actions={data.actions}
        unpublished={data.counts?.unpublished || 0}
        onAddApi={() => setDialog({ action: null })}
        onEditApi={(action) => setDialog({ action })}
        onOpen={openEditor}
        onNewBusiness={() => openEditor("new")}
        onCreateWithAi={() => openEditor("new")}
        onToggle={toggle}
        onDelete={remove}
      />
      {dialog && (
        <CustomActionDialog
          key={dialog.action?.id || "new"}
          open
          onClose={() => setDialog(null)}
          channel={channel}
          hid={hid}
          timezone={agentHours.timezone}
          action={dialog.action}
          existingKeys={data.actions.map((a) => a.key)}
          onOpenEditor={(id) => { setDialog(null); if (id) openEditor(id); }}
        />
      )}
    </>
  );
};

export default ActionsHome;
