import { ListChecks } from "lucide-react";
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
import AddRuleForm from "./AddRuleForm";
import RuleRow from "./RuleRow";

const CustomRulesTab = ({ tenant }) => {
  const { confirm } = useConfirm();
  const run = useApiAction();
  const rules = useGetAiRulesQuery(tenant, { skip: !hasTenant(tenant) });
  const [addRule] = useAddAiRuleMutation();
  const [updateRule] = useUpdateAiRuleMutation();
  const [deleteRule] = useDeleteAiRuleMutation();

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
        message={getApiErrorMessage(rules.error, "Could not load rules.")}
        onRetry={rules.refetch}
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-app-text-muted">
        Rules that shape how your AI replies on WhatsApp — tone, policy, what
        not to say. Turned off rules stay saved but don&apos;t apply.
      </p>

      {rules.data.length === 0 && (
        <EmptyState icon={ListChecks} title="No custom rules yet" />
      )}

      {rules.data.map((rule) => (
        <RuleRow
          key={rule._id}
          rule={rule}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      ))}

      <AddRuleForm onAdd={handleAdd} />
    </div>
  );
};

export default CustomRulesTab;
