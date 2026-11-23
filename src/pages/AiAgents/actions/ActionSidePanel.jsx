import { Bot, Check, Copy, MessageCircle, Play, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import CodeBlock from "../../../components/ui/CodeBlock";
import { Field, Input, Select } from "../../../components/ui/Field";
import IconButton from "../../../components/ui/IconButton";
import Segmented from "../../../components/ui/Segmented";
import { useConfirm } from "../../../context/ConfirmContext";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { useTestAiAgentActionMutation } from "../../../redux/api/aiAgentsApi";
import { outputsOf, toPayload, typeLabel } from "./actionModel";

const Panel = ({ title, icon: PanelIcon, children }) => (
  <section className="rounded-xl border border-app-border! bg-app-surface p-4" aria-label={title}>
    <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-app-text"><PanelIcon className="size-4 text-app-text-muted" aria-hidden="true" /> {title}</h3>
    {children}
  </section>
);

const target = (form) => {
  const { executor } = form;
  if (executor.type === "builtin") return `Built-in: ${executor.handlerKey || "choose a handler"}`;
  if (executor.type === "n8n") return `n8n workflow${executor.n8n?.webhookUrl ? ` (${safeHost(executor.n8n.webhookUrl)})` : ""}`;
  if (executor.type === "code") return "Custom code";
  return `${executor.http?.method || "POST"} ${safeHost(executor.http?.url) || "your API"}`;
};
const safeHost = (url) => {
  try {
    return new URL(String(url).replace(/\{\{[^}]*\}\}/g, "x")).host;
  } catch {
    return "";
  }
};

// The 4-step flow, from the form as it is now
const Preview = ({ form }) => {
  const steps = [
    { icon: MessageCircle, title: "Guest message", text: form.intents[0] ? `“${form.intents[0]}”` : "Add intents in General" },
    { icon: Sparkles, title: "AI collects the details", text: form.inputs.length ? form.inputs.map((i) => `${i.name}${i.required ? "*" : ""}`).join(", ") : "No inputs" },
    { icon: Zap, title: "Runs the action", text: `${target(form)}${form.requiresConfirmation || form.riskLevel === "high" ? " · after the guest confirms" : ""}` },
    { icon: Bot, title: "Replies to the guest", text: form.response?.successTemplate || form.response?.aiInstructions || "The AI explains the result" },
  ];
  return (
    <ol className="space-y-0">
      {steps.map((step, i) => (
        <li key={step.title} className="relative flex gap-3 pb-4 last:pb-0">
          {i < steps.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px bg-app-border" aria-hidden="true" />}
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-app-accent-soft text-app-accent-text"><step.icon className="size-4" aria-hidden="true" /></span>
          <span className="min-w-0 pt-0.5">
            <span className="block text-xs font-medium text-app-text">{i + 1}. {step.title}</span>
            <span className="block break-words text-xs text-app-text-muted">{step.text}</span>
          </span>
        </li>
      ))}
    </ol>
  );
};

const CopyButton = ({ text }) => {
  const [done, setDone] = useState(false);
  return (
    <IconButton
      icon={done ? Check : Copy}
      size="sm"
      label={done ? "Copied" : `Copy ${text}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        } catch {
          // clipboard blocked: the text is visible to copy by hand
        }
      }}
    />
  );
};

const Variables = ({ form }) => {
  const [kind, setKind] = useState("inputs");
  const rows = kind === "inputs" ? form.inputs.map((i) => ({ name: i.name, type: i.type, token: `{{input.${i.name}}}` })) : outputsOf(form).map((o) => ({ ...o, token: `{{output.${o.name}}}` }));
  return (
    <div className="space-y-2">
      <Segmented label="Show" options={[{ value: "inputs", label: "Inputs" }, { value: "outputs", label: "Outputs" }]} value={kind} onChange={setKind} />
      <ul className="divide-y divide-app-border">
        {rows.filter((r) => r.name).map((row) => (
          <li key={row.token} className="flex items-center justify-between gap-2 py-1.5">
            <code className="min-w-0 truncate font-mono text-xs text-app-text">{row.token}</code>
            <span className="flex items-center gap-1"><Badge tone="gray">{row.type}</Badge><CopyButton text={row.token} /></span>
          </li>
        ))}
        {!rows.filter((r) => r.name).length && <li className="py-2 text-xs text-app-text-muted">Nothing yet.</li>}
      </ul>
    </div>
  );
};

const sampleValue = (input, sample) => sample?.[input.name] ?? input.default ?? (input.type === "boolean" ? false : input.type === "enum" ? input.enumValues?.[0] || "" : "");

const TestRunner = ({ form, actionId, channel, hid, runNonce }) => {
  const [testAction, { isLoading }] = useTestAiAgentActionMutation();
  const { confirm } = useConfirm();
  const [values, setValues] = useState({});
  const [live, setLive] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const run = async (confirmed = false) => {
    if (live && !confirmed && !(await confirm("This calls the real API or changes real data (bookings, leads, messages). Run it?", { title: "Run for real", confirmText: "Run for real", variant: "danger" }))) return;
    setError("");
    const input = Object.fromEntries(form.inputs.map((i) => [i.name, values[i.name] ?? sampleValue(i, form.sampleInput)]).filter(([, v]) => v !== ""));
    try {
      setReport(await testAction({ channel, hid, id: actionId, input, live, action: toPayload(form) }).unwrap());
    } catch (e) {
      setReport(null);
      const fields = e?.data?.errors;
      setError(fields ? `Fix the form first: ${Object.values(fields)[0]}` : getApiErrorMessage(e, "The test could not run."));
    }
  };

  // "Save & Test" in the editor
  useEffect(() => {
    if (runNonce && actionId) run(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runNonce]);

  if (!actionId) return <p className="text-xs text-app-text-muted">Save the action first, then test it here.</p>;
  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); run(); }}>
      {form.inputs.map((input) => (
        <Field key={input.name} label={`${input.name}${input.required ? " *" : ""}`} as={input.type === "enum" || input.type === "boolean" ? "div" : "label"}>
          {input.type === "enum" || input.type === "boolean" ? (
            <Select
              aria-label={input.name}
              options={input.type === "boolean" ? [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] : input.enumValues.map((v) => ({ value: v, label: v }))}
              value={String(values[input.name] ?? sampleValue(input, form.sampleInput))}
              onChange={(e) => setValues({ ...values, [input.name]: input.type === "boolean" ? e.target.value === "true" : e.target.value })}
            />
          ) : (
            <Input type={input.type === "number" ? "number" : "text"} placeholder={input.type === "date" ? "YYYY-MM-DD" : ""} value={values[input.name] ?? sampleValue(input, form.sampleInput)} onChange={(e) => setValues({ ...values, [input.name]: input.type === "number" && e.target.value !== "" ? Number(e.target.value) : e.target.value })} />
          )}
        </Field>
      ))}
      <label className="flex items-start gap-2 text-xs text-app-text">
        <input type="checkbox" className="mt-0.5 size-4 accent-app-danger" checked={live} onChange={(e) => setLive(e.target.checked)} />
        <span><span className="font-medium">Run for real</span><span className="block text-app-text-muted">Off = dry run: the request is built and checked, nothing is sent.</span></span>
      </label>
      <Button type="submit" icon={Play} loading={isLoading} variant={live ? "danger" : "primary"} className="w-full">{live ? "Run for real" : "Run test"}</Button>
      {error && <p role="alert" className="rounded-lg bg-app-danger-soft p-2 text-xs text-app-danger">{error}</p>}
      {report && (
        <div className="space-y-2" aria-live="polite">
          <p className="flex flex-wrap items-center gap-2 text-xs text-app-text-muted">
            <Badge tone={report.error ? "red" : "green"}>{report.error ? "Failed" : "OK"}</Badge>
            {report.dryRun ? "Dry run" : "Live"} · {report.latencyMs ?? 0} ms
          </p>
          {report.error && <p role="alert" className="rounded-lg bg-app-danger-soft p-2 text-xs text-app-danger">{report.error}</p>}
          {report.request && <CodeBlock title="Request" code={JSON.stringify(report.request, null, 2)} />}
          {report.response && <CodeBlock title="Response" code={JSON.stringify(report.response, null, 2)} />}
        </div>
      )}
    </form>
  );
};

const ActionSidePanel = ({ form, actionId, channel, hid, runNonce }) => (
  <div className="flex min-w-0 flex-col gap-4">
    <Panel title="Action preview" icon={ShieldCheck}><Preview form={form} /></Panel>
    <Panel title="Variables & outputs" icon={Copy}><Variables form={form} /></Panel>
    <Panel title="Test this action" icon={Play}>
      <p className="mb-3 text-xs text-app-text-muted">Uses the form as it is now ({typeLabel(form.executor.type)}). No AI credits.</p>
      <TestRunner key={actionId || "new"} form={form} actionId={actionId} channel={channel} hid={hid} runNonce={runNonce} />
    </Panel>
  </div>
);

export default ActionSidePanel;
