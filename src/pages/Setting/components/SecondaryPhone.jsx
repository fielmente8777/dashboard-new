import { Pencil, Phone, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { Field, Input, Select } from "../../../components/ui/Field";
import Icon from "../../../components/ui/Icon";
import SettingsCard from "../../../components/ui/SettingsCard";
import { countriesCode } from "../../../data/constant";
import { useToast } from "../../../context/ToastContext";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import {
  useDeleteSecondaryPhoneMutation,
  useGetNodeProfileQuery,
  useLazyGetNodeProfileQuery,
  useUpdateSecondaryPhoneMutation,
} from "../../../redux/api/profileApi";

const FORM_ID = "secondary-phone-form";
const DEFAULT_COUNTRY = "IND";

// digits only ("+91 97593-49941" -> "919759349941"); the server stores this
const toDigits = (value = "") => String(value).replace(/\D/g, "").replace(/^00/, "");
const isValidPhone = (digits) => /^[1-9]\d{7,14}$/.test(digits);

// the dropdown's value is the country name: some codes (+1, +7...) are
// shared by several countries, so the code alone is not unique
const COUNTRIES = countriesCode.map((country) => ({
  ...country,
  digits: toDigits(country.code),
}));
const COUNTRY_OPTIONS = COUNTRIES.map((country) => ({
  value: country.name,
  label: `${country.name} (${country.code})`,
}));
const dialDigits = (name) => COUNTRIES.find((c) => c.name === name)?.digits || "";

// Splits a stored number ("919759349941") into { country: "IND", local:
// "9759349941" } by the longest matching country code. Unknown -> fallback.
const splitPhone = (digits, fallback = DEFAULT_COUNTRY) => {
  const match = COUNTRIES.filter((c) => c.digits && digits?.startsWith(c.digits)).sort(
    (a, b) => b.digits.length - a.digits.length,
  )[0];
  return match
    ? { country: match.name, local: digits.slice(match.digits.length) }
    : { country: fallback, local: digits || "" };
};

// The server's reason when it sent one; otherwise the fallback plus the HTTP
// status (e.g. "... (HTTP 404)"), so a failed save is never a dead end.
const describeError = (err, fallback) => {
  const message = getApiErrorMessage(err, "");
  if (message) return message;
  const status = err?.originalStatus ?? err?.status;
  return status ? `${fallback} (HTTP ${status})` : fallback;
};

// "+91 9759349941" when the code is known, otherwise "+919759349941"
const display = (digits) => {
  if (!digits) return "";
  const { country, local } = splitPhone(digits, "");
  return country ? `+${dialDigits(country)} ${local}` : `+${digits}`;
};

// An optional second number. WhatsApp lead notifications go to it as well as
// to the primary phone (hotelPhone), which stays as it is.
const SecondaryPhone = ({ id, profile, onSaved }) => {
  const { showToast } = useToast();
  const [save, { isLoading: saving }] = useUpdateSecondaryPhoneMutation();
  const [remove, { isLoading: removing }] = useDeleteSecondaryPhoneMutation();
  const [readBack, { isFetching: checking }] = useLazyGetNodeProfileQuery();
  const busy = saving || removing || checking;

  const [editing, setEditing] = useState(false);
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [local, setLocal] = useState("");
  const [error, setError] = useState("");

  // The stored number comes from gian (Zucks_profile): the core profile loaded
  // at sign-in does not carry secondaryPhone. Until gian answers, fall back to
  // whatever the dashboard already has.
  const { data: nodeProfile } = useGetNodeProfileQuery();
  const nodeDocs = nodeProfile?.result?.docs;
  const saved = (nodeDocs ? nodeDocs.secondaryPhone : profile.secondaryPhone) || "";

  // keep the rest of the page (the overview card) in step with the database
  useEffect(() => {
    if (nodeDocs && (nodeDocs.secondaryPhone || null) !== (profile.secondaryPhone || null)) {
      onSaved?.(nodeDocs.secondaryPhone || null);
    }
  }, [nodeDocs, profile.secondaryPhone, onSaved]);

  // Runs the save/remove, then reads the profile back: the number in the
  // database decides whether it worked, so a reply the browser could not read
  // does not show a false "could not save" when the change did go through.
  const commit = async (request, expected, { success, failure }) => {
    let requestError = null;
    try {
      const response = await request.unwrap();
      if (response?.success === false) requestError = { data: response };
    } catch (err) {
      requestError = err;
    }

    let stored;
    try {
      const fresh = await readBack(undefined, false).unwrap();
      stored = fresh?.result?.docs?.secondaryPhone || "";
    } catch {
      stored = undefined; // could not check
    }

    if (stored === expected || (stored === undefined && !requestError)) {
      showToast({ message: success });
      onSaved?.(expected || null);
      setEditing(false);
      return;
    }

    console.error("Secondary phone request failed:", requestError);
    showToast({ message: describeError(requestError, failure), type: "error" });
  };

  const start = () => {
    // editing: the saved number, split back into its parts; adding: start
    // from the primary phone's country
    const { country: initialCountry, local: initialLocal } = saved
      ? splitPhone(saved)
      : { country: splitPhone(toDigits(profile.hotelPhone)).country, local: "" };
    setCountry(initialCountry);
    setLocal(initialLocal);
    setError("");
    setEditing(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!local) return setError("Enter the phone number.");
    const phone = `${dialDigits(country)}${local.replace(/^0+/, "")}`;
    if (!isValidPhone(phone)) return setError("Enter a valid phone number.");
    if (phone === toDigits(profile.hotelPhone)) {
      return setError("This is already your primary phone.");
    }
    if (phone === saved) return setEditing(false);

    await commit(save(phone), phone, {
      success: "Secondary phone saved",
      failure: "Could not save the secondary phone.",
    });
  };

  const removeNumber = () =>
    commit(remove(), "", {
      success: "Secondary phone removed",
      failure: "Could not remove the secondary phone.",
    });

  return (
    <SettingsCard
      id={id}
      icon={Phone}
      title="Secondary phone"
      description="An extra number that also receives WhatsApp notifications for new leads."
      footer={
        editing ? (
          <>
            <span>Pick the country code, then enter the number.</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditing(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="submit" form={FORM_ID} size="sm" loading={saving || checking} disabled={busy}>
              Save
            </Button>
          </>
        ) : (
          <>
            <span>
              {saved
                ? "Lead notifications go to both numbers."
                : "Not set: lead notifications go to your primary phone only."}
            </span>
            {saved && (
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={removeNumber}
                loading={removing}
                disabled={busy}
              >
                Remove
              </Button>
            )}
            <Button variant="secondary" size="sm" icon={Pencil} onClick={start} disabled={busy}>
              {saved ? "Change" : "Add number"}
            </Button>
          </>
        )
      }
    >
      {editing ? (
        <form id={FORM_ID} onSubmit={submit} className="max-w-md">
          <Field as="div" error={error}>
            {/* the wrappers set the widths: the field style itself is full width */}
            <div className="flex gap-2">
              <div className="w-36 shrink-0">
                <Select
                  aria-label="Country code"
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setError("");
                  }}
                  options={COUNTRY_OPTIONS}
                  disabled={busy}
                />
              </div>
              <div className="min-w-0 flex-1">
                <Input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  aria-label="Phone number"
                  autoFocus
                  value={local}
                  onChange={(e) => {
                    setLocal(e.target.value.replace(/\D/g, ""));
                    setError("");
                  }}
                  placeholder="98765 43210"
                  disabled={busy}
                />
              </div>
            </div>
          </Field>
        </form>
      ) : (
        <div className="flex min-w-0 items-center gap-3 rounded-lg border border-app-border! px-3 py-2.5">
          <Icon icon={Phone} size="sm" tone="muted" />
          <span className="min-w-0 flex-1 truncate text-sm text-app-text">
            {saved ? (
              display(saved)
            ) : (
              <span className="text-app-text-faint">No secondary number yet</span>
            )}
          </span>
          {saved && <Badge tone="green">WhatsApp alerts</Badge>}
        </div>
      )}
    </SettingsCard>
  );
};

export default SecondaryPhone;
