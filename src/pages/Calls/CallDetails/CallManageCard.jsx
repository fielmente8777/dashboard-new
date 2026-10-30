import { BellRing, X } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DatePicker from "../../../components/ui/DatePicker";
import CustomDropdown from "../../../components/ui/Dropdown";
import { Field } from "../../../components/ui/Field";
import {
  GuestType,
  MasterSegregation,
  Priority,
  Property,
} from "../../../data/constant";
import { CALL_STAGES } from "../callUtils";
import { toInputValue } from "../../Leads/LeadDetails/leadDetailsUtils";

// The controls to work a call: its stage and labels, and when to follow
// up. Give it a key that changes with the saved follow-up, so it starts from
// the saved value. Actions: onUpdate(changes)  onStageChange(stage)
// onSaveFollowUp(value | null)
const CallManageCard = ({
  call,
  showProperty,
  savedFollowUp,
  saving,
  onUpdate,
  onStageChange,
  onSaveFollowUp,
}) => {
  const [followUp, setFollowUp] = useState(savedFollowUp);

  const select = (label, value, options, onChange, placeholder = "Select") => (
    <Field label={label} as="div">
      <CustomDropdown
        key={`${label}-${call.sid}-${value}`}
        label={value || placeholder}
        options={options}
        onChange={onChange}
      />
    </Field>
  );

  return (
    <Card title="Manage call" description="Stage, labels and next step">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {select("Stage", call.stage, CALL_STAGES, onStageChange)}
          {select("Priority", call.priority, Priority, (priority) =>
            onUpdate({ priority }),
          )}
          {select("Guest type", call.guestType, GuestType, (guestType) =>
            onUpdate({ guestType }),
          )}
          {select(
            "Segregation",
            call.segregation?.value,
            MasterSegregation,
            (value) => onUpdate({ segregation: { label: value, value } }),
          )}
          {showProperty &&
            select("Property", call.property, Property, (property) =>
              onUpdate({ property }),
            )}
        </div>

        <div className="rounded-lg border border-dashed border-app-border! bg-app-surface-secondary/50 p-3">
          <Field label="Follow up on" as="div">
            <DatePicker
              mode="datetime"
              timeStep={5}
              value={followUp}
              min={toInputValue(new Date())}
              onChange={setFollowUp}
            />
          </Field>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              icon={BellRing}
              loading={saving}
              disabled={!followUp || followUp === savedFollowUp}
              onClick={() => onSaveFollowUp(followUp)}
            >
              Save follow-up
            </Button>
            {savedFollowUp && (
              <Button
                size="sm"
                variant="ghost"
                icon={X}
                disabled={saving}
                onClick={() => onSaveFollowUp(null)}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CallManageCard;
