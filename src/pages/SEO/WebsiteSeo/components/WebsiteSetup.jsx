import { AlertTriangle, Globe, Lock } from "lucide-react";
import { useState } from "react";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import { Field, Input } from "../../../../components/ui/Field";
import Icon from "../../../../components/ui/Icon";

// "https://www.site.com/page" -> "www.site.com/page"
const cleanUrl = (value) => value.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
const looksLikeDomain = (value) => /^[^\s/]+\.[^\s/]{2,}/.test(value);

// First visit: pick the website whose Google rankings are tracked.
const WebsiteSetup = ({ onLock, saving }) => {
  const [url, setUrl] = useState("");
  const [touched, setTouched] = useState(false);
  const cleaned = cleanUrl(url);
  const valid = looksLikeDomain(cleaned);

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (valid) onLock(cleaned);
  };

  return (
    <Card>
      <form onSubmit={submit} className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
          <Icon icon={Globe} size="2xl" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-app-text">Which website should we track?</h2>
          <p className="mt-1 max-w-md text-sm text-app-text-muted">
            We'll check where it ranks on Google for the keywords you add.
          </p>
        </div>

        <div className="w-full max-w-md text-left">
          <Field
            label="Website"
            error={touched && !valid ? "Enter a domain, like yourhotel.com" : undefined}
          >
            <Input
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="yourhotel.com"
              inputMode="url"
            />
          </Field>
        </div>

        <p className="flex max-w-md items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-left text-xs text-amber-700 dark:text-amber-300">
          <Icon icon={AlertTriangle} size="sm" className="mt-px" />
          The website is locked once saved and can't be changed later, so
          double-check it.
        </p>

        <Button type="submit" icon={Lock} loading={saving} disabled={!cleaned}>
          Lock website
        </Button>
      </form>
    </Card>
  );
};

export default WebsiteSetup;
