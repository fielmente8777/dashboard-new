import { useState } from "react";
import { useToast } from "../../../context/ToastContext";
import {
  HIDDEN_FIELDS,
  isGroupValue,
  isPlainObject,
  slugifyKey,
} from "../utils/kbHelpers";
import { toSectionTab } from "../utils/sectionConfig";
import DynamicJsonEditor from "./DynamicJsonEditor";
import TabBar from "./TabBar";

const GENERAL_TAB = "__general__";

// The recursive piece. Given any value:
//  - primitive / array / flat object -> the normal DynamicJsonEditor
//  - object with at least one nested group -> a sub-tab bar: one tab per
//    group, plus a "General" tab for the plain fields next to them
// This is what turns "Rooms" into Shared Attributes / Inventory sub-tabs
// instead of one long scrolling card, at any depth.
const NestedSection = ({ value, path, onChange, onDelete }) => {
  const { showToast } = useToast();
  const [selectedKey, setSelectedKey] = useState(null);

  const entries = isPlainObject(value)
    ? Object.entries(value).filter(([key]) => !HIDDEN_FIELDS.has(key))
    : [];
  const groupEntries = entries.filter(([, v]) => isGroupValue(v));

  if (groupEntries.length === 0) {
    return (
      <DynamicJsonEditor
        value={value}
        path={path}
        onChange={onChange}
        onDelete={onDelete}
      />
    );
  }

  const leafEntries = entries.filter(([, v]) => !isGroupValue(v));
  const tabs = [
    ...(leafEntries.length > 0
      ? [{ key: GENERAL_TAB, title: "General", gapCount: 0 }]
      : []),
    ...groupEntries.map(toSectionTab),
  ];
  // stays valid when the selected tab's fields are deleted underneath it
  const activeKey = tabs.some((tab) => tab.key === selectedKey)
    ? selectedKey
    : tabs[0].key;

  const handleAddSubSection = (name) => {
    const key = slugifyKey(name);
    if (!key) return;

    if (Object.hasOwn(value, key)) {
      showToast({
        message: "A section with that name already exists",
        type: "warning",
      });
      return;
    }

    onChange([...path, key], {});
    setSelectedKey(key);
  };

  return (
    <div>
      <TabBar
        sections={tabs}
        activeKey={activeKey}
        onSelect={setSelectedKey}
        onAddSection={handleAddSubSection}
        size="sm"
      />

      {activeKey === GENERAL_TAB ? (
        <DynamicJsonEditor
          value={Object.fromEntries(leafEntries)}
          path={path}
          existingKeys={Object.keys(value)}
          onChange={onChange}
          onDelete={onDelete}
        />
      ) : (
        <NestedSection
          key={activeKey}
          value={value[activeKey]}
          path={[...path, activeKey]}
          onChange={onChange}
          onDelete={onDelete}
        />
      )}
    </div>
  );
};

export default NestedSection;
