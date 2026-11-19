import { Plus } from "lucide-react";
import { useState } from "react";
import Button from "../../../../../components/ui/Button";
import Chip from "../../../../../components/ui/Chip";
import { Input } from "../../../../../components/ui/Field";
import { Skeleton } from "../../../../../components/ui/States";

// Pick keywords from suggestions, or type your own (added and selected).
// `selected` is an array of strings.
const KeywordPicker = ({ suggestions, loading, selected, onChange, placeholder }) => {
  const [extra, setExtra] = useState([]);
  const [draft, setDraft] = useState("");
  const options = [...suggestions, ...extra.filter((k) => !suggestions.includes(k))];

  const toggle = (keyword) =>
    onChange(
      selected.includes(keyword)
        ? selected.filter((k) => k !== keyword)
        : [...selected, keyword],
    );

  const addCustom = () => {
    const keyword = draft.trim().toLowerCase();
    if (!keyword) return;
    if (!options.includes(keyword)) setExtra((list) => [...list, keyword]);
    if (!selected.includes(keyword)) onChange([...selected, keyword]);
    setDraft("");
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-32 rounded-full" />
          ))}
        </div>
      ) : (
        <div className="flex max-h-52 flex-wrap gap-2 overflow-y-auto">
          {options.map((keyword) => (
            <Chip
              key={keyword}
              selected={selected.includes(keyword)}
              onClick={() => toggle(keyword)}
            >
              {keyword}
            </Chip>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder={placeholder}
        />
        <Button variant="secondary" icon={Plus} disabled={!draft.trim()} onClick={addCustom}>
          Add
        </Button>
      </div>
    </div>
  );
};

export default KeywordPicker;
