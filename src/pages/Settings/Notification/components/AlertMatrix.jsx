import { Bot, Globe } from "lucide-react";
import { FaMeta, FaWhatsapp } from "react-icons/fa6";
import { SiGoogleads } from "react-icons/si";
import Badge from "../../../../components/ui/Badge";
import Icon from "../../../../components/ui/Icon";
import SelectMenu from "../../../../components/ui/SelectMenu";
import Switch from "../../../../components/ui/Switch";
import { CHANNELS, SOURCES } from "../notificationUtils";

const SOURCE_ICONS = {
  webform: Globe,
  eazbot: Bot,
  whatsapp: FaWhatsapp,
  facebook: FaMeta,
  google: SiGoogleads,
};

// Tailwind only builds class names it can read whole, so one per column count.
const GRID = {
  1: "lg:grid-cols-[minmax(11rem,1fr)_minmax(0,1.4fr)]",
  2: "lg:grid-cols-[minmax(11rem,1fr)_minmax(0,1.2fr)_minmax(0,1.2fr)]",
};

// One source on one channel: on/off and who receives the alert.
const AlertCell = ({ source, channel, config, options, disabled, onChange }) => {
  const { list, allowed, label, noun } = CHANNELS[channel];
  const item = config[source.key];
  const on = item[allowed];
  const chosen = item[list];

  // keep people who were chosen before but are no longer on the team
  const known = new Set(options.map((option) => option.value));
  const allOptions = [
    ...options,
    ...chosen.filter((value) => !known.has(value)).map((value) => ({ value, label: value })),
  ];

  return (
    <div className={`flex min-w-0 items-center gap-3 ${disabled ? "opacity-60" : ""}`}>
      <span className="w-16 shrink-0 text-xs font-medium text-app-text-muted lg:hidden">
        {label}
      </span>
      <Switch
        label={`Send ${noun} alerts for ${source.label}`}
        checked={on}
        disabled={disabled}
        onChange={(value) => onChange(source.key, { [allowed]: value })}
      />
      <SelectMenu
        multiple
        label={`${source.label} ${noun} recipients`}
        placeholder={on ? "Choose who gets it" : "Off"}
        options={allOptions}
        value={chosen}
        disabled={disabled || !on}
        onChange={(value) => onChange(source.key, { [list]: value })}
        className="min-w-0 flex-1"
      />
    </div>
  );
};

// Every lead source against every alert channel. A table on wide screens;
// on phones each source lists its channels underneath.
//   channels - [{ key: "phone" | "email", options: [{ value, label }], disabled }]
const AlertMatrix = ({ channels, config, onChange }) => {
  const grid = GRID[channels.length] || GRID[2];

  return (
    <div>
      <div
        className={`hidden gap-4 border-b border-app-border! bg-app-surface-secondary/50 px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-app-text-muted lg:grid ${grid}`}
      >
        <span>Lead source</span>
        {channels.map((channel) => (
          <span key={channel.key} className="flex items-center gap-2">
            {CHANNELS[channel.key].label}
            {channel.disabled && <Badge className="normal-case tracking-normal">Off</Badge>}
          </span>
        ))}
      </div>

      <ul className="divide-y divide-app-border!">
        {SOURCES.map((source) => (
          <li
            key={source.key}
            className={`grid grid-cols-1 items-center gap-3 px-4 py-4 transition-colors hover:bg-app-surface-secondary/30 sm:px-6 lg:gap-4 ${grid}`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-app-border! bg-app-surface-secondary text-app-text-muted">
                <Icon icon={SOURCE_ICONS[source.key] || Globe} size="sm" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-app-text">{source.label}</p>
                <p className="truncate text-xs text-app-text-muted">{source.description}</p>
              </div>
            </div>

            {channels.map((channel) => (
              <AlertCell
                key={channel.key}
                source={source}
                channel={channel.key}
                config={config}
                options={channel.options}
                disabled={channel.disabled}
                onChange={onChange}
              />
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AlertMatrix;
