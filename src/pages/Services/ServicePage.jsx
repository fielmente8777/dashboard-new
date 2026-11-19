import { ArrowUpRight, Check, Clock, MessageSquareHeart, Rocket, Sparkles } from "lucide-react";
import { useState } from "react";
import MarkInterestedPopup from "../../components/Popup/MarkInterestedPopup";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Icon from "../../components/ui/Icon";
import PageShell from "../../components/ui/PageShell";
import { SERVICES } from "./serviceCatalog";

// what happens after "I'm interested", the same for every service
const STEPS = [
  { icon: MessageSquareHeart, title: "Tell us", text: "Send a request from this page - it takes a few seconds." },
  { icon: Sparkles, title: "We plan it", text: "Our team gets in touch to understand your property and goals." },
  { icon: Rocket, title: "We deliver", text: "We set everything up and keep you updated on progress." },
];

const CheckItem = ({ children }) => (
  <li className="flex items-start gap-2.5 text-sm text-app-text">
    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
      <Icon icon={Check} size="xs" />
    </span>
    {children}
  </li>
);

// One EazStore service: what it is, what is included, and a button that
// sends our team an enquiry (MarkInterestedPopup). Content: serviceCatalog.js.
const ServicePage = ({ service }) => {
  const s = SERVICES[service];
  const [open, setOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState([s.name]);
  const comingSoon = s.kind === "coming-soon";

  const askForIt = () => {
    setSelectedServices([s.name]);
    setOpen(true);
  };

  const interestButton = (
    <Button size="lg" onClick={askForIt}>
      {comingSoon ? "Notify me when it's ready" : "I'm interested"}
    </Button>
  );

  return (
    <PageShell title={s.title ?? s.name} description={s.tagline} maxWidth="max-w-6xl">
      {/* overview */}
      <section className="relative overflow-hidden rounded-xl border border-app-border! bg-app-surface p-5 sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-blue-500/10 via-transparent to-violet-500/10"
        />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
            <Icon icon={s.icon} size={28} />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {comingSoon ? (
                <Badge tone="amber">
                  <Icon icon={Clock} size="xs" className="mr-1" />
                  Coming soon
                </Badge>
              ) : (
                <Badge tone="blue">Done for you</Badge>
              )}
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-app-text-muted">{s.intro}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {interestButton}
            {s.link && (
              <a
                href={s.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-app-border! bg-app-surface px-5 text-sm font-medium text-app-text hover:bg-app-surface-secondary"
              >
                {s.link.label}
                <Icon icon={ArrowUpRight} size="sm" />
              </a>
            )}
          </div>
        </div>
      </section>

      {s.platforms && (
        <Card title="We list you on" description="The booking sites your property will appear on.">
          <ul className="flex flex-wrap gap-2">
            {s.platforms.map((platform) => (
              <li
                key={platform}
                className="rounded-full border border-app-border! bg-app-surface-secondary px-3 py-1.5 text-sm font-medium text-app-text"
              >
                {platform}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {s.plans && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {s.plans.map((plan) => (
            <section
              key={plan.name}
              className={`flex flex-col rounded-xl border bg-app-surface p-5 ${
                plan.popular ? "border-blue-500! ring-1 ring-blue-500/40" : "border-app-border!"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-app-text">{plan.name}</h3>
                {plan.popular && <Badge tone="blue">Most popular</Badge>}
              </div>
              <p className="mt-3 text-2xl font-semibold text-app-text">{plan.price}</p>
              <p className="text-xs text-app-text-faint">starting from</p>
              <ul className="mt-4 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <CheckItem key={feature}>{feature}</CheckItem>
                ))}
              </ul>
              <Button
                className="mt-5 w-full"
                variant={plan.popular ? "primary" : "secondary"}
                onClick={askForIt}
              >
                Get started
              </Button>
            </section>
          ))}
        </div>
      )}

      {(s.included || s.benefits) && (
        <div className="grid gap-4 lg:grid-cols-5">
          {s.included && (
            <Card title="What's included" className={s.benefits ? "lg:col-span-3" : "lg:col-span-5"}>
              <ul className="grid gap-3 sm:grid-cols-2">
                {s.included.map((item) => (
                  <CheckItem key={item}>{item}</CheckItem>
                ))}
              </ul>
            </Card>
          )}
          {s.benefits && (
            <Card title="Why it helps" className={s.included ? "lg:col-span-2" : "lg:col-span-5"}>
              <ul className="space-y-3">
                {s.benefits.map((benefit) => (
                  <li key={benefit.title} className="rounded-lg bg-app-surface-secondary p-3">
                    <p className="text-sm font-medium text-app-text">{benefit.title}</p>
                    <p className="mt-0.5 text-xs text-app-text-muted">{benefit.text}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {!comingSoon && (
        <Card title="How it works">
          <ol className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <Icon icon={step.icon} size="md" />
                </span>
                <div>
                  <p className="text-sm font-medium text-app-text">
                    <span className="text-app-text-faint">{index + 1}. </span>
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs text-app-text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      <MarkInterestedPopup
        open={open}
        setOpen={setOpen}
        selectedServices={selectedServices}
        setSelectedServices={setSelectedServices}
      />
    </PageShell>
  );
};

export default ServicePage;
