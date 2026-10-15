import { ArrowLeft, ArrowRight, Rocket } from "lucide-react";
import { useState } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { ErrorState, Skeleton } from "../../components/ui/States";
import InstallSection from "./components/InstallSection";
import QuestionsSection from "./components/QuestionsSection";
import StepTabs from "./components/StepTabs";
import {
  AppearanceSection,
  MessagesSection,
  ProfileSection,
} from "./components/SettingsSections";
import WidgetPreview from "./components/WidgetPreview";
import { validateStep } from "./eazbotUtils";
import { useEazbot } from "./hooks/useEazbot";

// Set up in order; everything is published together after the questions,
// then the install code is shown.
const STEPS = [
  { key: "profile", label: "Profile", description: "How the bot introduces itself." },
  { key: "appearance", label: "Appearance", description: "Match the chat widget to your brand." },
  { key: "messages", label: "Messages", description: "What the bot says and how it behaves." },
  { key: "questions", label: "Questions", description: "What the bot asks to capture a lead." },
  { key: "install", label: "Install", description: "Add the chat widget to your website." },
];
const PUBLISH_STEP = STEPS.findIndex((s) => s.key === "questions");
const INSTALL_STEP = STEPS.length - 1;

const Eazobot = () => {
  const bot = useEazbot();
  const { form } = bot;
  const [step, setStep] = useState(0);
  // furthest step the user may jump to; a published bot can open any step
  const [reached, setReached] = useState(0);
  const [errors, setErrors] = useState({});

  if (bot.bot.isError) {
    return (
      <div>
        <ErrorState message="Could not load your chatbot." onRetry={bot.bot.refetch} />
      </div>
    );
  }

  if (bot.bot.isLoading || bot.bot.isUninitialized) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12" />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const reachable = bot.isNew ? reached : INSTALL_STEP;
  const current = STEPS[step];

  const setField = (key, value) => {
    bot.setField(key, value);
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const goTo = (index) => {
    setErrors({});
    setStep(index);
    setReached((prev) => Math.max(prev, index));
  };

  const next = () => {
    const stepErrors = validateStep(current.key, form);
    setErrors(stepErrors);
    if (!Object.keys(stepErrors).length) goTo(step + 1);
  };

  // checks every step first, then publishes the whole draft
  const publish = async () => {
    for (let index = 0; index < PUBLISH_STEP; index += 1) {
      const stepErrors = validateStep(STEPS[index].key, form);
      if (Object.keys(stepErrors).length) {
        setStep(index);
        setErrors(stepErrors);
        return;
      }
    }
    const published = await bot.save();
    if (published) goTo(INSTALL_STEP);
  };

  const isPublishStep = step === PUBLISH_STEP;
  const busy = bot.isSaving || bot.isUploading;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-app-text">
            Eazbot
            {bot.isNew ? (
              <Badge>Not published</Badge>
            ) : form.active ? (
              <Badge tone="green">Live on website</Badge>
            ) : (
              <Badge>Hidden</Badge>
            )}
          </h2>
          <p className="text-xs text-app-text-muted">
            The chat widget that greets website visitors and turns them into leads.
          </p>
        </div>
      </div>

      <StepTabs
        steps={STEPS}
        current={step}
        reachable={reachable}
        onSelect={goTo}
        showProgress={bot.isNew}
      />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="min-w-0" title={current.label} description={current.description}>
          {current.key === "profile" && (
            <ProfileSection
              form={form}
              setField={setField}
              onAvatar={bot.uploadAvatar}
              isUploading={bot.isUploading}
              errors={errors}
            />
          )}
          {current.key === "appearance" && <AppearanceSection form={form} setField={setField} />}
          {current.key === "messages" && (
            <MessagesSection form={form} setField={setField} errors={errors} />
          )}
          {current.key === "questions" && (
            <QuestionsSection
              flow={form.chat_flow}
              setQuestion={bot.setQuestion}
              setOption={bot.setOption}
              addOption={bot.addOption}
              removeOption={bot.removeOption}
            />
          )}
          {current.key === "install" && <InstallSection tenant={bot.tenant} />}

          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-app-border! pt-4">
            {step > 0 && (
              <Button variant="secondary" icon={ArrowLeft} onClick={() => goTo(step - 1)} disabled={busy}>
                Back
              </Button>
            )}

            <div className="ml-auto flex flex-wrap items-center gap-2">
              {/* a published bot can be updated from any step */}
              {!bot.isNew && bot.isDirty && (
                <Button variant="ghost" onClick={bot.discard} disabled={busy}>
                  Discard changes
                </Button>
              )}
              {!bot.isNew && bot.isDirty && !isPublishStep && (
                <Button variant="secondary" icon={Rocket} onClick={publish} loading={bot.isSaving} disabled={bot.isUploading}>
                  Publish now
                </Button>
              )}

              {isPublishStep ? (
                <Button icon={Rocket} onClick={publish} loading={bot.isSaving} disabled={bot.isUploading}>
                  {bot.isNew ? "Publish" : "Publish changes"}
                </Button>
              ) : (
                step < INSTALL_STEP && (
                  <Button onClick={next} disabled={busy}>
                    Next
                    <ArrowRight className="size-4" />
                  </Button>
                )
              )}
            </div>
          </div>
        </Card>

        <aside className="rounded-xl border border-app-border! bg-app-surface-secondary p-4 lg:sticky lg:top-0">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-app-text-muted">
            Live preview
          </p>
          <WidgetPreview form={form} />
        </aside>
      </div>
    </div>
  );
};

export default Eazobot;
