import { BellRing, Code2, Link2, MailOpen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CodeBlock from "../../components/ui/CodeBlock";
import { Field, Input, Textarea } from "../../components/ui/Field";
import SaveBar from "../../components/ui/SaveBar";
import SettingsCard from "../../components/ui/SettingsCard";
import { ErrorState, Skeleton } from "../../components/ui/States";
import Switch from "../../components/ui/Switch";
import { API_URLS } from "../../config/env";
import { useToast } from "../../context/ToastContext";
import {
  newsletterError,
  useGetNewsletterSettingsQuery,
  useSaveNewsletterSettingsMutation,
} from "../../redux/api/newsletterApi";
import { PAGES, dashboardPath } from "../../routes/paths";

const fill = (text, hotel) =>
  text.replace(/\{\{\s*name\s*\}\}/gi, "Asha").replace(/\{\{\s*hotel\s*\}\}/gi, hotel || "your hotel");

// For a website not built on Eazotel: a newsletter box that signs people up to this list.
const snippet = (apiUrl) => `<form id="ez-newsletter">
  <input type="email" name="email" placeholder="Your email" required>
  <button type="submit">Subscribe</button>
  <p id="ez-newsletter-msg" role="status"></p>
</form>
<script>
document.getElementById("ez-newsletter").addEventListener("submit", async function (e) {
  e.preventDefault();
  var msg = document.getElementById("ez-newsletter-msg");
  try {
    var res = await fetch("${apiUrl}/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site: location.hostname, email: this.email.value })
    });
    var body = await res.json();
    msg.textContent = body.success ? "Thank you for subscribing!" : body.error.message;
    if (body.success) this.reset();
  } catch (err) {
    msg.textContent = "Something went wrong. Please try again.";
  }
});
</script>`;

// Signup & welcome: the welcome email, the "new subscriber" alert, and the website box.
export default function NewsletterSettings() {
  const { showToast } = useToast();
  const hotelName = useSelector((state) => state.userProfile.user?.Profile?.hotelName);
  const settings = useGetNewsletterSettingsQuery();
  const [save, { isLoading: saving }] = useSaveNewsletterSettingsMutation();
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (settings.data) setDraft({ welcome: settings.data.welcome, notifyOnSignup: settings.data.notifyOnSignup });
  }, [settings.data]);

  const saved = settings.data && { welcome: settings.data.welcome, notifyOnSignup: settings.data.notifyOnSignup };
  const dirty = Boolean(draft && saved && JSON.stringify(draft) !== JSON.stringify(saved));
  // the server that takes signups now (gian); the same path works on gian-new later
  const code = useMemo(() => snippet(API_URLS.node), []);

  if (settings.isError) {
    return <ErrorState message={newsletterError(settings.error, "Could not load the settings.")} onRetry={settings.refetch} />;
  }
  if (!draft) return <Skeleton className="h-72 rounded-xl" />;

  const setWelcome = (changes) => setDraft((d) => ({ ...d, welcome: { ...d.welcome, ...changes } }));
  const welcomeInvalid = draft.welcome.enabled && (!draft.welcome.subject.trim() || !draft.welcome.message.trim());

  const onSave = async () => {
    try {
      await save(draft).unwrap();
      showToast({ message: "Settings saved" });
    } catch (error) {
      showToast({ message: newsletterError(error), type: "error" });
    }
  };

  return (
    <div className="space-y-4">
      <SettingsCard
        icon={MailOpen}
        title="Welcome email"
        description="Sent once to everyone who signs up on your website."
        actions={
          <Switch
            label="Send a welcome email"
            checked={draft.welcome.enabled}
            onChange={(enabled) => setWelcome({ enabled })}
          />
        }
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <Field label="Subject">
              <Input
                value={draft.welcome.subject}
                onChange={(e) => setWelcome({ subject: e.target.value })}
                maxLength={200}
                disabled={!draft.welcome.enabled}
              />
            </Field>
            <Field
              label="Message"
              hint="{{name}} becomes the subscriber's name (or “there”), {{hotel}} your hotel's name. A blank line starts a new paragraph."
            >
              <Textarea
                rows={9}
                value={draft.welcome.message}
                onChange={(e) => setWelcome({ message: e.target.value })}
                maxLength={5000}
                disabled={!draft.welcome.enabled}
              />
            </Field>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-app-text-muted">Preview</p>
            <div className="rounded-xl border border-app-border! bg-app-surface-secondary/50 p-4 text-sm">
              <p className="border-b border-app-border! pb-2 font-semibold text-app-text">
                {fill(draft.welcome.subject, hotelName)}
              </p>
              <div className="space-y-3 whitespace-pre-line pt-3 leading-relaxed text-app-text">
                {fill(draft.welcome.message, hotelName)
                  .split(/\n{2,}/)
                  .map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
              </div>
              {settings.data.unsubscribeLinks && (
                <p className="mt-4 text-xs text-app-text-faint">
                  You&apos;re getting this because you subscribed on {hotelName || "our"}&apos;s website.{" "}
                  <span className="underline">Unsubscribe</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        icon={BellRing}
        title="Tell me about new subscribers"
        description="Email your hotel address and the account owner each time someone signs up on the website."
        actions={
          <Switch
            label="Email me about new subscribers"
            checked={draft.notifyOnSignup}
            onChange={(notifyOnSignup) => setDraft((d) => ({ ...d, notifyOnSignup }))}
          />
        }
      />

      <SettingsCard
        icon={Link2}
        title="Unsubscribe links"
        description={
          settings.data.unsubscribeLinks
            ? "On. Every newsletter, campaign and welcome email has its own unsubscribe link, and mail apps show their Unsubscribe button. People who unsubscribe are never emailed again."
            : "Not switched on yet for your account. Until then, tell people in each email how to opt out. Contact Eazotel support to switch them on."
        }
      />

      <SettingsCard
        icon={Code2}
        title="Newsletter box on your website"
        description="Websites built on Eazotel already have it in the footer: signups land on this list on their own."
      >
        <div className="space-y-3 text-sm text-app-text-muted">
          <p>
            Change the text next to the box in{" "}
            <Link to={dashboardPath(PAGES.CMS_PROFILE)} className="text-blue-500 hover:underline">
              Website → Profile and links
            </Link>{" "}
            (“Newsletter text”).
          </p>
          <p>Another website (WordPress, Wix, your own)? Paste this where the box should appear:</p>
          <CodeBlock code={code} title="HTML" />
        </div>
      </SettingsCard>

      <SaveBar
        show={dirty}
        saving={saving}
        disabled={welcomeInvalid}
        message={welcomeInvalid ? "The welcome email needs a subject and a message." : undefined}
        onSave={onSave}
        onDiscard={() => setDraft(saved)}
      />
    </div>
  );
}
