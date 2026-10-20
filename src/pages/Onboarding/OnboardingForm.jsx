import { jwtDecode } from "jwt-decode";
import { Rocket } from "lucide-react";
import ThemeToggle from "../../components/Navbar/ThemeToggle";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import SelectMenu from "../../components/ui/SelectMenu";
import { PLACES_API_URL } from "../../config/env";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../redux/api/baseApi";
import {
  useCompleteOnboardingMutation,
  useCreateWebsiteMutation,
} from "../../redux/api/onboardingApi";
import { loadSession } from "../../redux/session";
import { selectNeedsOnboarding, setHid } from "../../redux/slice/UserSlice";
import { ROUTES } from "../../routes/paths";
import { getCookie } from "../../utils/handleCookies";
import { clearSession, getToken } from "../../utils/session";
import AuthLayout from "../Login/components/AuthLayout";

const DRAFT_KEY = "onboarding-draft";
// Set once the website has been created, so a retry after the trial step
// failed does not create a second website (same key as the onboarding site).
const WEBSITE_CREATED_KEY = "onboarding-website-created";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"].map((code) => ({
  value: code,
  label: code,
}));

// Only what the backends need to create the hotel; everything else is
// filled in later from the dashboard.
const FIELDS = [
  { name: "hotelName", label: "Hotel name", placeholder: "e.g. The Grand Palace" },
  { name: "currency", label: "Currency", options: CURRENCIES },
  { name: "hotelEmail", label: "Hotel email", type: "email", placeholder: "reservations@hotel.com" },
  { name: "hotelPhone", label: "Hotel phone", type: "tel", placeholder: "+91 98765 43210" },
  { name: "country", label: "Country", places: "countries" },
  { name: "state", label: "State", places: "states" },
  { name: "city", label: "City", places: "cities" },
  { name: "pinCode", label: "PIN / ZIP code", inputMode: "numeric" },
];

// the login token carries the account's email, so it does not need typing
const tokenEmail = () => {
  try {
    return jwtDecode(getToken())?.Email || "";
  } catch {
    return "";
  }
};

const loadDraft = () => {
  const empty = {
    ...Object.fromEntries(FIELDS.map((field) => [field.name, ""])),
    currency: "INR",
    hotelEmail: tokenEmail(),
  };
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY)) || {};
    // only the fields of this form, and blanks keep their defaults
    const filled = Object.fromEntries(
      Object.entries(draft).filter(([name, value]) => name in empty && value),
    );
    return { ...empty, ...filled };
  } catch {
    return empty;
  }
};

const validate = (form) => {
  const errors = {};
  FIELDS.forEach(({ name, label }) => {
    if (!String(form[name]).trim()) errors[name] = `${label} is required`;
  });
  if (form.hotelEmail && !EMAIL_RE.test(form.hotelEmail.trim())) {
    errors.hotelEmail = "Enter a valid email address";
  }
  if (form.hotelPhone && form.hotelPhone.replace(/\D/g, "").length < 7) {
    errors.hotelPhone = "Enter a valid phone number";
  }
  return errors;
};

// Resolves with the list at `path`, or [] when it cannot be loaded.
const loadPlaces = async (path, body) => {
  try {
    const response = await fetch(`${PLACES_API_URL}${path}`, {
      method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    return (await response.json())?.data || [];
  } catch {
    return [];
  }
};

// Country, state and city lists. Each is null while loading and [] when the
// places API has nothing for it (then the field becomes a text box).
const usePlaces = (country, state) => {
  const [countries, setCountries] = useState(null);
  const [states, setStates] = useState(null);
  const [cities, setCities] = useState(null);

  useEffect(() => {
    loadPlaces("").then((list) => setCountries(list.map((item) => item.country)));
  }, []);

  useEffect(() => {
    setStates(null);
    if (!country) return undefined;

    let current = true;
    loadPlaces("/states", { country }).then((data) => {
      if (current) setStates((data.states || []).map((item) => item.name));
    });
    return () => {
      current = false;
    };
  }, [country]);

  useEffect(() => {
    setCities(null);
    if (!country || !state) return undefined;

    let current = true;
    loadPlaces("/state/cities", { country, state }).then((list) => {
      if (current) setCities(list);
    });
    return () => {
      current = false;
    };
  }, [country, state]);

  return { countries, states, cities };
};

// Shown to every signed-in account that has no hotel yet (see ProtectedRoute).
// Creates the website and hotel profile, starts the free trial, then opens
// the dashboard.
const OnboardingForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const needsOnboarding = useSelector(selectNeedsOnboarding);
  const [createWebsite] = useCreateWebsiteMutation();
  const [completeOnboarding] = useCompleteOnboardingMutation();

  const [form, setForm] = useState(loadDraft);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState("");
  const places = usePlaces(form.country, form.state);

  // keep a draft so a refresh or an expired session does not lose the form
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  if (!getCookie("token")) return <Navigate to={ROUTES.LOGIN} replace />;

  // already has a hotel (and is not half-way through this form)
  if (
    needsOnboarding === false &&
    !submitting &&
    !localStorage.getItem(WEBSITE_CREATED_KEY)
  ) {
    return <Navigate to={ROUTES.ROOT} replace />;
  }

  const setValue = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // a new country has its own states and cities
      ...(name === "country" && { state: "", city: "" }),
      ...(name === "state" && { city: "" }),
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const finish = async () => {
    if (!localStorage.getItem(WEBSITE_CREATED_KEY)) {
      setSubmitting("Creating your website...");
      const website = await createWebsite(form).unwrap();
      if (!website?.Status) {
        throw new Error(website?.Message || "Could not create your website.");
      }
      localStorage.setItem(WEBSITE_CREATED_KEY, website.hId || "true");
    }

    setSubmitting("Starting your free trial...");
    try {
      await completeOnboarding(form).unwrap();
    } catch (error) {
      // 409: the trial already exists, nothing left to do
      if (error?.status !== 409) throw error;
    }

    setSubmitting("Opening your dashboard...");
    const hid = localStorage.getItem(WEBSITE_CREATED_KEY);
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(WEBSITE_CREATED_KEY);

    // load the new hotel before entering, so the dashboard does not send
    // the user back here
    await dispatch(loadSession({ force: true }));
    // the dashboard loads this hotel's website data on the way in
    if (hid && hid !== "true") dispatch(setHid(hid));

    showToast({ message: "Welcome to Eazotel! Your property is ready." });
    navigate(ROUTES.ROOT, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validate(form);
    setErrors(formErrors);
    if (Object.keys(formErrors).length) return;

    try {
      await finish();
    } catch (error) {
      showToast({
        message: getApiErrorMessage(
          error?.data ? error : { data: { Message: error?.message } },
          "Could not finish setting up your account. Please try again.",
        ),
        type: "error",
        duration: 5000,
      });
    } finally {
      setSubmitting("");
    }
  };

  const handleSignOut = () => {
    clearSession();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const busy = Boolean(submitting);

  const renderControl = (field) => {
    const value = form[field.name];
    const onChange = (next) => setValue(field.name, next);

    if (field.options) {
      return (
        <SelectMenu
          label={field.label}
          options={field.options}
          value={value}
          onChange={onChange}
          disabled={busy}
          className="w-full"
        />
      );
    }

    if (field.places) {
      const list = places[field.places];
      const waitingFor =
        (field.name === "state" && !form.country && "Select a country first") ||
        (field.name === "city" && !form.state && "Select a state first");

      // the places API has nothing for it: let the user type it
      if (!waitingFor && list && !list.length) {
        return (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            disabled={busy}
          />
        );
      }

      return (
        <SelectMenu
          label={field.label}
          options={(list || []).map((place) => ({ value: place, label: place }))}
          value={value}
          onChange={onChange}
          placeholder={waitingFor || (list ? `Select ${field.label.toLowerCase()}` : "Loading...")}
          disabled={busy || Boolean(waitingFor) || !list}
          searchable
          className="w-full"
        />
      );
    }

    return (
      <Input
        type={field.type || "text"}
        inputMode={field.inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={busy}
        aria-invalid={Boolean(errors[field.name])}
      />
    );
  };

  return (
    <AuthLayout
      compact
      title="Onboard your property"
      subtitle="Just the basics. You can add everything else later."
      action={
        <ThemeToggle className="text-app-text-muted! hover:bg-app-surface-secondary! hover:text-app-text!" />
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <Field
              key={field.name}
              as={field.options || field.places ? "div" : "label"}
              label={field.label}
              error={errors[field.name]}
            >
              {renderControl(field)}
            </Field>
          ))}
        </div>

        <Button
          type="submit"
          size="lg"
          icon={Rocket}
          loading={busy}
          className="w-full"
        >
          {submitting || "Complete onboarding"}
        </Button>
      </form>

      <p className="text-center text-sm text-app-text-muted">
        Signed in with the wrong account?{" "}
        <button
          type="button"
          onClick={handleSignOut}
          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Sign out
        </button>
      </p>
    </AuthLayout>
  );
};

export default OnboardingForm;
