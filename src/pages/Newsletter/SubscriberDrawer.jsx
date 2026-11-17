import { useEffect, useState } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { Field, Input } from "../../components/ui/Field";
import Switch from "../../components/ui/Switch";
import TagInput from "../../components/ui/TagInput";
import { useToast } from "../../context/ToastContext";
import { newsletterError, useEditSubscriberMutation } from "../../redux/api/newsletterApi";
import { SOURCE_LABELS, formatDate } from "./newsletterUtils";

const Row = ({ label, children }) => (
  <div className="flex justify-between gap-4 py-2 text-sm">
    <dt className="text-app-text-muted">{label}</dt>
    <dd className="text-right text-app-text">{children}</dd>
  </div>
);

// One subscriber: name, tags and whether they get newsletters.
export default function SubscriberDrawer({ subscriber, onClose, knownTags }) {
  const { showToast } = useToast();
  const [edit, { isLoading: saving }] = useEditSubscriberMutation();
  const [name, setName] = useState("");
  const [tags, setTags] = useState([]);

  useEffect(() => {
    setName(subscriber?.name || "");
    setTags(subscriber?.tags || []);
  }, [subscriber?.id, subscriber?.name, subscriber?.tags]);

  if (!subscriber) return null;
  const optedOut = subscriber.status === "unsubscribed" && subscriber.unsubscribedBy === "subscriber";
  const changed = name.trim() !== (subscriber.name || "") || JSON.stringify(tags) !== JSON.stringify(subscriber.tags);

  const save = async (changes, message) => {
    try {
      await edit({ id: subscriber.id, ...changes }).unwrap();
      showToast({ message });
    } catch (error) {
      showToast({ message: newsletterError(error), type: "error" });
    }
  };

  return (
    <Drawer open title={subscriber.name || subscriber.email} description={subscriber.name ? subscriber.email : undefined} onClose={onClose}>
      <div className="space-y-6">
        <section className="flex items-start justify-between gap-4 rounded-xl border border-app-border! p-4">
          <div>
            <p className="text-sm font-medium text-app-text">Gets your newsletters</p>
            <p className="mt-0.5 text-xs text-app-text-muted">
              {optedOut
                ? "They unsubscribed themselves, so only they can sign up again (from your website)."
                : subscriber.status === "subscribed"
                  ? "Turn off to stop sending them newsletters and campaigns."
                  : "You unsubscribed them. Turn on to send them newsletters again."}
            </p>
          </div>
          <Switch
            label="Gets your newsletters"
            checked={subscriber.status === "subscribed"}
            disabled={optedOut || saving}
            onChange={(on) =>
              save({ status: on ? "subscribed" : "unsubscribed" }, on ? "Subscribed again" : "Unsubscribed")
            }
          />
        </section>

        <section className="space-y-4">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="Optional" />
          </Field>
          <Field as="div" label="Groups" hint={knownTags.length ? `Your groups: ${knownTags.slice(0, 8).join(", ")}` : "e.g. Past guests, Corporate, Weddings"}>
            <TagInput value={tags} onChange={setTags} placeholder="Add a group and press Enter" />
          </Field>
          <Button
            disabled={!changed}
            loading={saving}
            onClick={() => save({ name: name.trim() || null, tags }, "Saved")}
          >
            Save
          </Button>
        </section>

        {Object.keys(subscriber.fields || {}).length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-app-text-muted">From the imported file</h3>
            <dl className="divide-y divide-app-border rounded-xl border border-app-border! px-4">
              {Object.entries(subscriber.fields).map(([key, value]) => (
                <Row key={key} label={key}>
                  <span className="break-words">{value}</span>
                </Row>
              ))}
            </dl>
          </section>
        )}

        <dl className="divide-y divide-app-border rounded-xl border border-app-border! px-4">
          <Row label="Status">
            {subscriber.status === "subscribed" ? (
              <Badge tone="green">Subscribed</Badge>
            ) : (
              <Badge tone={optedOut ? "red" : "amber"}>{optedOut ? "Opted out" : "Unsubscribed by you"}</Badge>
            )}
          </Row>
          <Row label="Joined from">{SOURCE_LABELS[subscriber.source] || subscriber.source}</Row>
          <Row label="Joined on">{formatDate(subscriber.subscribedAt)}</Row>
          {subscriber.unsubscribedAt && <Row label="Unsubscribed on">{formatDate(subscriber.unsubscribedAt)}</Row>}
          {subscriber.unsubscribeReason && <Row label="Why">{subscriber.unsubscribeReason}</Row>}
        </dl>
      </div>
    </Drawer>
  );
}
