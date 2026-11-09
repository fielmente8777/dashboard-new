import { BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { Field, Input } from "../../../components/ui/Field";
import SettingsCard from "../../../components/ui/SettingsCard";
import Switch from "../../../components/ui/Switch";

const CHANNELS = [
  { key: "email", label: "Email", hint: "To the tenant's account email" },
  { key: "inApp", label: "In-app", hint: "Banner and notification in the dashboard" },
  { key: "whatsapp", label: "WhatsApp", hint: "To the tenant's business number" },
];

const ToggleRow = ({ label, hint, checked, onChange, disabled }) => (
  <div className="flex items-center justify-between gap-3 py-2.5">
    <div className="min-w-0">
      <p className="text-sm font-medium text-app-text">{label}</p>
      {hint && <p className="text-xs text-app-text-muted">{hint}</p>}
    </div>
    <Switch label={label} checked={checked} onChange={onChange} disabled={disabled} />
  </div>
);

// When tenants are warned that their credits are running out; onSave(settings).
const LowCreditSettings = ({ settings, onSave }) => {
  const [form, setForm] = useState(settings);

  useEffect(() => setForm(settings), [settings]);

  const low = Number(form.lowThreshold);
  const critical = Number(form.criticalThreshold);
  const thresholdError =
    !(low > 0) || !(critical > 0) ? "Both thresholds must be above 0"
      : critical >= low ? "The critical threshold must be below the low threshold"
        : null;
  const dirty = JSON.stringify(form) !== JSON.stringify(settings);
  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <SettingsCard
      icon={BellRing}
      title="Low-credit settings"
      description="When tenants are warned that their AI credits are running out"
      footer={
        <>
          <span>{thresholdError ? <span className="text-red-500">{thresholdError}</span> : "Applies to every tenant"}</span>
          <Button variant="secondary" size="sm" disabled={!dirty} onClick={() => setForm(settings)}>
            Reset
          </Button>
          <Button
            size="sm"
            disabled={!dirty || Boolean(thresholdError)}
            onClick={() => onSave({ ...form, lowThreshold: low, criticalThreshold: critical })}
          >
            Save settings
          </Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Field label="Low-credit threshold" hint="Amber warning below this balance">
            <Input type="number" min="1" value={form.lowThreshold} onChange={(e) => set("lowThreshold", e.target.value)} />
          </Field>
          <Field label="Critical-credit threshold" hint="Red warning below this balance">
            <Input type="number" min="1" value={form.criticalThreshold} onChange={(e) => set("criticalThreshold", e.target.value)} />
          </Field>
        </div>

        <div>
          <ToggleRow
            label="Low-credit notifications"
            hint="Warn tenants when they cross a threshold"
            checked={form.notificationsEnabled}
            onChange={(on) => set("notificationsEnabled", on)}
          />
          <div className={`divide-y divide-app-border border-t border-app-border! ${form.notificationsEnabled ? "" : "opacity-50"}`}>
            {CHANNELS.map((channel) => (
              <ToggleRow
                key={channel.key}
                label={channel.label}
                hint={channel.hint}
                disabled={!form.notificationsEnabled}
                checked={Boolean(form.channels?.[channel.key])}
                onChange={(on) => set("channels", { ...form.channels, [channel.key]: on })}
              />
            ))}
            <ToggleRow
              label="Notify Eazotel admins"
              hint="Also alert the admin team about critical wallets"
              disabled={!form.notificationsEnabled}
              checked={Boolean(form.notifyAdmins)}
              onChange={(on) => set("notifyAdmins", on)}
            />
          </div>
        </div>
      </div>
    </SettingsCard>
  );
};

export default LowCreditSettings;
