import { useEffect, useState } from "react";
import { useToast } from "../../../../context/ToastContext";
import { updateAutoMessageConfig } from "../../../../services/api/whatsApp";
import ChannelToggle from "./ChannelToggle";
import TemplatePreview from "../components/TemplatePreview";

const MODULES = [
  { key: "eazbot", label: "Eazbot Leads" },
  { key: "webform", label: "Webform Leads" },
  { key: "metaLead", label: "Meta Leads" },
  { key: "googleLead", label: "Google Leads" },
  { key: "whatsapp", label: "WhatsApp" },
];

const defaultConfig = {
  enabled: false,
  type: "template",
  templateName: "",
  message: "",
  flowId: "",
};

const FIELD =
  "w-full min-w-0 rounded-[var(--r-sm)] border border-app-border bg-app-surface-secondary px-[var(--sp-3)] py-[var(--sp-2)] text-[length:var(--fs-sm)] text-app-text placeholder:text-app-text-faint outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30";

const AutoMessageCard = ({
  autoMessage = {},
  templates = [],
  phoneNumberId,
  notification,
  flows,
}) => {
  const flow = [{ ...flows }];
  const { showToast } = useToast();

  const [configs, setConfigs] = useState({});
  const [applyToAll, setApplyToAll] = useState(false);
  const [backupConfigs, setBackupConfigs] = useState(null);
  const [whatsappNotification, setWhatsappNotification] = useState(false);
  const [loading, setLoading] = useState(false);

  // ---------------- INIT ----------------
  useEffect(() => {
    const initial = {};
    MODULES.forEach(({ key }) => {
      initial[key] = autoMessage?.[key] || defaultConfig;
    });

    setConfigs(initial);
    setWhatsappNotification(notification?.enable ?? false);
  }, [autoMessage, notification]);

  // ---------------- HELPERS ----------------
  const isAnyEnabled = Object.values(configs).some((c) => c?.enabled);

  // ---------------- APPLY TO ALL TOGGLE ----------------
  const handleApplyToAllToggle = () => {
    setApplyToAll((prev) => {
      const next = !prev;

      // 👉 Turning ON
      if (next) {
        setBackupConfigs(configs);

        const source =
          Object.values(configs).find((c) => c.enabled) || defaultConfig;

        const synced = {};
        MODULES.forEach(({ key }) => {
          synced[key] = { ...source, enabled: true };
        });

        setConfigs(synced);
      }

      // 👉 Turning OFF
      else if (backupConfigs) {
        setConfigs(backupConfigs);
        setBackupConfigs(null);
      }

      return next;
    });
  };

  // ---------------- AUTO RESET APPLY-ALL ----------------
  useEffect(() => {
    if (!isAnyEnabled && applyToAll) {
      setApplyToAll(false);
      setBackupConfigs(null);
    }
  }, [configs]);

  // ---------------- UPDATE ----------------
  const updateConfig = (module, key, value) => {
    setConfigs((prev) => {
      // ✅ Sync only if apply-all is ON
      if (applyToAll) {
        const updated = {};
        MODULES.forEach(({ key: m }) => {
          updated[m] = {
            ...prev[m],
            [key]: value,
          };
        });
        return updated;
      }

      // ✅ Normal update
      return {
        ...prev,
        [module]: {
          ...prev[module],
          [key]: value,
        },
      };
    });
  };

  // ---------------- TEMPLATE META ----------------
  const getTemplateMeta = (name) => {
    const tpl = templates.find((t) => t.name === name);
    if (!tpl) return null;

    const get = (type) => tpl.components?.find((c) => c.type === type);

    const body = get("BODY");
    const header = get("HEADER");
    const buttons = get("BUTTONS");

    return {
      name: tpl.name,
      language: tpl.language || "en",
      bodyText: body?.text || "",
      variables: body?.example?.body_text?.[0] || [],
      headerVariables: header?.example?.header_text || [],
      // variables: (body?.text?.match(/{{\d+}}/g) || []).length,
      // headerVariables: header?.text?.match(/{{\d+}}/g) || [],
      headerType: header?.format || null,
      buttons: buttons?.buttons || [],
    };
  };

  // ---------------- SAVE ----------------
  const handleSave = async () => {
    try {
      setLoading(true);

      const formatted = {};

      MODULES.forEach(({ key }) => {
        const c = configs[key];

        if (!c.enabled) {
          formatted[key] = { enabled: false };
          return;
        }

        formatted[key] = {
          enabled: true,
          type: c.type,
          templateName: c.templateName || null,
          message: c.type === "text" ? c.message : null,
          flowId: c.type === "flow" ? c.flowId : null,
          templateMeta:
            c.type === "template" ? getTemplateMeta(c.templateName) : null,
        };
      });

      const payload = {
        phoneNumberId,
        autoMessage: formatted,
        notification: { enable: whatsappNotification },
      };

      console.log("payload", payload);

      const res = await updateAutoMessageConfig(payload);

      if (res?.success) {
        showToast({
          message: "Auto message updated successfully",
          type: "success",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  const renderModule = ({ key, label }) => {
    const c = configs[key] || defaultConfig;
    const tpl = templates.find((t) => t.name === c.templateName);

    return (
      <div
        key={key}
        className="border border-app-border rounded-[var(--r-md)] p-[var(--sp-4)] bg-app-surface space-y-[var(--sp-3)]"
      >
        <ChannelToggle
          label={label}
          value={c.enabled}
          onChange={() => updateConfig(key, "enabled", !c.enabled)}
        />

        {c.enabled && (
          <>
            <select
              value={c.type}
              onChange={(e) => updateConfig(key, "type", e.target.value)}
              className={`${FIELD} cursor-pointer`}
            >
              <option value="template">Template</option>
              <option value="text">Text</option>
              {label.toLowerCase() === "whatsapp" && (
                <option value="flow">Flow</option>
              )}
            </select>

            {c.type === "template" && (
              <>
                <select
                  value={c.templateName}
                  onChange={(e) =>
                    updateConfig(key, "templateName", e.target.value)
                  }
                  className={`${FIELD} cursor-pointer`}
                >
                  <option value="">Select template</option>
                  {templates.map((t) => (
                    <option key={t.name}>{t.name}</option>
                  ))}
                </select>

                {tpl && <TemplatePreview components={tpl.components || []} />}
              </>
            )}

            {c.type === "text" && (
              <textarea
                value={c.message}
                onChange={(e) => updateConfig(key, "message", e.target.value)}
                rows={3}
                className={`${FIELD} resize-y`}
              />
            )}

            {c.type === "flow" && label.toLowerCase() === "whatsapp" && (
              <select
                onChange={(e) => updateConfig(key, "flowId", e.target.value)}
                className={`${FIELD} cursor-pointer`}
                value={c.flowId}
              >
                <option value="">Select flow</option>
                {flow?.map((f) => (
                  <option key={f._id}>{f._id}</option>
                ))}
              </select>
              // <input
              //   value={c.flowId}
              //   onChange={(e) => updateConfig(key, "flowId", e.target.value)}
              //   placeholder="Flow ID"
              //   className="w-full border px-3 py-2 rounded-md text-sm"
              // />
            )}
          </>
        )}
      </div>
    );
  };

  const hasChanges = JSON.stringify(configs) !== JSON.stringify(autoMessage);

  // ---------------- RETURN ----------------
  return (
    <div className="bg-app-surface px-[var(--sp-5)] py-[var(--sp-5)] space-y-[var(--sp-5)]">
      <h3 className="text-[length:var(--fs-lg)] font-medium text-gray-600 dark:text-app-text-muted">
        Auto Messaging Configuration
      </h3>

      {/* Apply to all */}
      <label
        className={`flex items-center justify-between gap-[var(--sp-3)] p-[var(--sp-3)] rounded-[var(--r-sm)] bg-app-surface-secondary ${
          !isAnyEnabled ? "opacity-50" : "cursor-pointer"
        }`}
      >
        <span className="text-[length:var(--fs-sm)] text-gray-700 dark:text-app-text">
          Apply same config to all modules
        </span>

        <input
          type="checkbox"
          disabled={!isAnyEnabled}
          checked={applyToAll}
          onChange={handleApplyToAllToggle}
          className="h-4 w-4 shrink-0 accent-primary cursor-pointer disabled:cursor-not-allowed"
        />
      </label>

      {/* Modules */}
      <div className="space-y-[var(--sp-4)]">{MODULES.map(renderModule)}</div>

      {/* Save */}
      {hasChanges && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-[var(--sp-5)] py-[var(--sp-2)] rounded-[var(--r-sm)] text-[length:var(--fs-sm)] font-medium transition-colors disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AutoMessageCard;