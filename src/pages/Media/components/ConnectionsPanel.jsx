import { Database, FolderOpen, Link2Off, PlugZap } from "lucide-react";
import { useEffect, useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { Field, Input } from "../../../components/ui/Field";
import { useConfirm } from "../../../context/ConfirmContext";
import { useToast } from "../../../context/ToastContext";
import {
  useConnectDriveMutation,
  useDeleteS3ConnectionMutation,
  useDisconnectDriveMutation,
  useGetDriveStatusQuery,
  useGetS3ConnectionQuery,
  useSaveS3ConnectionMutation,
} from "../../../redux/api/mediaApi";

// Private sources: the workspace's Google Drive (read-only OAuth) and its own read-only S3 keys.
const DriveCard = () => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [waiting, setWaiting] = useState(false);
  const { data: status, refetch } = useGetDriveStatusQuery(undefined, { pollingInterval: waiting ? 2000 : 0 });
  const [connect, { isLoading: connecting }] = useConnectDriveMutation();
  const [disconnect, { isLoading: disconnecting }] = useDisconnectDriveMutation();

  // the OAuth popup tells us when it is done; status polling covers browsers that block it
  useEffect(() => {
    const onMessage = (e) => {
      if (e.data?.type !== "google-drive-oauth") return;
      setWaiting(false);
      refetch();
      showToast({ message: e.data.message, type: e.data.status === "connected" ? "success" : "error" });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [refetch, showToast]);

  useEffect(() => {
    if (status?.connected) setWaiting(false);
  }, [status?.connected]);

  const handleConnect = async () => {
    try {
      const { authUrl } = await connect().unwrap();
      window.open(authUrl, "google-drive-connect", "width=520,height=680");
      setWaiting(true);
    } catch (error) {
      showToast({ message: error?.data?.error || "Unable to start the Google Drive connection.", type: "error" });
    }
  };

  const handleDisconnect = async () => {
    if (!(await confirm("Disconnect Google Drive? Imports from private folders will stop working.", { title: "Disconnect", confirmText: "Disconnect" }))) return;
    await disconnect().unwrap().catch(() => showToast({ message: "Unable to disconnect.", type: "error" }));
  };

  return (
    <Card
      title="Google Drive"
      description={
        status?.publicAccess
          ? "Folders shared as “Anyone with the link” work without connecting. Connect to import private folders."
          : "Connect your Google account (read-only) to import Drive files and folders."
      }
      actions={
        status?.connected ? (
          <Button variant="secondary" size="sm" icon={Link2Off} loading={disconnecting} onClick={handleDisconnect}>
            Disconnect
          </Button>
        ) : (
          <Button size="sm" icon={PlugZap} loading={connecting || waiting} disabled={status && !status.configured} onClick={handleConnect}>
            {status?.reconnectRequired ? "Reconnect" : "Connect"}
          </Button>
        )
      }
    >
      <div className="flex items-center gap-2 text-sm">
        <FolderOpen size={16} className="text-app-text-muted" />
        {status?.connected ? (
          <>
            <Badge tone="green">Connected</Badge>
            <span className="text-app-text-muted">{status.email}</span>
          </>
        ) : status?.reconnectRequired ? (
          <Badge tone="red">Access revoked — reconnect</Badge>
        ) : status && !status.configured ? (
          <Badge tone="gray">Not available on this server</Badge>
        ) : (
          <Badge tone="gray">Not connected</Badge>
        )}
      </div>
    </Card>
  );
};

const S3Card = () => {
  const { showToast } = useToast();
  const { data: s3 } = useGetS3ConnectionQuery();
  const [save, { isLoading: saving }] = useSaveS3ConnectionMutation();
  const [remove, { isLoading: removing }] = useDeleteS3ConnectionMutation();
  const [form, setForm] = useState({ accessKeyId: "", secretAccessKey: "", region: "" });

  const handleSave = async () => {
    try {
      await save(form).unwrap();
      setForm({ accessKeyId: "", secretAccessKey: "", region: "" });
      showToast({ message: "S3 keys saved (encrypted).", type: "success" });
    } catch (error) {
      showToast({ message: error?.data?.error || "Unable to save the keys.", type: "error" });
    }
  };

  return (
    <Card
      title="Amazon S3"
      description="Public buckets work without keys. For private buckets, add an IAM key that can only s3:ListBucket and s3:GetObject."
      actions={
        s3?.connected && (
          <Button variant="secondary" size="sm" icon={Link2Off} loading={removing} onClick={() => remove()}>
            Remove keys
          </Button>
        )
      }
    >
      {s3?.connected ? (
        <div className="flex items-center gap-2 text-sm">
          <Database size={16} className="text-app-text-muted" />
          <Badge tone="green">Keys saved</Badge>
          <span className="font-mono text-xs text-app-text-muted">{s3.accessKeyIdHint}</span>
          {s3.region && <span className="text-xs text-app-text-muted">· {s3.region}</span>}
        </div>
      ) : s3 && !s3.configured ? (
        <p className="text-sm text-app-text-muted">Saving S3 keys is not enabled on this server.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Access key ID">
            <Input value={form.accessKeyId} onChange={(e) => setForm((f) => ({ ...f, accessKeyId: e.target.value }))} autoComplete="off" placeholder="AKIA…" />
          </Field>
          <Field label="Secret access key">
            <Input type="password" value={form.secretAccessKey} onChange={(e) => setForm((f) => ({ ...f, secretAccessKey: e.target.value }))} autoComplete="new-password" />
          </Field>
          <Field label="Region (optional)">
            <Input value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} placeholder="ap-south-1" />
          </Field>
          <div className="sm:col-span-3 flex justify-end">
            <Button size="sm" loading={saving} disabled={!form.accessKeyId || !form.secretAccessKey} onClick={handleSave}>
              Save keys
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

const ConnectionsPanel = () => (
  <div className="grid gap-4 lg:grid-cols-2">
    <DriveCard />
    <S3Card />
  </div>
);

export default ConnectionsPanel;
