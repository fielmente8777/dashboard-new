import { BellRing, X } from "lucide-react";
import { useState } from "react";
import {
  getFollowUpError,
  splitFollowUp,
  toFollowUpValue,
} from "../../../components/followUp";
import FollowUpFields from "../../../components/FollowUpFields";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import CustomDropdown from "../../../components/ui/Dropdown";
import { Field } from "../../../components/ui/Field";
import { Stages, TurnAwayCode } from "../../../data/constant";

// The controls to work a lead: who has it, its stage, why it was turned
// away, and when to follow up. `savedFollowUp` is the saved follow-up as a
// date picker value; give the card a key that changes with it so a new
// lead (or a saved change) starts from the saved value.
// Actions are passed in:
//   onAssign(user)  onStageChange(stage)  onTurnAway(code)  onSaveFollowUp(value | null)
const LeadManageCard = ({
  lead,
  users,
  savedFollowUp,
  saving,
  onAssign,
  onStageChange,
  onTurnAway,
  onSaveFollowUp,
}) => {
  const [followUp, setFollowUp] = useState(() =>
    splitFollowUp(savedFollowUp),
  );

  return (
    <Card title="Manage lead" description="Owner, stage and next step">
      <div className="space-y-4">
        <Field label="Attempted by" as="div">
          <CustomDropdown
            key={`assignee-${lead._id}-${lead.assignee}`}
            label={lead.assignee || "Select user"}
            options={users.map((user) => ({
              value: user.userName,
              label: user.userName,
            }))}
            onChange={(userName) =>
              onAssign(users.find((user) => user.userName === userName))
            }
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Field label="Stage" as="div">
            <CustomDropdown
              key={`stage-${lead._id}-${lead.status}`}
              label={lead.status}
              options={Stages}
              onChange={onStageChange}
            />
          </Field>
          <Field label="Turn away code" as="div">
            <CustomDropdown
              key={`code-${lead._id}-${lead.turnAwayCode}`}
              label={lead.turnAwayCode || "Select code"}
              options={TurnAwayCode}
              onChange={onTurnAway}
            />
          </Field>
        </div>

        <div className="rounded-lg border border-dashed border-app-border! bg-app-surface-secondary/50 p-3">
          <p className="mb-2 text-xs font-medium text-app-text-muted">
            Follow up on
          </p>
          <FollowUpFields value={followUp} onChange={setFollowUp} />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              icon={BellRing}
              loading={saving}
              disabled={
                Boolean(getFollowUpError(followUp)) ||
                toFollowUpValue(followUp) === savedFollowUp
              }
              onClick={() => onSaveFollowUp(toFollowUpValue(followUp))}
            >
              Save follow-up
            </Button>
            {/* a "Follow Up" lead keeps its date; moving it to another
                stage is what clears it */}
            {savedFollowUp && lead.status !== "Follow Up" && (
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

export default LeadManageCard;
