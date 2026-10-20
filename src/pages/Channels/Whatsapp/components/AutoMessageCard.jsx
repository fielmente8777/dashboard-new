import { Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import { Field, Textarea } from "../../../../components/ui/Field";
import Segmented from "../../../../components/ui/Segmented";
import SelectMenu from "../../../../components/ui/SelectMenu";
import Switch from "../../../../components/ui/Switch";
import { useToast } from "../../../../context/ToastContext";
import { updateAutoMessageConfig } from "../../../../redux/api/whatsappBusinessApi";
import TemplatePreview from "./TemplatePreview";

// Where a new lead can come from; each can get its own automatic message.
const MODULES = [
  { key: "eazbot", label: "Eazbot leads", description: "Visitors who chat with your website bot" },
  { key: "webform", label: "Website form leads", description: "Enquiries from forms on your website" },
  { key: "metaLead", label: "Meta leads", description: "Facebook and Instagram lead ads" },
  { key: "googleLead", label: "Google leads", description: "Google Ads lead forms" },
  { key: "whatsapp", label: "WhatsApp", description: "New guests who message you first" },
];

const defaultConfig = { enabled: false, type: "template", templateName: "", message: "", flowId: "" };

const toConfigs = (autoMessage) =>
  Object.fromEntries(
    MODULES.map(({ key }) => [key, { ...defaultConfig, ...(autoMessage?.[key] || {}) }]),
  );

// Messages sent automatically to new leads, per lead source.
const AutoMessageCard = ({ autoMessage, templates = [], phoneNumberId, notification, flows }) => {
  const { showToast } = useToast();
  const [saved, setSaved] = useState(() => toConfigs(autoMessage));
  const [configs, setConfigs] = useState(saved);
  const [applyToAll, setApplyToAll] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initial = toConfigs(autoMessage);
    setSaved(initial);
    setConfigs(initial);
  }, [autoMessage]);

  // the account has one flow; older data sends it as a single object
  const flowOptions = useMemo(() => {
    const list = Array.isArray(flows) ? flows : flows?._id ? [flows] : [];
    return list.map((f) => ({ value: f._id, label: f.flowName || f.name || f._id }));
  }, [flows]);

  const approved = templates.filter((t) => !t.status || t.status === "APPROVED");
  const templateOptions = approved.map((t) => ({ value: t.name, label: t.name }));

  const isDirty = JSON.stringify(configs) !== JSON.stringify(saved);
  const anyEnabled = Object.values(configs).some((c) => c.enabled);

  const update = (module, changes) =>
    setConfigs((prev) =>
      applyToAll
        ? Object.fromEntries(MODULES.map(({ key }) => [key, { ...prev[key], ...changes }]))
        : { ...prev, [module]: { ...prev[module], ...changes } },
    );

  // copies the first enabled source's message to every source
  const toggleApplyToAll = (on) => {
    setApplyToAll(on);
    if (!on) return;
    const source = Object.values(configs).find((c) => c.enabled) || defaultConfig;
    setConfigs(Object.fromEntries(MODULES.map(({ key }) => [key, { ...source, enabled: true }])));
  };

  const templateMeta = (name) => {
    const tpl = templates.find((t) => t.name === name);
    if (!tpl) return null;
    const get = (type) => tpl.components?.find((c) => c.type === type);
    return {
      name: tpl.name,
      language: tpl.language || "en",
      bodyText: get("BODY")?.text || "",
      variables: get("BODY")?.example?.body_text?.[0] || [],
      headerVariables: get("HEADER")?.example?.header_text || [],
      headerType: get("HEADER")?.format || null,
      buttons: get("BUTTONS")?.buttons || [],
    };
  };

  const problem = () => {
    for (const { key, label } of MODULES) {
      const c = configs[key];
      if (!c.enabled) continue;
      if (c.type === "template" && !c.templateName) return `Choose a template for ${label}.`;
      if (c.type === "text" && !c.message.trim()) return `Write the message for ${label}.`;
      if (c.type === "flow" && !c.flowId) return `Choose a flow for ${label}.`;
    }
    return null;
  };

  const save = async () => {
    const issue = problem();
    if (issue) {
      showToast({ message: issue, type: "error" });
      return;
    }

    setLoading(true);
    try {
      const formatted = Object.fromEntries(
        MODULES.map(({ key }) => {
          const c = configs[key];
          if (!c.enabled) return [key, { enabled: false }];
          return [
            key,
            {
              enabled: true,
              type: c.type,
              templateName: c.templateName || null,
              message: c.type === "text" ? c.message : null,
              flowId: c.type === "flow" ? c.flowId : null,
              templateMeta: c.type === "template" ? templateMeta(c.templateName) : null,
            },
          ];
        }),
      );

      const res = await updateAutoMessageConfig({
        phoneNumberId,
        autoMessage: formatted,
        notification: { enable: notification?.enable ?? false },
      });
      if (!res?.success) throw new Error(res?.responseMessage);

      setSaved(configs);
      showToast({ message: "Auto replies saved" });
    } catch (error) {
      showToast({ message: error?.message || "Could not save auto replies.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <Zap className="size-4 text-app-text-muted" />
          Auto replies to new leads
        </span>
      }
      description="Send a WhatsApp message the moment a new lead comes in."
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-app-surface-secondary px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-app-text">Same message for every source</p>
            <p className="text-xs text-app-text-muted">Edit once, apply to all lead sources.</p>
          </div>
          <Switch
            label="Same message for every source"
            checked={applyToAll}
            onChange={toggleApplyToAll}
            disabled={!anyEnabled && !applyToAll}
          />
        </div>

        <ul className="divide-y divide-app-border! rounded-lg border border-app-border!">
          {MODULES.map(({ key, label, description }) => {
            const c = configs[key];
            const tpl = templates.find((t) => t.name === c.templateName);
            const types = [
              { value: "template", label: "Template" },
              { value: "text", label: "Text" },
              ...(key === "whatsapp" ? [{ value: "flow", label: "Flow" }] : []),
            ];

            return (
              <li key={key} className="space-y-3 p-3">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-app-text">{label}</p>
                    <p className="text-xs text-app-text-muted">{description}</p>
                  </div>
                  <Switch
                    label={`Auto reply to ${label}`}
                    checked={c.enabled}
                    onChange={(enabled) => update(key, { enabled })}
                  />
                </div>

                {c.enabled && (
                  <div className="space-y-3 rounded-lg bg-app-surface-secondary/50 p-3">
                    <Segmented
                      label="Message type"
                      options={types}
                      value={c.type}
                      onChange={(type) => update(key, { type })}
                    />

                    {c.type === "template" && (
                      <>
                        <Field
                          as="div"
                          label="Template"
                          hint={approved.length ? undefined : "No approved templates yet."}
                        >
                          <SelectMenu
                            label="Template"
                            options={templateOptions}
                            value={c.templateName}
                            onChange={(templateName) => update(key, { templateName })}
                            placeholder="Choose an approved template"
                            disabled={!approved.length}
                            className="w-full"
                          />
                        </Field>
                        {tpl && <TemplatePreview components={tpl.components || []} />}
                      </>
                    )}

                    {c.type === "text" && (
                      <Field label="Message">
                        <Textarea
                          rows={3}
                          value={c.message}
                          onChange={(e) => update(key, { message: e.target.value })}
                          placeholder="Hi! Thanks for your enquiry. Our team will reply shortly."
                        />
                      </Field>
                    )}

                    {c.type === "flow" && (
                      <Field as="div" label="Flow" hint={flowOptions.length ? undefined : "Create a flow first."}>
                        <SelectMenu
                          label="Flow"
                          options={flowOptions}
                          value={c.flowId}
                          onChange={(flowId) => update(key, { flowId })}
                          placeholder="Choose a flow"
                          disabled={!flowOptions.length}
                          className="w-full"
                        />
                      </Field>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {isDirty && (
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConfigs(saved)} disabled={loading}>
              Discard
            </Button>
            <Button onClick={save} loading={loading}>
              Save auto replies
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AutoMessageCard;
