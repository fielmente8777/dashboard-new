import { Bot, Upload } from "lucide-react";
import { useRef } from "react";
import Button from "../../../components/ui/Button";
import ColorField from "../../../components/ui/ColorField";
import { Field, Input, Textarea } from "../../../components/ui/Field";
import Switch from "../../../components/ui/Switch";
import { BEHAVIOUR_TOGGLES, COLOR_FIELDS, COLOR_SWATCHES } from "../eazbotUtils";

// Each section edits part of the draft through setField(key, value).

export const AppearanceSection = ({ form, setField }) => (
  <div className="grid gap-5 sm:grid-cols-2">
    {COLOR_FIELDS.map(({ key, label, hint }) => (
      <ColorField
        key={key}
        label={label}
        hint={hint}
        value={form[key]}
        swatches={key === "bg_color" || key === "button_color" ? COLOR_SWATCHES : undefined}
        onChange={(value) => setField(key, value)}
      />
    ))}
  </div>
);

export const ProfileSection = ({ form, setField, onAvatar, isUploading, errors = {} }) => {
  const fileRef = useRef(null);
  const text = (key) => ({
    value: form[key] || "",
    onChange: (e) => setField(key, e.target.value),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        {form.avatar_url ? (
          <img
            src={form.avatar_url}
            alt="Bot avatar"
            className="size-16 rounded-full border border-app-border! object-cover"
          />
        ) : (
          <span className="flex size-16 items-center justify-center rounded-full bg-app-surface-secondary text-app-text-muted">
            <Bot className="size-7" />
          </span>
        )}
        <div className="space-y-1">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={Upload}
              loading={isUploading}
              onClick={() => fileRef.current?.click()}
            >
              {form.avatar_url ? "Change avatar" : "Upload avatar"}
            </Button>
            {form.avatar_url && (
              <Button size="sm" variant="ghost" onClick={() => setField("avatar_url", "")}>
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-app-text-faint">A square image works best.</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onAvatar(file);
            e.target.value = "";
          }}
        />
      </div>

      <p className="text-xs text-app-text-muted">
        Name, email and phone are filled in from your hotel profile. Change them if the bot
        should show different ones.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Bot name" error={errors.bot_name}>
          <Input placeholder="e.g. Maya from Hotel Lotus" {...text("bot_name")} />
        </Field>
        <Field label="Contact number" error={errors.contact}>
          <Input type="tel" placeholder="+91 98765 43210" {...text("contact")} />
        </Field>
        <Field label="Email" className="sm:col-span-2" error={errors.email}>
          <Input type="email" placeholder="reservations@yourhotel.com" {...text("email")} />
        </Field>
        <Field label="Description" className="sm:col-span-2" hint="A line about what the bot can help with.">
          <Textarea rows={3} {...text("description")} />
        </Field>
      </div>
    </div>
  );
};

export const MessagesSection = ({ form, setField, errors = {} }) => {
  const text = (key) => ({
    value: form[key] || "",
    onChange: (e) => setField(key, e.target.value),
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Welcome message"
          className="sm:col-span-2"
          hint="The first message a visitor sees."
          error={errors.welcome_message}
        >
          <Textarea rows={2} placeholder="Hi! Looking for a room? I can help." {...text("welcome_message")} />
        </Field>
        <Field label="Fallback message" hint="Sent when an answer is not understood.">
          <Textarea rows={2} placeholder="Sorry, please choose one of the options." {...text("fallback_message")} />
        </Field>
        <Field label="Closing message" hint="Sent after the last question.">
          <Textarea rows={2} placeholder="Thanks! Our team will get back to you shortly." {...text("chat_terminate_message")} />
        </Field>
        <Field label="Time interval (seconds)">
          <Input type="number" min={0} {...text("time_interval")} />
        </Field>
      </div>

      <ul className="divide-y divide-app-border! rounded-lg border border-app-border!">
        {BEHAVIOUR_TOGGLES.map((toggle) => (
          <li key={toggle.key} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-app-text">{toggle.label}</p>
              <p className="text-xs text-app-text-muted">{toggle.description}</p>
            </div>
            <Switch
              label={toggle.label}
              checked={form[toggle.key]}
              onChange={(value) => setField(toggle.key, value)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
