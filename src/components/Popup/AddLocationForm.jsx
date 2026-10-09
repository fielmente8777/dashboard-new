import { Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useApiAction } from "../../hooks/useApiAction";
import { useAddLocationMutation } from "../../redux/api/locationsApi";
import { fetchUserProfile } from "../../redux/slice/UserSlice";
import { getToken } from "../../utils/session";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import { Field, Input, Select } from "../ui/Field";
import { PLACES_API_URL } from "../../config/env";

const EMPTY_FORM = { name: "", country: "", state: "", city: "", pincode: "" };

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

const toOptions = (placeholder, names) => [
  { value: "", label: placeholder },
  ...names.map((name) => ({ value: name, label: name })),
];

// Adds another hotel location to the account.
const AddLocationForm = ({ isOpen, handleClose }) => {
  const dispatch = useDispatch();
  const run = useApiAction();
  const [addLocation, { isLoading }] = useAddLocationMutation();

  const [form, setForm] = useState(EMPTY_FORM);
  const [countries, setCountries] = useState(null); // null = not loaded yet
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    if (isOpen) setForm(EMPTY_FORM);
  }, [isOpen]);

  // the countries are loaded once, the first time the dialog opens
  useEffect(() => {
    if (!isOpen || countries) return;

    loadPlaces("").then((list) =>
      setCountries(list.map((item) => item.country)),
    );
  }, [isOpen, countries]);

  useEffect(() => {
    setStates([]);
    if (!form.country) return undefined;

    let current = true;
    loadPlaces("/states", { country: form.country }).then((data) => {
      if (current) setStates((data.states || []).map((item) => item.name));
    });
    return () => {
      current = false;
    };
  }, [form.country]);

  useEffect(() => {
    setCities([]);
    if (!form.country || !form.state) return undefined;

    let current = true;
    loadPlaces("/state/cities", {
      country: form.country,
      state: form.state,
    }).then((list) => {
      if (current) setCities(list);
    });
    return () => {
      current = false;
    };
  }, [form.country, form.state]);

  const setField = (name) => (e) => setForm({ ...form, [name]: e.target.value });

  const isComplete = Object.values(form).every((value) => value.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();

    const added = await run(
      addLocation({
        local: form.name.trim(),
        country: form.country,
        state: form.state,
        city: form.city,
        pincode: form.pincode.trim(),
      }),
      { success: "Location added", error: "Could not add the location." },
    );
    if (!added) return;

    // the new location shows up in the switcher
    dispatch(fetchUserProfile(getToken()));
    handleClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      title="Add a location"
      description="Add another hotel to manage from this account."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Hotel name">
          <Input autoFocus value={form.name} onChange={setField("name")} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Country">
            <Select
              value={form.country}
              disabled={!countries}
              // a new country has its own states and cities
              onChange={(e) =>
                setForm({
                  ...form,
                  country: e.target.value,
                  state: "",
                  city: "",
                })
              }
              options={toOptions(
                countries ? "Select country" : "Loading countries...",
                countries || [],
              )}
            />
          </Field>
          <Field label="State">
            <Select
              value={form.state}
              disabled={!form.country}
              onChange={(e) =>
                setForm({ ...form, state: e.target.value, city: "" })
              }
              options={toOptions("Select state", states)}
            />
          </Field>
          <Field label="City">
            <Select
              value={form.city}
              disabled={!form.state}
              onChange={setField("city")}
              options={toOptions("Select city", cities)}
            />
          </Field>
          <Field label="Pin code">
            <Input value={form.pincode} onChange={setField("pincode")} />
          </Field>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            icon={Building2}
            disabled={!isComplete}
            loading={isLoading}
          >
            Add location
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default AddLocationForm;
