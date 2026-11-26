import { ArrowLeft, ArrowRight, ClipboardPaste, ExternalLink, FlaskConical, Plus, Save, Sparkles, Workflow, X } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import { Field, Input, Select, Textarea } from "../../../components/ui/Field";
import IconButton from "../../../components/ui/IconButton";
import Notice from "../../../components/ui/Notice";
import Switch from "../../../components/ui/Switch";
import { useToast } from "../../../context/ToastContext";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { useSaveAiAgentActionMutation, useTestAiAgentActionMutation } from "../../../redux/api/aiAgentsApi";
import { INPUT_TYPES, MASK, METHODS, blankAction, keyFromName, toForm, toPayload, validateAction } from "./actionModel";
import { joinUrl, parseCurl, splitUrl } from "./curlParser";
import { MAX_EXAMPLES, SENSITIVITY, applySensitivity, cleanIntentGroup, exampleToText, placeholdersIn, sensitivityOf, textToExample, toolNameFor } from "./intentModel";

const AUTH_TYPES = [
  { value: "none", label: "No auth" },
  { value: "bearer", label: "Bearer token" },
  { value: "header", label: "API key in a header" },
];
const tabClass = (active) => `-mb-px border-b-2 px-3 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-app-focus ${active ? "border-app-accent text-app-text" : "border-transparent text-app-text-muted hover:text-app-text"}`;

// A new API action starts as a GET look-up with low sensitivity
const blankApi = (timezone) => {
  const blank = blankAction(timezone);
  return { ...blank, riskLevel: "low", requiresConfirmation: false, intentGroup: "", examples: [], executor: { ...blank.executor, http: { ...blank.executor.http, method: "GET", headers: [{ name: "Content-Type", value: "application/json", secret: false }] } } };
};

// "Edit custom action" (AiSensy-style): step 1 = what and how to call,
// step 2 = the variables the agent collects, examples and a connection test.
// Fields this dialog doesn't show (response mapping, conditions, hours...)
// are kept as they are; "Open full editor" has all of them.
const CustomActionDialog = ({ open, onClose, channel, hid, timezone, action, existingKeys, onOpenEditor, onSaved }) => {
  const { showToast } = useToast();
  const [saveAction, { isLoading: saving }] = useSaveAiAgentActionMutation();
  const [testAction, { isLoading: testing }] = useTestAiAgentActionMutation();
  const isNew = !action;
  const [form, setForm] = useState(() => (action ? { ...toForm(action.draft, timezone), key: action.key, intentGroup: action.draft.intentGroup || "", examples: action.draft.examples || [] } : blankApi(timezone)));
  const [step, setStep] = useState(1);
  const [requestTab, setRequestTab] = useState("headers");
  const [curlOpen, setCurlOpen] = useState(false);
  const [curlText, setCurlText] = useState("");
  const [curlError, setCurlError] = useState("");
  const [exampleTexts, setExampleTexts] = useState(() => (form.examples || []).map(exampleToText));
  const [showErrors, setShowErrors] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [savedId, setSavedId] = useState(action?.id || null);
  const [savedAt, setSavedAt] = useState(action?.updatedAt);
  const [live, setLive] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const http = form.executor.http;
  const { base, params } = splitUrl(http.url);
  const key = form.key || keyFromName(form.name || "");
  const toolName = toolNameFor(key || "action", form.intentGroup);
  const sensitivity = sensitivityOf(form);
  const missingVars = placeholdersIn(http).filter((name) => !form.inputs.some((i) => i.name === name));
  const examples = exampleTexts.map(textToExample).filter((e) => Object.keys(e).length);

  const errors = useMemo(() => {
    const client = validateAction({ ...form, key }, { existingKeys: existingKeys.filter((k) => k !== action?.key), isNew });
    return { ...client, ...serverErrors };
  }, [form, key, existingKeys, action, isNew, serverErrors]);
  const err = (field) => (showErrors ? errors[field] : undefined);
  const stepOneFields = ["name", "description", "confirmationText", "executor.http.url", "executor.http.bodyTemplate"];
  const stepOneHasErrors = Object.keys(errors).some((f) => stepOneFields.includes(f) || f.startsWith("executor.http"));

  const update = (patch) => { setForm((f) => ({ ...f, ...patch })); setServerErrors({}); setTestResult(null); };
  const updateHttp = (patch) => update({ executor: { ...form.executor, type: "http", http: { ...http, ...patch } } });
  const setHeader = (index, patch) => updateHttp({ headers: http.headers.map((h, i) => (i === index ? { ...h, ...patch } : h)) });
  const setParam = (index, patch) => updateHttp({ url: joinUrl(base, params.map((p, i) => (i === index ? { ...p, ...patch } : p))) });
  const setInput = (index, patch) => update({ inputs: form.inputs.map((input, i) => (i === index ? { ...input, ...patch } : input)) });
  const addInput = (name = "") => update({ inputs: [...form.inputs, { name, type: "text", required: true, description: "", enumValues: [], default: null }] });

  const applyCurl = () => {
    const parsed = parseCurl(curlText);
    if (parsed.error) return setCurlError(parsed.error);
    updateHttp({ method: parsed.method, url: parsed.url, headers: parsed.headers.length ? parsed.headers : http.headers, bodyTemplate: parsed.body, auth: { ...http.auth, ...parsed.auth } });
    setCurlOpen(false);
    setCurlText("");
    setCurlError("");
    showToast({ message: parsed.auth.type !== "none" || parsed.headers.some((h) => h.secret) ? "Request filled in. Secrets from the command are stored encrypted when you save." : "Request filled in from cURL." });
  };

  const save = async ({ thenTest = false } = {}) => {
    setShowErrors(true);
    if (Object.keys(errors).length) {
      if (stepOneHasErrors) setStep(1);
      showToast({ message: "Some fields need attention.", type: "error" });
      return null;
    }
    try {
      const payload = toPayload({ ...form, key, examples, intentGroup: cleanIntentGroup(form.intentGroup) });
      const saved = await saveAction({ channel, hid, id: savedId || undefined, action: payload, updatedAt: savedAt }).unwrap();
      setSavedId(saved.id);
      setSavedAt(saved.updatedAt);
      setForm({ ...toForm(saved.draft, timezone), key: saved.key, intentGroup: saved.draft.intentGroup || "", examples: saved.draft.examples || [] });
      onSaved?.(saved);
      if (!thenTest) {
        showToast({ message: "Action saved. Publish the agent to make it live." });
        onClose();
      }
      return saved;
    } catch (error) {
      if (error?.status === 422 && error.data?.errors) {
        setServerErrors(error.data.errors);
        if (Object.keys(error.data.errors).some((f) => stepOneFields.includes(f) || f.startsWith("executor"))) setStep(1);
      }
      showToast({ message: error?.status === 409 ? "This action changed in another session. Close and open it again." : getApiErrorMessage(error, "Could not save the action."), type: "error" });
      return null;
    }
  };

  const runTest = async () => {
    const saved = await save({ thenTest: true });
    if (!saved) return;
    try {
      const result = await testAction({ channel, hid, id: saved.id, input: examples[0] || saved.draft.sampleInput || {}, live }).unwrap();
      setTestResult(result);
    } catch (error) {
      setTestResult({ error: getApiErrorMessage(error, "The test could not run.") });
    }
  };

  const footer = (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <div>
        {!isNew && onOpenEditor && (
          <Button variant="ghost" size="sm" icon={ExternalLink} onClick={() => onOpenEditor(savedId)}>Open full editor</Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        {step === 1
          ? <Button variant="secondary" icon={ArrowRight} onClick={() => { setStep(2); if (missingVars.length && !form.inputs.length) update({ inputs: missingVars.map((name) => ({ name, type: "text", required: true, description: "", enumValues: [], default: null })) }); }}>Next: variables</Button>
          : <Button variant="secondary" icon={ArrowLeft} onClick={() => setStep(1)}>Back</Button>}
        <Button icon={Save} loading={saving && !testing} onClick={() => save()}>Save changes</Button>
      </div>
    </div>
  );

  return (
    <Dialog
      open={open}
      size="lg"
      sheetOnPhone
      onClose={onClose}
      title={<span className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-app-accent-soft text-app-accent-text" aria-hidden="true"><Workflow className="size-4" /></span>{isNew ? "Add custom action" : "Edit custom action"}</span>}
      description="Let your agent call any endpoint on your systems: your PMS, booking engine, spa software or an n8n workflow."
      footer={footer}
    >
      <ol className="mb-4 flex items-center gap-2 text-xs" aria-label="Steps">
        {["Request", "Variables & test"].map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <button type="button" onClick={() => setStep(i + 1)} aria-current={step === i + 1 ? "step" : undefined} className={`rounded-full px-2.5 py-1 font-medium ${step === i + 1 ? "bg-app-accent-soft text-app-accent-text" : "text-app-text-muted hover:text-app-text"}`}>{i + 1}. {label}</button>
            {i === 0 && <span className="h-px w-6 bg-app-border" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      {step === 1 ? (
        <div className="space-y-4">
          <Field label="Action name" error={err("name")}>
            <Input value={form.name} maxLength={80} placeholder="Order status" onChange={(e) => update({ name: e.target.value })} />
          </Field>
          <Field label="When should the agent call it?" error={err("description")} hint="The agent reads this to decide. Say when to use it, and when not to.">
            <Textarea rows={2} maxLength={1000} value={form.description} placeholder="Describe in plain language, e.g. when a guest asks where their order or booking is, look it up by its number." onChange={(e) => update({ description: e.target.value })} />
          </Field>

          <section className="rounded-xl border border-app-border! bg-app-surface-secondary/50 p-3" aria-labelledby="intent-shaping">
            <p id="intent-shaping" className="flex items-center gap-1.5 text-sm font-semibold text-app-text"><Sparkles className="size-4 text-app-accent-text" aria-hidden="true" /> Intent shaping</p>
            <p className="mb-3 text-xs text-app-text-muted">Group related endpoints under one intent. The agent sees one tool named <code className="rounded bg-app-surface px-1 font-mono text-app-text">{toolName}</code>.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Intent group" hint="Namespace for related actions, e.g. fetch_order_status.">
                <Input value={form.intentGroup} maxLength={60} placeholder="fetch_order_status" className="font-mono" onChange={(e) => update({ intentGroup: e.target.value })} onBlur={() => update({ intentGroup: cleanIntentGroup(form.intentGroup) })} />
              </Field>
              <Field label="Sensitivity" as="div" hint={SENSITIVITY.find((s) => s.value === sensitivity)?.hint}>
                <Select options={SENSITIVITY} value={sensitivity} onChange={(e) => update(applySensitivity(form, e.target.value))} aria-label="Sensitivity" />
              </Field>
            </div>
            {sensitivity !== "low" && (
              <Field label="What the agent asks first" className="mt-3" error={err("confirmationText")}>
                <Input value={form.confirmationText} maxLength={300} onChange={(e) => update({ confirmationText: e.target.value })} />
              </Field>
            )}
            <div className="mt-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium text-app-text-muted">Examples <span className="font-normal">(optional, 1–{MAX_EXAMPLES})</span></p>
                {exampleTexts.length < MAX_EXAMPLES && <Button variant="ghost" size="sm" icon={Plus} onClick={() => setExampleTexts((t) => [...t, ""])}>Add example</Button>}
              </div>
              <p className="text-xs text-app-text-faint">Add a worked example call to lift the agent's argument accuracy, e.g. <code className="font-mono">orderId=A-1001</code>.</p>
              <div className="mt-2 space-y-2">
                {exampleTexts.map((text, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={text} className="font-mono text-xs" placeholder="orderId=A-1001, date=2026-12-01" aria-label={`Example ${index + 1}`} onChange={(e) => { setExampleTexts((t) => t.map((x, i) => (i === index ? e.target.value : x))); setServerErrors({}); }} />
                    <IconButton icon={X} label={`Remove example ${index + 1}`} size="sm" onClick={() => setExampleTexts((t) => t.filter((_, i) => i !== index))} />
                  </div>
                ))}
                {err("examples") && <p className="text-xs text-red-600 dark:text-red-400">{err("examples")}</p>}
                {Object.keys(errors).filter((f) => f.startsWith("examples[")).map((f) => showErrors && <p key={f} className="text-xs text-red-600 dark:text-red-400">Example {Number(f.match(/\d+/)[0]) + 1}: {errors[f]}</p>)}
              </div>
            </div>
          </section>

          <div>
            <Button variant="secondary" size="sm" icon={ClipboardPaste} onClick={() => setCurlOpen((v) => !v)}>Paste cURL</Button>
            {curlOpen && (
              <div className="mt-2 space-y-2 rounded-lg border border-app-border! p-3">
                <Textarea rows={4} className="font-mono text-xs" value={curlText} placeholder={"curl -X GET 'https://api.example.com/orders/123' -H 'Authorization: Bearer ...'"} onChange={(e) => { setCurlText(e.target.value); setCurlError(""); }} aria-label="cURL command" />
                {curlError && <p className="text-xs text-red-600 dark:text-red-400">{curlError}</p>}
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setCurlOpen(false)}>Cancel</Button>
                  <Button size="sm" disabled={!curlText.trim()} onClick={applyCurl}>Fill in the request</Button>
                </div>
              </div>
            )}
          </div>

          <Field label="Request" as="div" error={err("executor.http.url")}>
            <div className="flex gap-2">
              <div className="w-28 shrink-0"><Select options={METHODS} value={http.method} onChange={(e) => updateHttp({ method: e.target.value })} aria-label="Method" /></div>
              <Input value={http.url} className="font-mono text-sm" placeholder="https://api.example.com/orders/{{input.orderId}}" onChange={(e) => updateHttp({ url: e.target.value })} aria-label="URL" />
            </div>
          </Field>

          <div>
            <div role="tablist" aria-label="Request details" className="flex flex-wrap gap-1 border-b border-app-border!">
              {[["headers", `Headers (${http.headers.length})`], ["params", `Params${params.length ? ` (${params.length})` : ""}`], ["auth", "Auth"], ...(http.method === "GET" ? [] : [["body", "Body"]])].map(([value, label]) => (
                <button key={value} type="button" role="tab" aria-selected={requestTab === value} className={tabClass(requestTab === value)} onClick={() => setRequestTab(value)}>{label}</button>
              ))}
            </div>
            <div className="pt-3" role="tabpanel">
              {requestTab === "headers" && (
                <div className="space-y-2">
                  {http.headers.map((header, index) => (
                    <div key={index} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto_auto] items-start gap-2">
                      <Field error={err(`executor.http.headers[${index}].name`)}><Input value={header.name} placeholder="Header" aria-label={`Header ${index + 1} name`} onChange={(e) => setHeader(index, { name: e.target.value })} /></Field>
                      <Field error={err(`executor.http.headers[${index}].value`)}><Input value={header.value} type={header.secret ? "password" : "text"} className="font-mono text-sm" placeholder={header.secret && header.hasSecret ? `${MASK} (saved; type to replace)` : "Value"} aria-label={`Header ${index + 1} value`} onChange={(e) => setHeader(index, { value: e.target.value })} /></Field>
                      <span className="flex items-center gap-1.5 pt-2 text-xs text-app-text-muted"><Switch label={`Header ${index + 1} secret`} checked={Boolean(header.secret)} onChange={(secret) => setHeader(index, { secret })} /> Secret</span>
                      <IconButton icon={X} label={`Remove header ${index + 1}`} size="sm" className="mt-1.5" onClick={() => updateHttp({ headers: http.headers.filter((_, i) => i !== index) })} />
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" icon={Plus} onClick={() => updateHttp({ headers: [...http.headers, { name: "", value: "", secret: false }] })}>Add row</Button>
                  <p className="text-xs text-app-text-faint">Secret values are stored encrypted and never shown again, not even to the AI.</p>
                </div>
              )}
              {requestTab === "params" && (
                <div className="space-y-2">
                  {params.map((param, index) => (
                    <div key={index} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto] items-center gap-2">
                      <Input value={param.key} placeholder="Key" aria-label={`Param ${index + 1} key`} onChange={(e) => setParam(index, { key: e.target.value })} />
                      <Input value={param.value} className="font-mono text-sm" placeholder="Value or {{input.name}}" aria-label={`Param ${index + 1} value`} onChange={(e) => setParam(index, { value: e.target.value })} />
                      <IconButton icon={X} label={`Remove param ${index + 1}`} size="sm" onClick={() => updateHttp({ url: joinUrl(base, params.filter((_, i) => i !== index)) })} />
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" icon={Plus} onClick={() => updateHttp({ url: joinUrl(base, [...params, { key: `param${params.length + 1}`, value: "" }]) })}>Add row</Button>
                  <p className="text-xs text-app-text-faint">Added to the URL's query string. Use <code className="font-mono">{"{{input.name}}"}</code> for a value the agent collects from the guest.</p>
                </div>
              )}
              {requestTab === "auth" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Type" as="div"><Select options={AUTH_TYPES} value={http.auth.type} onChange={(e) => updateHttp({ auth: { ...http.auth, type: e.target.value } })} aria-label="Auth type" /></Field>
                  {http.auth.type === "header" && (
                    <Field label="Header name" error={err("executor.http.auth.headerName")}><Input value={http.auth.headerName} placeholder="X-Api-Key" onChange={(e) => updateHttp({ auth: { ...http.auth, headerName: e.target.value } })} /></Field>
                  )}
                  {http.auth.type !== "none" && (
                    <Field label={http.auth.type === "bearer" ? "Token" : "Key"} error={err("executor.http.auth.token")} className="sm:col-span-2" hint="Stored encrypted. Leave empty to keep the saved one.">
                      <Input type="password" value={http.auth.token || ""} placeholder={http.auth.hasSecret ? `${MASK} (saved)` : ""} onChange={(e) => updateHttp({ auth: { ...http.auth, token: e.target.value } })} />
                    </Field>
                  )}
                </div>
              )}
              {requestTab === "body" && (
                <Field label="JSON body" error={err("executor.http.bodyTemplate")} hint="Use {{input.name}} for guest details and {{context.guestName}}, {{context.guestPhone}}, {{context.today}} for chat details.">
                  <Textarea rows={6} className="font-mono text-xs" value={http.bodyTemplate} onChange={(e) => updateHttp({ bodyTemplate: e.target.value })} />
                </Field>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <section aria-labelledby="vars-title">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p id="vars-title" className="text-sm font-semibold text-app-text">Variables the agent collects</p>
                <p className="text-xs text-app-text-muted">The agent asks the guest for these (one at a time) and puts them where you wrote <code className="font-mono">{"{{input.name}}"}</code>.</p>
              </div>
              <Button variant="ghost" size="sm" icon={Plus} onClick={() => addInput()}>Add variable</Button>
            </div>
            {missingVars.length > 0 && (
              <Notice tone="warning" className="mb-2" actions={<Button size="sm" variant="secondary" onClick={() => update({ inputs: [...form.inputs, ...missingVars.map((name) => ({ name, type: "text", required: true, description: "", enumValues: [], default: null }))] })}>Add {missingVars.length === 1 ? "it" : "them"}</Button>}>
                The request uses {missingVars.map((v) => `{{input.${v}}}`).join(", ")} but {missingVars.length === 1 ? "it isn't" : "they aren't"} a variable yet.
              </Notice>
            )}
            <div className="space-y-2">
              {form.inputs.map((input, index) => (
                <div key={index} className="grid gap-2 rounded-lg border border-app-border! p-2 sm:grid-cols-[minmax(0,1fr)_8rem_minmax(0,1.6fr)_auto_auto] sm:items-start">
                  <Field error={err(`inputs[${index}].name`)}><Input value={input.name} className="font-mono text-sm" placeholder="orderId" aria-label={`Variable ${index + 1} name`} onChange={(e) => setInput(index, { name: e.target.value })} /></Field>
                  <Select options={INPUT_TYPES.filter((t) => t.value !== "enum")} value={input.type === "enum" ? "text" : input.type} onChange={(e) => setInput(index, { type: e.target.value })} aria-label={`Variable ${index + 1} type`} />
                  <Input value={input.description} placeholder="What it is, e.g. Order number from the confirmation email" aria-label={`Variable ${index + 1} description`} onChange={(e) => setInput(index, { description: e.target.value })} />
                  <span className="flex items-center gap-1.5 pt-2 text-xs text-app-text-muted"><Switch label={`Variable ${index + 1} required`} checked={input.required} onChange={(required) => setInput(index, { required })} /> Required</span>
                  <IconButton icon={X} label={`Remove variable ${index + 1}`} size="sm" className="mt-1.5" onClick={() => update({ inputs: form.inputs.filter((_, i) => i !== index) })} />
                </div>
              ))}
              {form.inputs.length === 0 && <p className="rounded-lg border border-dashed border-app-border! px-3 py-3 text-sm text-app-text-muted">No variables. The agent calls the request as it is.</p>}
            </div>
          </section>

          <Field label="What should the agent do with the answer?" hint="e.g. Tell the guest the order status and the expected delivery date.">
            <Textarea rows={2} maxLength={1000} value={form.response.aiInstructions} onChange={(e) => update({ response: { ...form.response, aiInstructions: e.target.value } })} />
          </Field>

          <section className="rounded-xl border border-app-border! p-3" aria-labelledby="test-title">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p id="test-title" className="text-sm font-semibold text-app-text">Test the connection</p>
                <p className="text-xs text-app-text-muted">Saves, then runs the request with your first example{examples[0] ? ` (${exampleToText(examples[0])})` : ""}.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-app-text"><Switch label="Call the API for real" checked={live} onChange={setLive} /> Call for real</label>
                <Button size="sm" variant="secondary" icon={FlaskConical} loading={testing} onClick={runTest}>Save &amp; test</Button>
              </div>
            </div>
            {live && http.method !== "GET" && <p className="mt-2 text-xs text-app-warning">This is a {http.method} request: a real call may create or change data in your system.</p>}
            {testResult && (
              <div className="mt-3 space-y-1 text-xs" role="status">
                {testResult.error
                  ? <p className="flex items-center gap-2"><Badge tone="red">Failed</Badge> <span className="text-app-text">{testResult.error}</span></p>
                  : <p className="flex items-center gap-2"><Badge tone="green">{testResult.dryRun ? "Request is valid" : "Connected"}</Badge> <span className="text-app-text-muted">{testResult.dryRun ? "Dry run: nothing was sent. Turn on “Call for real” to mark it Connected." : `Answered in ${testResult.latencyMs} ms.`}</span></p>}
                {testResult.request && <pre className="max-h-40 overflow-auto rounded-lg bg-app-surface-secondary p-2 font-mono text-[11px] text-app-text">{`${testResult.request.method} ${testResult.request.url}`}{testResult.request.body ? `\n${JSON.stringify(testResult.request.body, null, 2)}` : ""}</pre>}
                {!testResult.dryRun && testResult.response && <pre className="max-h-40 overflow-auto rounded-lg bg-app-surface-secondary p-2 font-mono text-[11px] text-app-text">{JSON.stringify(testResult.response, null, 2)}</pre>}
              </div>
            )}
          </section>
          {showErrors && stepOneHasErrors && <Notice tone="warning">Step 1 has fields to fix. <button type="button" className="font-medium underline" onClick={() => setStep(1)}>Go back</button></Notice>}
        </div>
      )}
    </Dialog>
  );
};

export default CustomActionDialog;
