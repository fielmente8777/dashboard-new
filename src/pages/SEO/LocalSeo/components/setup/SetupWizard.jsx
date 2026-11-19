import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, MapPinned } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../../../../components/ui/Button";
import Card from "../../../../../components/ui/Card";
import Chip from "../../../../../components/ui/Chip";
import { Field, Input, Select } from "../../../../../components/ui/Field";
import Icon from "../../../../../components/ui/Icon";
import PageShell from "../../../../../components/ui/PageShell";
import Stepper from "../../../../../components/ui/Stepper";
import { useApiAction } from "../../../../../hooks/useApiAction";
import {
  useCompleteOnboardingMutation,
  useSuggestKeywordsMutation,
  useTrackKeywordsMutation,
} from "../../../../../redux/api/seoApi";
import { LOCAL_SEO_SETUP_STEPS, localSeoSetupSchema } from "../../../../../schema/localSeoSchema";
import { BUSINESS_TYPES, RADIUS_OPTIONS, seoErrorMessage } from "../../localSeoUtils";
import KeywordPicker from "./KeywordPicker";
import LocationPicker from "./LocationPicker";

const STEPS = ["Your property", "Location", "Keywords"];
const RADIUS_CHOICES = RADIUS_OPTIONS.map((r) => ({ value: String(r), label: `${r} km around you` }));

// used when the suggestion service is down
const fallbackSuggestions = ({ businessType: type, city, district }) => {
  const area = district.toLowerCase();
  return [
    `${type} in ${area}`,
    `best ${type} in ${area}`,
    `${type} near ${area}`,
    `${type} ${city.toLowerCase()}`,
    `budget ${type} ${area}`,
    `luxury ${type} ${area}`,
    `${type} near me ${city.toLowerCase()}`,
    `book ${type} ${area}`,
  ];
};

// One-time setup: property, its location, and the first keywords to track.
const SetupWizard = ({ onComplete }) => {
  const run = useApiAction();
  const [step, setStep] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState([]);

  const [suggestKeywords, { isLoading: suggesting }] = useSuggestKeywordsMutation();
  const [completeOnboarding, { isLoading: saving }] = useCompleteOnboardingMutation();
  const [trackKeywords, { isLoading: tracking }] = useTrackKeywordsMutation();

  const {
    register,
    watch,
    setValue,
    trigger,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(localSeoSetupSchema),
    defaultValues: {
      businessName: "",
      businessType: "hotel",
      selfDomain: "",
      lat: "",
      lng: "",
      radiusKm: "5",
      district: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  const values = watch();
  const set = (field, value) =>
    setValue(field, value, { shouldValidate: Boolean(errors[field]) });

  const loadSuggestions = async () => {
    const form = getValues();
    setSuggestions([]);
    try {
      setSuggestions(
        await suggestKeywords({
          businessType: form.businessType,
          city: form.city,
          district: form.district,
          state: form.state,
        }).unwrap(),
      );
    } catch {
      setSuggestions(fallbackSuggestions(form));
    }
  };

  const next = async () => {
    if (!(await trigger(LOCAL_SEO_SETUP_STEPS[step]))) return;
    if (step === 1) loadSuggestions();
    setStep(step + 1);
  };

  const finish = handleSubmit(async (form) => {
    const done = await run(
      completeOnboarding({
        businessName: form.businessName,
        selfHotelName: form.businessName,
        selfDomain: form.selfDomain,
        lat: Number(form.lat),
        lng: Number(form.lng),
        radiusKm: Number(form.radiusKm),
        city: form.city,
        district: form.district,
        state: form.state,
        pincode: form.pincode,
        primaryKeyword: selected[0],
      }),
      { error: "Setup failed. Please try again.", formatError: seoErrorMessage },
    );
    if (!done) return;

    await run(
      trackKeywords({
        keywords: selected,
        selfDomain: form.selfDomain,
        selfHotelName: form.businessName,
      }),
      {
        success: "Local SEO is set up",
        error: "Setup saved, but the keywords couldn't be added. Add them from the dashboard.",
        formatError: seoErrorMessage,
      },
    );
    onComplete();
  });

  return (
    <PageShell
      title="Set up Local SEO"
      description="A one-time setup that takes about two minutes."
      maxWidth="max-w-3xl"
    >
      <Card>
        <div className="mb-6 flex items-center gap-3">
          <span className="hidden size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 sm:flex">
            <Icon icon={MapPinned} size="xl" />
          </span>
          <Stepper steps={STEPS} current={step} className="flex-1" />
        </div>

        <div key={step} className="anim-enter">
          {step === 0 && (
            <div className="space-y-5">
              <Field
                label="Property name"
                hint="Use the exact name from your Google Business Profile."
                error={errors.businessName?.message}
              >
                <Input autoFocus placeholder="e.g. Hotel Sunrise Indirapuram" {...register("businessName")} />
              </Field>
              <Field as="div" label="Property type">
                <div className="flex flex-wrap gap-2">
                  {BUSINESS_TYPES.map((type) => (
                    <Chip
                      key={type}
                      selected={values.businessType === type}
                      onClick={() => set("businessType", type)}
                      className="capitalize"
                    >
                      {type}
                    </Chip>
                  ))}
                </div>
              </Field>
              <Field label="Website (optional)" hint="Without https://, e.g. hotelsunrise.com">
                <Input placeholder="hotelsunrise.com" {...register("selfDomain")} />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <LocationPicker
                lat={values.lat}
                lng={values.lng}
                onPick={({ lat, lng }) => {
                  set("lat", lat);
                  set("lng", lng);
                }}
                onAddress={(address) =>
                  Object.entries(address).forEach(([field, value]) => value && set(field, value))
                }
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Latitude" error={errors.lat?.message}>
                  <Input inputMode="decimal" placeholder="28.6139" {...register("lat")} />
                </Field>
                <Field label="Longitude" error={errors.lng?.message}>
                  <Input inputMode="decimal" placeholder="77.2090" {...register("lng")} />
                </Field>
                <Field label="District / area" error={errors.district?.message}>
                  <Input placeholder="e.g. Indirapuram" {...register("district")} />
                </Field>
                <Field label="City" error={errors.city?.message}>
                  <Input placeholder="e.g. Ghaziabad" {...register("city")} />
                </Field>
                <Field label="State">
                  <Input placeholder="e.g. Uttar Pradesh" {...register("state")} />
                </Field>
                <Field label="Area to track" hint="You can change this later.">
                  <Select options={RADIUS_CHOICES} {...register("radiusKm")} />
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-app-text-muted">
                Which searches should guests find you for in{" "}
                <span className="font-medium text-app-text">
                  {values.district}, {values.city}
                </span>
                ? Pick a few; the first one is used for the map.
              </p>
              <KeywordPicker
                suggestions={suggestions}
                loading={suggesting}
                selected={selected}
                onChange={setSelected}
                placeholder={`${values.businessType} near ${values.district}`}
              />
              {selected.length > 0 && (
                <p className="text-xs text-app-text-muted">
                  {selected.length} selected · map keyword:{" "}
                  <span className="font-medium text-app-text">{selected[0]}</span>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-2 border-t border-app-border! pt-4">
          {step > 0 ? (
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>
              Continue <Icon icon={ArrowRight} />
            </Button>
          ) : (
            <Button
              icon={Check}
              loading={saving || tracking}
              disabled={!selected.length}
              onClick={finish}
            >
              Finish setup
            </Button>
          )}
        </div>
      </Card>
    </PageShell>
  );
};

export default SetupWizard;
