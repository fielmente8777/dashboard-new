import { Mail, Pencil } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { Field, Input } from "../../../components/ui/Field";
import { useApiAction } from "../../../hooks/useApiAction";
import { useUpdateMarketingEmailMutation } from "../../../redux/api/profileApi";
import { EMAIL_REGEX } from "../../EmailMarketing/emailUtils";

// The address email campaigns go out under (guests' replies land there).
// Not set = campaigns use the hotel email from the profile.
const MarketingEmail = ({ profile, onSaved }) => {
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
    <Card
      title="Marketing email"
      description="Email campaigns are sent under this address, and guests' replies come to it."
      actions={
        !editing && (
          <Button variant="secondary" size="sm" icon={Pencil} onClick={start}>
            {saved ? "Change" : "Add"}
          </Button>
        )
      }
    >
      {editing ? (
        <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <Field error={error} className="min-w-0 flex-1">
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
          <div className="flex gap-2">
            <Button type="submit" loading={isLoading}>
              Save
            </Button>
            <Button variant="secondary" onClick={() => setEditing(false)} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <p className="flex min-w-0 items-center gap-2 text-sm">
          <Mail className="size-4 shrink-0 text-app-text-muted" />
          {saved ? (
            <span className="truncate text-app-text">{saved}</span>
          ) : (
            <span className="min-w-0 text-app-text-muted">
              Not set. Campaigns use your hotel email
              {profile.hotelEmail && <span className="text-app-text"> {profile.hotelEmail}</span>}.
            </span>
          )}
        </p>
      )}
    </Card>
  );
};

export default MarketingEmail;
