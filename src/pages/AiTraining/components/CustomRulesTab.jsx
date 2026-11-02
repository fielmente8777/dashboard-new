import { ListChecks } from "lucide-react";
import { useState } from "react";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../../components/ui/States";
import { useConfirm } from "../../../context/ConfirmContext";
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
// with its own API hooks (`api`).
export const RulesList = ({ tenant, api, intro, emptyTitle = "No rules yet" }) => {
  const { confirm } = useConfirm();
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
    emptyTitle="No custom rules yet"
    intro="Rules that shape how your AI replies on WhatsApp and on your website chat: tone, policy, what not to say. Turned-off rules stay saved but don't apply."
  />
);

export default CustomRulesTab;
