import { Bot } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import { Field, Input } from "../../../../components/ui/Field";
import Switch from "../../../../components/ui/Switch";
import { useToast } from "../../../../context/ToastContext";
import { updateAutoMessageConfig } from "../../../../services/api/whatsApp";

// "HH:mm" -> "9:30 AM"
const formatTime = (time) => {
  if (!time) return "--:--";
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

// When the AI answers WhatsApp messages on its own.
const AIConfigurationCard = ({ ai, phoneNumber }) => {
  const { showToast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEnabled(Boolean(ai?.enabled));
    setFrom(ai?.duration?.from || "");
    setTo(ai?.duration?.to || "");
  }, [ai]);

  const save = async () => {
    if (enabled) {
      if (!from || !to) {
        showToast({ message: "Choose when the AI should start and stop.", type: "error" });
        return;
      }
      if (from >= to) {
        showToast({ message: "The end time must be after the start time.", type: "error" });
        return;
      }
    }

    setSaving(true);
    try {
      const res = await updateAutoMessageConfig({
        phoneNumberId: phoneNumber?.id,
        ai: {
          enabled,
          duration: { from: from || null, to: to || null },
          timezone: "Asia/Kolkata",
        },
      });
      if (!res?.success) throw new Error(res?.responseMessage);
      showToast({ message: res.responseMessage || "AI settings saved" });
    } catch (error) {
      showToast({
        message: error?.message || "Could not save the AI settings.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <Bot className="size-4 text-app-text-muted" />
          AI replies
        </span>
      }
      description="Let the AI answer guests on WhatsApp during the hours you choose."
      actions={<Switch label="AI replies" checked={enabled} onChange={setEnabled} />}
    >
      {enabled ? (
        <div className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="From">
              <Input type="time" value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="To">
              <Input type="time" value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
          </div>
          <p className="text-xs text-app-text-muted">
            The AI replies from{" "}
            <span className="font-medium text-app-text">{formatTime(from)}</span> to{" "}
            <span className="font-medium text-app-text">{formatTime(to)}</span> (India
            time).
          </p>
        </div>
      ) : (
        <p className="text-sm text-app-text-muted">
          AI replies are off. Your team answers every message.
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <Button onClick={save} loading={saving}>
          Save
        </Button>
      </div>
    </Card>
  );
};

export default AIConfigurationCard;
