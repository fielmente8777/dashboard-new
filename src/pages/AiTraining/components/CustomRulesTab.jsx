import { Download, FileUp, ListChecks } from "lucide-react";
import { useRef, useState } from "react";
import Button from "../../../components/ui/Button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../../components/ui/States";
import { useConfirm } from "../../../context/ConfirmContext";
import { useToast } from "../../../context/ToastContext";
import { useApiAction } from "../../../hooks/useApiAction";
import { hasTenant } from "../../../hooks/useTenant";
import {
  useAddAiRuleMutation,
  useDeleteAiRuleMutation,
  useGetAiRulesQuery,
  useUpdateAiRuleMutation,
} from "../../../redux/api/aiTrainingApi";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { CATEGORIES } from "../constants";
import { exportRules, MAX_IMPORT_RULES, readRulesFile } from "../ruleFiles";
import AddRuleForm from "./AddRuleForm";
import RuleRow from "./RuleRow";

const chipClassName = (active) =>
  `inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium whitespace-nowrap transition-colors ${
    active
      ? "border-primary! bg-primary text-white dark:border-blue-600! dark:bg-blue-600"
      : "border-app-border! bg-app-surface text-app-text-muted hover:text-app-text"
  }`;

// A list of rules with add / edit / turn off / delete, and a filter by
// category. The WhatsApp AI rules and the Voice AI rules both use it, each
// with its own API hooks (`api`). Rules can be exported to and imported
// from a CSV / JSON file (`fileName` names the download).
export const RulesList = ({ tenant, api, intro, fileName = "ai", emptyTitle = "No rules yet" }) => {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const run = useApiAction();
  const [category, setCategory] = useState("");
  const rules = api.useRules(tenant, { skip: !hasTenant(tenant) });
  const [addRule] = api.useAdd();
  const [updateRule] = api.useUpdate();
  const [deleteRule] = api.useDelete();

  const handleAdd = (rule) =>
    run(addRule({ ...tenant, ...rule }), {
      success: "Rule added",
      error: "Could not add the rule.",
    });

  const handleSave = (id, changes) =>
    run(updateRule({ id, ...tenant, ...changes }), {
      error: "Could not save the rule.",
    });

  const handleDelete = async (rule) => {
    const confirmed = await confirm(
      `Delete the rule "${rule.ruleText}"? Your AI will stop following it.`,
      { title: "Delete rule" },
    );
    if (!confirmed) return;

    await run(deleteRule({ id: rule._id, ...tenant }), {
      success: "Rule deleted",
      error: "Could not delete the rule.",
    });
  };

  // adds every rule of the file, one at a time, and says how far it got
  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // the same file can be picked again
    if (!file) return;

    let rows;
    try {
      rows = await readRulesFile(file);
    } catch (error) {
      showToast({ message: error.message, type: "error", duration: 6000 });
      return;
    }

    const confirmed = await confirm(
      `Add ${rows.length} ${rows.length === 1 ? "rule" : "rules"} from ${file.name}? Your existing rules stay as they are.`,
      { title: "Import rules", confirmText: "Import" },
    );
    if (!confirmed) return;

    setImporting(true);
    let added = 0;
    try {
      for (const row of rows) {
        await addRule({ ...tenant, ...row }).unwrap();
        added += 1;
      }
      showToast({ message: `Imported ${added} ${added === 1 ? "rule" : "rules"}` });
    } catch (error) {
      showToast({
        message: `Imported ${added} of ${rows.length}. ${getApiErrorMessage(error, "The rest could not be added.")}`,
        type: "error",
        duration: 6000,
      });
    } finally {
      setImporting(false);
    }
  };

  if (rules.isLoading || rules.isUninitialized) {
    return <LoadingState label="Loading rules..." />;
  }

  if (rules.isError) {
    return (
      <ErrorState
        message={
          rules.error?.status === 404
            ? "This arrives with the next server update."
            : getApiErrorMessage(rules.error, "Could not load rules.")
        }
        onRetry={rules.refetch}
      />
    );
  }

  const all = rules.data;
  const shown = category ? all.filter((rule) => rule.category === category) : all;
  const countOf = (value) => all.filter((rule) => rule.category === value).length;
  const activeCount = all.filter((rule) => rule.enabled).length;

  return (
    <div className="space-y-3">
      <p className="text-sm text-app-text-muted">
        {intro}{" "}
        {all.length > 0 && (
          <span className="text-app-text">
            {activeCount} of {all.length} on.
          </span>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={FileUp}
          loading={importing}
          onClick={() => fileInputRef.current?.click()}
          title={`CSV or JSON with ruleText, category, enabled. Up to ${MAX_IMPORT_RULES} rules.`}
        >
          Import
        </Button>
        {all.length > 0 && (
          <>
            <Button variant="ghost" size="sm" icon={Download} onClick={() => exportRules(all, fileName, "csv")} disabled={importing}>
              Export CSV
            </Button>
            <Button variant="ghost" size="sm" icon={Download} onClick={() => exportRules(all, fileName, "json")} disabled={importing}>
              JSON
            </Button>
          </>
        )}
        <input ref={fileInputRef} type="file" accept=".csv,.json,text/csv,application/json" hidden onChange={handleImport} />
      </div>

      {all.length > 0 && (
        <div className="hide-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          <button type="button" aria-pressed={!category} onClick={() => setCategory("")} className={chipClassName(!category)}>
            All <span className="tabular-nums opacity-70">{all.length}</span>
          </button>
          {CATEGORIES.filter((c) => countOf(c.value) > 0).map((c) => (
            <button
              key={c.value}
              type="button"
              aria-pressed={category === c.value}
              onClick={() => setCategory(c.value)}
              className={chipClassName(category === c.value)}
            >
              {c.label} <span className="tabular-nums opacity-70">{countOf(c.value)}</span>
            </button>
          ))}
        </div>
      )}

      {all.length === 0 && <EmptyState icon={ListChecks} title={emptyTitle} />}

      {shown.map((rule) => (
        <RuleRow key={rule._id} rule={rule} onSave={handleSave} onDelete={handleDelete} />
      ))}

      <AddRuleForm onAdd={handleAdd} />
    </div>
  );
};

const WHATSAPP_RULES = {
  useRules: useGetAiRulesQuery,
  useAdd: useAddAiRuleMutation,
  useUpdate: useUpdateAiRuleMutation,
  useDelete: useDeleteAiRuleMutation,
};

const CustomRulesTab = ({ tenant }) => (
  <RulesList
    tenant={tenant}
    api={WHATSAPP_RULES}
    fileName="whatsapp"
    emptyTitle="No custom rules yet"
    intro="Rules that shape how your AI replies on WhatsApp and on your website chat: tone, policy, what not to say. Turned-off rules stay saved but don't apply."
  />
);

export default CustomRulesTab;
