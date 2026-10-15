import { Eye, Plus, RefreshCw, Workflow } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import DataTable from "../../../../components/ui/DataTable";
import Dialog from "../../../../components/ui/Dialog";
import IconButton from "../../../../components/ui/IconButton";
import { EmptyState, ErrorState } from "../../../../components/ui/States";
import { getWhatsAppFlowScreens } from "../../../../services/api/whatsApp";
import { fieldTypeLabel } from "../WhatsappFlow/flowUtils";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : "—";

// The WhatsApp flows this account has published.
const Flows = ({ onCreate }) => {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const response = await getWhatsAppFlowScreens();
      if (!response?.success) throw new Error();
      setFlows(response?.result?.docs?.flows || []);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    {
      key: "flowName",
      header: "Flow",
      render: (flow) => <span className="font-medium capitalize">{flow.flowName}</span>,
    },
    {
      key: "screens",
      header: "Screens",
      render: (flow) => flow.screens?.length || 0,
    },
    {
      key: "flowId",
      header: "Flow ID",
      render: (flow) => <span className="font-mono text-xs">{flow.flowId}</span>,
    },
    { key: "createdAt", header: "Created", render: (flow) => formatDate(flow.createdAt) },
    {
      key: "action",
      header: "",
      className: "w-12 text-right",
      render: (flow) => (
        <IconButton icon={Eye} label={`Preview ${flow.flowName}`} onClick={() => setSelected(flow)} />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-app-text">My flows</h2>
          <p className="text-xs text-app-text-muted">Forms you can send to guests on WhatsApp.</p>
        </div>
        <div className="flex gap-2">
          <IconButton icon={RefreshCw} label="Refresh" onClick={load} disabled={loading} />
          {onCreate && (
            <Button icon={Plus} onClick={onCreate}>
              Create flow
            </Button>
          )}
        </div>
      </div>

      {failed ? (
        <ErrorState message="Could not load your flows." onRetry={load} />
      ) : !loading && flows.length === 0 ? (
        <EmptyState
          icon={Workflow}
          title="No flows yet"
          description="Create a lead or feedback form that guests fill in without leaving WhatsApp."
          action={
            onCreate && (
              <Button size="sm" icon={Plus} onClick={onCreate}>
                Create your first flow
              </Button>
            )
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={flows}
          rowKey={(flow) => flow._id}
          loading={loading}
          onRowClick={setSelected}
        />
      )}

      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.flowName}
        description={`Created ${formatDate(selected?.createdAt)}`}
      >
        <div className="space-y-4">
          {selected?.screens?.map((screen, index) => (
            <section key={screen.id || index} className="rounded-lg border border-app-border! p-3">
              <h3 className="mb-2 text-sm font-semibold text-app-text">
                {index + 1}. {screen.title}
              </h3>
              <ul className="space-y-1.5">
                {screen.fields?.map((field, fieldIndex) => (
                  <li key={fieldIndex} className="flex items-center gap-2 text-sm text-app-text">
                    <span className="min-w-0 flex-1 truncate">
                      {field.label}
                      {field.required && <span className="text-red-500"> *</span>}
                    </span>
                    <Badge>{fieldTypeLabel(field.type)}</Badge>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Dialog>
    </div>
  );
};

export default Flows;
