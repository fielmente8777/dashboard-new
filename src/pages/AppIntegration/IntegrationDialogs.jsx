import axios from "axios";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import Dialog from "../../components/ui/Dialog";
import { Field, Input } from "../../components/ui/Field";
import SelectMenu from "../../components/ui/SelectMenu";
import { useToast } from "../../context/ToastContext";
import { BASE_URL, NEW_BASE_URL } from "../../data/constant";
import { PAGES, dashboardPath } from "../../routes/paths";
import { getApiErrorMessage } from "../../redux/api/baseApi";

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const errorText = (error, fallback) =>
  getApiErrorMessage({ data: error?.response?.data }, error?.message || fallback);

const EXOTEL_FIELDS = [
  { name: "apiKey", label: "API key" },
  { name: "authToken", label: "API token", type: "password" },
  { name: "accountSID", label: "Account SID" },
  { name: "subDomain", label: "Subdomain", placeholder: "e.g. api.exotel.com" },
  { name: "virtualNumber", label: "Exotel phone number", placeholder: "e.g. 08047xxxxxx", full: true },
];

// API keys from Exotel's dashboard (Settings > API).
export const ExotelDialog = ({ open, onClose, onConnected }) => {
  const { showToast } = useToast();
  const [form, setForm] = useState(() => Object.fromEntries(EXOTEL_FIELDS.map((f) => [f.name, ""])));
  const [saving, setSaving] = useState(false);
  const complete = Object.values(form).every((v) => v.trim());

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.post(`${NEW_BASE_URL}/api/v1/call/auth/connect`, form, {
        headers: authHeader(),
      });
      if (!data?.success) throw new Error(data?.responseMessage);
      showToast({ message: "Exotel connected" });
      onConnected();
    } catch (error) {
      showToast({ message: errorText(error, "Could not connect Exotel. Check the keys."), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Connect Exotel"
      description="Find these in your Exotel dashboard under Settings → API."
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {EXOTEL_FIELDS.map((field) => (
            <Field key={field.name} label={field.label} className={field.full ? "sm:col-span-2" : ""}>
              <Input
                type={field.type || "text"}
                value={form[field.name]}
                onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                placeholder={field.placeholder}
                autoComplete="off"
              />
            </Field>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} disabled={!complete}>
            Connect
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

// Client ID and secret from the OTPless dashboard.
export const OtpLessDialog = ({ open, onClose }) => {
  const { showToast } = useToast();
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/otp/connect`,
        { client_id: clientId.trim(), client_secret: clientSecret.trim() },
        { headers: authHeader() },
      );
      if (data?.Status === false || data?.success === false) throw new Error(data?.Message || data?.message);
      showToast({ message: "OTPless connected" });
      onClose();
    } catch (error) {
      showToast({ message: errorText(error, "Could not connect OTPless."), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Connect OTPless" description="Find these in your OTPless dashboard.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Client ID">
          <Input value={clientId} onChange={(e) => setClientId(e.target.value)} autoComplete="off" />
        </Field>
        <Field label="Client secret">
          <Input type="password" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} autoComplete="off" />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} disabled={!clientId.trim() || !clientSecret.trim()}>
            Connect
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

// After Google sign-in: pick which Analytics property is the hotel's website.
export const GaPropertyDialog = ({ open, email, properties, loading, onClose, onSaved }) => {
  const { showToast } = useToast();
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await axios.post(`${BASE_URL}/google/save-property`, {
        hid: localStorage.getItem("hid"),
        email,
        property_id: selected,
      });
      showToast({ message: "Google Analytics connected" });
      setSelected("");
      onSaved();
    } catch (error) {
      showToast({ message: errorText(error, "Could not save the property."), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Choose your website's property"
      description={email ? `Signed in to Google as ${email}.` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving} disabled={!selected}>
            Connect
          </Button>
        </>
      }
    >
      {loading ? (
        <p className="py-4 text-center text-sm text-app-text-muted">Loading your Analytics properties…</p>
      ) : properties.length === 0 ? (
        <p className="py-4 text-center text-sm text-app-text-muted">
          This Google account has no Google Analytics 4 properties. Sign in with the account that
          owns your website's Analytics.
        </p>
      ) : (
        <Field as="div" label="Analytics property">
          <SelectMenu
            label="Analytics property"
            options={properties.map((p) => ({
              value: p.property_id,
              label: p.account ? `${p.name} (${p.account})` : p.name,
            }))}
            value={selected}
            onChange={setSelected}
            placeholder="Select a property"
            className="w-full"
          />
        </Field>
      )}
    </Dialog>
  );
};

// Visitors are tracked by the Eazbot chat widget's website code.
export const WebsiteTrackingDialog = ({ open, onClose }) => (
  <Dialog
    open={open}
    onClose={onClose}
    title="Set up website tracking"
    description="Visitors are tracked by the Eazbot code on your website."
    footer={
      <>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Link to={dashboardPath(PAGES.SETTINGS, { query: { tab: "Eazbot" } })} onClick={onClose}>
          <Button icon={ExternalLink}>Get the website code</Button>
        </Link>
      </>
    }
  >
    <ol className="list-decimal space-y-2 pl-5 text-sm text-app-text">
      <li>Open Settings → Eazbot and finish the setup.</li>
      <li>Copy the code from the Install step into your website.</li>
      <li>Visitors start showing under Website tracking → Visitors.</li>
    </ol>
  </Dialog>
);
