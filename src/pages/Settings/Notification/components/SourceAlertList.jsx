import SelectMenu from "../../../../components/ui/SelectMenu";
import Switch from "../../../../components/ui/Switch";
import { SOURCES } from "../notificationUtils";

const CHANNELS = {
  phone: { list: "phone", allowed: "isPhoneAllowed", noun: "WhatsApp" },
  email: { list: "email", allowed: "isEmailAllowed", noun: "email" },
};

// One row per lead source: an on/off switch and who receives the alert.
//   channel  - "phone" (WhatsApp) | "email"
//   options  - [{ value, label }] team members who can receive it
//   disabled - the whole channel is off
const SourceAlertList = ({ channel, config, options, disabled, onChange }) => {
  const { list, allowed, noun } = CHANNELS[channel];

  return (
    <ul className="divide-y divide-app-border! rounded-lg border border-app-border!">
      {SOURCES.map((source) => {
        const item = config[source.key];
        const on = item[allowed];
        const chosen = item[list];

        // keep people who were chosen before but are no longer on the team
        const known = new Set(options.map((option) => option.value));
        const allOptions = [
          ...options,
          ...chosen
            .filter((value) => !known.has(value))
            .map((value) => ({ value, label: value })),
        ];

        return (
          <li
            key={source.key}
            className={`flex flex-wrap items-center gap-3 px-4 py-3 ${disabled ? "opacity-60" : ""}`}
          >
            <div className="min-w-40 flex-1">
              <p className="text-sm font-medium text-app-text">{source.label}</p>
              <p className="text-xs text-app-text-muted">{source.description}</p>
            </div>

            <SelectMenu
              multiple
              label={`${source.label} ${noun} recipients`}
              placeholder={on ? "Choose who gets it" : "Off"}
              options={allOptions}
              value={chosen}
              disabled={disabled || !on}
              onChange={(value) => onChange(source.key, { [list]: value })}
              className="w-full sm:w-64"
            />

            <Switch
              label={`Send ${noun} alerts for ${source.label}`}
              checked={on}
              disabled={disabled}
              onChange={(value) => onChange(source.key, { [allowed]: value })}
            />
          </li>
        );
      })}
    </ul>
  );
};

export default SourceAlertList;
