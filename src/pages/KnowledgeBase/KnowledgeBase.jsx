import EditableKnowledgeBase from "./components/EditableKnowledgeBase";
import IntakeStep from "./components/IntakeStep";
import SavedListStep from "./components/SavedListStep";
import { useKnowledgeBase } from "./hooks/useKnowledgeBase";

// list -> intake -> edit. The steps and their state live in useKnowledgeBase.
const KnowledgeBase = () => {
  const { phase, list, intake, editor, actions } = useKnowledgeBase();

  if (phase === "intake") {
    return (
      <IntakeStep
        intake={intake.values}
        setIntake={intake.setValues}
        generating={intake.generating}
        error={intake.error}
        onGenerate={actions.generate}
        onBack={actions.backToList}
      />
    );
  }

  if (phase === "edit") {
    return (
      <EditableKnowledgeBase
        kb={editor.kb}
        setKb={editor.setKb}
        savedId={editor.savedId}
        updatedAt={editor.updatedAt}
        saving={editor.saving}
        onSave={actions.save}
        onStartOver={actions.startOver}
        onBack={actions.backToList}
      />
    );
  }

  return (
    <SavedListStep
      items={list.items}
      loading={list.loading}
      error={list.error}
      openingId={list.openingId}
      onRetry={list.refetch}
      onEdit={actions.edit}
      onDelete={actions.remove}
      onCreateNew={actions.startOver}
    />
  );
};

export default KnowledgeBase;
