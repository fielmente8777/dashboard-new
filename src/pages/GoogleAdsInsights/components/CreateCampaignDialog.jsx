import { MapPin, Plus, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import { Field, Input, Textarea } from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";
import Segmented from "../../../components/ui/Segmented";
import Stepper from "../../../components/ui/Stepper";
import { useToast } from "../../../context/ToastContext";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import {
  useCreateAdsCampaignMutation,
  useLazySearchAdsLocationsQuery,
} from "../../../redux/api/googleAdsApi";
import { formatCurrency } from "../googleAdsUtils";

const STEPS = ["Basics", "Where", "Keywords", "Ad", "Review"];
const LANGUAGES = [
  { value: "1000", label: "English" },
  { value: "1023", label: "Hindi" },
];
const BIDDING = [
  { value: "clicks", label: "Most clicks" },
  { value: "conversions", label: "Most enquiries" },
];
const MATCH = [
  { value: "PHRASE", label: "Phrase" },
  { value: "BROAD", label: "Broad" },
  { value: "EXACT", label: "Exact" },
];

const blank = (website) => ({
  name: "",
  dailyBudget: "",
  bidding: "clicks",
  finalUrl: website || "https://",
  locations: [],
  languageId: "1000",
  keywords: "",
  match: "PHRASE",
  headlines: ["", "", ""],
  descriptions: ["", ""],
});

const isUrl = (v) => {
  try {
    return ["http:", "https:"].includes(new URL(v).protocol);
  } catch {
    return false;
  }
};

// what is missing on each step (empty = the step is fine)
const stepProblems = (f) => {
  const kw = f.keywords.split("\n").map((k) => k.trim()).filter(Boolean);
  const h = f.headlines.map((x) => x.trim()).filter(Boolean);
  const d = f.descriptions.map((x) => x.trim()).filter(Boolean);
  return [
    [!f.name.trim() && "Name the campaign", !(Number(f.dailyBudget) > 0) && "Enter a daily budget", !isUrl(f.finalUrl) && "Enter the full website address (https://…)"],
    [!f.locations.length && "Pick at least one place"],
    [!kw.length && "Add at least one keyword", kw.length > 50 && "Up to 50 keywords", kw.some((k) => k.length > 80) && "A keyword can be up to 80 characters"],
    [
      h.length < 3 && "Write at least 3 headlines",
      f.headlines.some((x) => x.trim().length > 30) && "Headlines are up to 30 characters",
      new Set(h.map((x) => x.toLowerCase())).size !== h.length && "Headlines must be different",
      d.length < 2 && "Write at least 2 descriptions",
      f.descriptions.some((x) => x.trim().length > 90) && "Descriptions are up to 90 characters",
    ],
    [],
  ].map((list) => list.filter(Boolean));
};

const Counter = ({ value, max }) => (
  <span className={`text-[11px] tabular-nums ${value.length > max ? "text-red-500" : "text-app-text-faint"}`}>
    {value.length}/{max}
  </span>
);

const LineList = ({ label, items, max, min, limit, onChange, placeholder }) => (
  <div>
    <p className="mb-1.5 text-xs font-medium text-app-text-muted">
      {label} ({min}-{limit})
    </p>
    <div className="space-y-2">
      {items.map((text, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={text}
            placeholder={`${placeholder} ${i + 1}`}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
          />
          <Counter value={text} max={max} />
          {items.length > min && (
            <button
              type="button"
              aria-label="Remove"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="rounded-md p-1 text-app-text-muted hover:bg-app-surface-secondary"
            >
              <Icon icon={X} size="sm" />
            </button>
          )}
        </div>
      ))}
    </div>
    {items.length < limit && (
      <Button size="sm" variant="ghost" icon={Plus} className="mt-1" onClick={() => onChange([...items, ""])}>
        Add
      </Button>
    )}
  </div>
);

// How the ad can look on Google (Google mixes the headlines and descriptions).
const AdPreview = ({ form }) => {
  const host = (() => {
    try {
      return new URL(form.finalUrl).hostname.replace(/^www\./, "");
    } catch {
      return "yourwebsite.com";
    }
  })();
  const h = form.headlines.map((x) => x.trim()).filter(Boolean).slice(0, 3);
  const d = form.descriptions.map((x) => x.trim()).filter(Boolean).slice(0, 2);
  return (
    <div className="rounded-xl border border-app-border! bg-white p-4 text-left dark:bg-app-surface">
      <p className="text-xs text-gray-600 dark:text-app-text-muted">
        <span className="font-semibold text-gray-900 dark:text-app-text">Sponsored</span> · {host}
      </p>
      <p className="mt-1 text-lg leading-snug text-[#1a0dab] dark:text-blue-400">{h.join(" | ") || "Your headlines show here"}</p>
      <p className="mt-1 text-sm text-gray-700 dark:text-app-text-muted">{d.join(" ") || "Your descriptions show here."}</p>
    </div>
  );
};

// A new Google Search campaign, step by step: budget, places, keywords and
// one responsive search ad. "Check with Google" asks Google to validate it
// without creating anything; "Create" makes it PAUSED, so nothing spends until
// someone switches it on in the campaigns table.
const CreateCampaignDialog = ({ open, accountId, website, onClose }) => {
  const { showToast } = useToast();
  const [form, setForm] = useState(() => blank(website));
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState(false);
  const [placeQuery, setPlaceQuery] = useState("");
  const [findPlaces, places] = useLazySearchAdsLocationsQuery();
  const [create, { isLoading: creating }] = useCreateAdsCampaignMutation();

  useEffect(() => {
    if (!open) return;
    setForm(blank(website));
    setStep(0);
    setChecked(false);
    setPlaceQuery("");
  }, [open, website]);

  // places as you type (a short pause between letters)
  useEffect(() => {
    const q = placeQuery.trim();
    if (q.length < 2 || !accountId) return undefined;
    const t = setTimeout(() => findPlaces({ accountId, q }, true), 350);
    return () => clearTimeout(t);
  }, [placeQuery, accountId, findPlaces]);

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    setChecked(false);
  };
  const problems = useMemo(() => stepProblems(form), [form]);
  // a step can be opened once every step before it is complete
  const firstBad = problems.findIndex((p) => p.length > 0);
  const firstOpen = firstBad === -1 ? STEPS.length - 1 : firstBad;
  const keywords = form.keywords.split("\n").map((k) => k.trim()).filter(Boolean);

  const payload = () => ({
    accountId,
    name: form.name.trim(),
    dailyBudget: Number(form.dailyBudget),
    bidding: form.bidding,
    finalUrl: form.finalUrl.trim(),
    locationIds: form.locations.map((l) => l.id),
    languageId: form.languageId,
    keywords: keywords.map((text) => ({ text, match: form.match })),
    headlines: form.headlines.map((x) => x.trim()).filter(Boolean),
    descriptions: form.descriptions.map((x) => x.trim()).filter(Boolean),
  });

  const submit = async (validateOnly) => {
    try {
      await create({ campaign: payload(), validateOnly }).unwrap();
      if (validateOnly) {
        setChecked(true);
        showToast({ message: "Google accepted the campaign. You can create it now.", type: "success" });
      } else {
        showToast({ message: "Campaign created, paused. Switch it on in the campaigns table when you are ready.", type: "success" });
        onClose();
      }
    } catch (error) {
      setChecked(false);
      showToast({ message: getApiErrorMessage(error, "Google refused the campaign."), type: "error" });
    }
  };

  const current = problems[step];
  const footer = (
    <>
      {step > 0 && (
        <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={creating}>
          Back
        </Button>
      )}
      {step < STEPS.length - 1 ? (
        <Button disabled={current.length > 0} onClick={() => setStep(step + 1)}>
          Next
        </Button>
      ) : (
        <>
          <Button variant="secondary" icon={ShieldCheck} loading={creating && !checked} onClick={() => submit(true)}>
            Check with Google
          </Button>
          <Button loading={creating && checked} disabled={!checked} onClick={() => submit(false)}>
            Create campaign (paused)
          </Button>
        </>
      )}
    </>
  );

  return (
    <Dialog open={open} onClose={creating ? () => {} : onClose} title="New Search campaign" description="Shows your ad when people search on Google" size="lg" footer={footer} sheetOnPhone>
      <div className="space-y-5">
        <Stepper steps={STEPS} current={step} onSelect={setStep} reachable={firstOpen} className="overflow-x-auto" />

        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Campaign name" className="sm:col-span-2">
              <Input value={form.name} maxLength={120} placeholder="e.g. Rooms - Search - Dehradun" onChange={(e) => set({ name: e.target.value })} />
            </Field>
            <Field label="Daily budget" hint={Number(form.dailyBudget) > 0 ? `About ${formatCurrency(Number(form.dailyBudget) * 30.4)} a month` : "The average to spend each day"}>
              <Input type="number" min="1" inputMode="decimal" value={form.dailyBudget} onChange={(e) => set({ dailyBudget: e.target.value })} />
            </Field>
            <Field label="Aim for" as="div">
              <Segmented label="Bidding" options={BIDDING} value={form.bidding} onChange={(bidding) => set({ bidding })} />
            </Field>
            <Field label="Website page the ad opens" className="sm:col-span-2" error={form.finalUrl && form.finalUrl !== "https://" && !isUrl(form.finalUrl) ? "Enter the full address, starting with https://" : ""}>
              <Input type="url" value={form.finalUrl} onChange={(e) => set({ finalUrl: e.target.value })} />
            </Field>
            {form.bidding === "conversions" && (
              <p className="text-xs text-app-text-muted sm:col-span-2">
                “Most enquiries” needs conversion tracking set up in Google Ads (bookings, forms, calls). Without it, choose “Most clicks”.
              </p>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Field label="Show the ad to people in" as="div">
              <Input value={placeQuery} placeholder="Type a city, state or country" onChange={(e) => setPlaceQuery(e.target.value)} />
              {placeQuery.trim().length >= 2 && (
                <ul className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-app-border!">
                  {places.isFetching ? (
                    <li className="px-3 py-2 text-sm text-app-text-muted">Searching…</li>
                  ) : places.isError ? (
                    <li className="px-3 py-2 text-sm text-red-500">{getApiErrorMessage(places.error, "Could not search places.")}</li>
                  ) : !(places.data || []).length ? (
                    <li className="px-3 py-2 text-sm text-app-text-muted">No places found</li>
                  ) : (
                    places.data.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          disabled={form.locations.some((l) => l.id === p.id)}
                          onClick={() => {
                            set({ locations: [...form.locations, p].slice(0, 20) });
                            setPlaceQuery("");
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-app-surface-secondary disabled:opacity-50"
                        >
                          <Icon icon={MapPin} size="sm" tone="muted" />
                          <span className="min-w-0 flex-1 truncate">{p.name}</span>
                          <span className="text-xs text-app-text-faint">{p.type.toLowerCase()}</span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </Field>
            <div className="flex flex-wrap gap-2">
              {form.locations.map((l) => (
                <span key={l.id} className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                  {l.name}
                  <button type="button" aria-label={`Remove ${l.name}`} onClick={() => set({ locations: form.locations.filter((x) => x.id !== l.id) })}>
                    <Icon icon={X} size="xs" />
                  </button>
                </span>
              ))}
            </div>
            <Field label="Language of the people you want to reach" as="div">
              <Segmented label="Language" options={LANGUAGES} value={form.languageId} onChange={(languageId) => set({ languageId })} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <Field label="Keywords, one per line" hint={`${keywords.length} keyword${keywords.length === 1 ? "" : "s"} · what people type on Google`}>
              <Textarea rows={8} value={form.keywords} placeholder={"hotel in dehradun\nresort near mussoorie\nluxury stay dehradun"} onChange={(e) => set({ keywords: e.target.value })} />
            </Field>
            <Field label="Match" as="div" hint="Phrase: searches that include the meaning of your keyword (a good start). Broad: related searches too. Exact: close to the keyword only.">
              <Segmented label="Match type" options={MATCH} value={form.match} onChange={(match) => set({ match })} />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-4">
              <LineList label="Headlines" items={form.headlines} min={3} limit={15} max={30} placeholder="Headline" onChange={(headlines) => set({ headlines })} />
              <LineList label="Descriptions" items={form.descriptions} min={2} limit={4} max={90} placeholder="Description" onChange={(descriptions) => set({ descriptions })} />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-app-text-muted">Preview</p>
              <AdPreview form={form} />
              <p className="mt-2 text-[11px] text-app-text-faint">Google mixes your headlines and descriptions to find what works best. More headlines give it more to try.</p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-app-text-muted">Campaign</dt><dd className="font-medium">{form.name}</dd></div>
              <div><dt className="text-xs text-app-text-muted">Daily budget</dt><dd className="font-medium">{formatCurrency(Number(form.dailyBudget))} · {BIDDING.find((b) => b.value === form.bidding)?.label}</dd></div>
              <div><dt className="text-xs text-app-text-muted">Places</dt><dd className="font-medium">{form.locations.map((l) => l.name.split(",")[0]).join(", ")}</dd></div>
              <div><dt className="text-xs text-app-text-muted">Keywords</dt><dd className="font-medium">{keywords.length} ({form.match.toLowerCase()} match)</dd></div>
            </dl>
            <AdPreview form={form} />
            <p className="rounded-lg bg-blue-500/5 px-3 py-2 text-xs text-app-text-muted">
              <b>Check with Google</b> sends the campaign for a check without creating anything. Then <b>Create</b> makes it in your
              Google Ads account <b>paused</b>: it spends nothing until you switch it on.
            </p>
          </div>
        )}

        {current.length > 0 && step < STEPS.length - 1 && (
          <ul className="list-inside list-disc text-xs text-amber-700 dark:text-amber-300">
            {current.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
      </div>
    </Dialog>
  );
};

export default CreateCampaignDialog;
