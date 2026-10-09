import { Plus } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button";
import { Input, Select } from "../../../components/ui/Field";
import { CATEGORIES, DEFAULT_CATEGORY } from "../constants";

// onAdd(rule) resolves truthy when the rule was created.
const AddRuleForm = ({ onAdd }) => {
  const [ruleText, setRuleText] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [adding, setAdding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setAdding(true);
    const added = await onAdd({
      ruleText: ruleText.trim(),
      category,
      enabled: true,
    });
    setAdding(false);

    if (added) {
      setRuleText("");
      setCategory(DEFAULT_CATEGORY);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-dashed border-app-border! p-4"
    >
      <p className="mb-3 text-sm font-medium text-app-text">Add rule</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={CATEGORIES}
          aria-label="Category"
          className="sm:w-48"
        />
        <Input
          value={ruleText}
          onChange={(e) => setRuleText(e.target.value)}
          placeholder='e.g. "Always mention Mandrem alongside Serenity and Paradiso"'
          aria-label="Rule"
          className="sm:flex-1"
        />
        <Button
          type="submit"
          icon={Plus}
          loading={adding}
          disabled={!ruleText.trim()}
        >
          Add
        </Button>
      </div>
    </form>
  );
};

export default AddRuleForm;
