import { Mail, Pencil } from "lucide-react";
import { useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { Field, Input } from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";
import SettingsCard from "../../../components/ui/SettingsCard";
import { useApiAction } from "../../../hooks/useApiAction";
import { useUpdateMarketingEmailMutation } from "../../../redux/api/profileApi";
import { EMAIL_REGEX } from "../../EmailMarketing/emailUtils";

const FORM_ID = "marketing-email-form";

// The address email campaigns go out under (guests' replies land there).
// Not set = campaigns use the hotel email from the profile.
const MarketingEmail = ({ id, profile, onSaved }) => {
  const run = useApiAction();
  const [save, { isLoading }] = useUpdateMarketingEmailMutation();
  const saved = profile.marketingEmail || "";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(saved);
  const [error, setError] = useState("");

  const start = () => {
    setDraft(saved);
    setError("");
    setEditing(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    const email = draft.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) return setError("Enter a valid email address.");
    if (email === saved) return setEditing(false);

    const response = await run(save(email), {
      success: "Marketing email saved",
      error: "Could not save the marketing email.",
    });
    if (!response) return;
    onSaved?.(response?.result?.marketingEmail || email);
    setEditing(false);
  };

  return (
    <SettingsCard
      id={id}
      icon={Mail}
      title="Marketing email"
      description="Email campaigns are sent under this address, and guests' replies come to it."
      footer={
        editing ? (
          <>
            <span>Guests see this address as the sender.</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditing(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" form={FORM_ID} size="sm" loading={isLoading}>
              Save
            </Button>
          </>
        ) : (
          <>
            <span>
              {saved ? "Replies to campaigns arrive here." : "Not set: campaigns use your hotel email."}
            </span>
            <Button variant="secondary" size="sm" icon={Pencil} onClick={start}>
              {saved ? "Change" : "Add address"}
            </Button>
          </>
        )
      }
    >
      {editing ? (
        <form id={FORM_ID} onSubmit={submit} className="max-w-md">
          <Field error={error}>
            <Input
              type="email"
              autoFocus
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setError("");
              }}
              placeholder="offers@yourhotel.com"
              disabled={isLoading}
            />
          </Field>
        </form>
      ) : (
        <div className="flex min-w-0 items-center gap-3 rounded-lg border border-app-border! px-3 py-2.5">
          <Icon icon={Mail} size="sm" tone="muted" />
          <span className="min-w-0 flex-1 truncate text-sm text-app-text">
            {saved || profile.hotelEmail || (
              <span className="text-app-text-faint">No email address yet</span>
            )}
          </span>
          {saved ? (
            <Badge tone="green">Custom</Badge>
          ) : (
            profile.hotelEmail && <Badge>Hotel email</Badge>
          )}
        </div>
      )}
    </SettingsCard>
  );
};

export default MarketingEmail;
