import { BadgeCheck, Clock, PencilLine, XCircle } from "lucide-react";
import { useState } from "react";
import Badge from "../../../../components/ui/Badge";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import { Field, Input } from "../../../../components/ui/Field";
import Icon from "../../../../components/ui/Icon";
import { Skeleton } from "../../../../components/ui/States";
import { useApiAction } from "../../../../hooks/useApiAction";
import { useTenant } from "../../../../hooks/useTenant";
import {
  useGetWhatsAppDisplayNameQuery,
  useUpdateWhatsAppDisplayNameMutation,
} from "../../../../redux/api/whatsappBusinessApi";

// Meta's review states -> how we show them
const STATUS = {
  APPROVED: { label: "Approved", tone: "green", icon: BadgeCheck },
  AVAILABLE_WITHOUT_REVIEW: { label: "Approved", tone: "green", icon: BadgeCheck },
  PENDING_REVIEW: { label: "In review", tone: "amber", icon: Clock },
  NON_EXISTS: { label: "Not set", tone: "gray", icon: Clock },
  DECLINED: { label: "Declined", tone: "red", icon: XCircle },
};
const statusOf = (value) =>
  STATUS[String(value || "").toUpperCase()] || { label: String(value || "Unknown").toLowerCase().replace(/_/g, " "), tone: "gray", icon: Clock };

// Meta's rules, kept short: 3 to 512 characters, no URLs, and it should
// match your business name
const MIN = 3;
const MAX = 512;

// The name guests see on your WhatsApp messages. A new name goes to Meta
// for review; the current one stays until it is approved.
const DisplayNameCard = () => {
  const { hid } = useTenant();
  const run = useApiAction();
  const name = useGetWhatsAppDisplayNameQuery(hid, { skip: !hid });
  const [update, { isLoading: saving }] = useUpdateWhatsAppDisplayNameMutation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  if (name.error?.status === 404) return null; // server without this feature yet
  if (name.isLoading) return <Skeleton className="h-36 rounded-xl" />;
  if (name.isError || !name.data) return null;

  const { verified_name: current, name_status: status, new_display_name: pending, new_name_status: pendingStatus } =
    name.data;
  const currentStatus = statusOf(status);
  const pendingInfo = pending ? statusOf(pendingStatus) : null;
  const value = draft.trim();
  const invalid = value.length < MIN || /https?:\/\/|www\./i.test(value);

  const submit = async (e) => {
    e.preventDefault();
    const done = await run(update({ hid, displayName: value }), {
      success: "Sent to Meta for review. This usually takes 1 to 2 days.",
      error: "Could not submit the name.",
    });
    if (done) setEditing(false);
  };

  return (
    <Card
      title="Display name"
      description="The name guests see on your WhatsApp messages."
      actions={
        !editing && (
          <Button
            size="sm"
            variant="secondary"
            icon={PencilLine}
            onClick={() => {
              setDraft(pending || current || "");
              setEditing(true);
            }}
          >
            Change
          </Button>
        )
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-base font-semibold text-app-text">{current || "Not set"}</p>
        <Badge tone={currentStatus.tone}>
          <Icon icon={currentStatus.icon} size="sm" className="mr-1" />
          {currentStatus.label}
        </Badge>
      </div>

      {pendingInfo && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-app-bg px-3 py-2 text-sm">
          <span className="text-app-text-muted">New name:</span>
          <span className="font-medium text-app-text">{pending}</span>
          <Badge tone={pendingInfo.tone}>{pendingInfo.label}</Badge>
        </div>
      )}

      {editing && (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <Field
            label="New display name"
            hint="Should match your business name. Meta reviews every change."
            error={value && invalid ? "Use at least 3 characters and no website links." : ""}
          >
            <Input value={draft} maxLength={MAX} onChange={(e) => setDraft(e.target.value)} autoFocus />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={saving} disabled={invalid || value === current}>
              Submit for review
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};

export default DisplayNameCard;
