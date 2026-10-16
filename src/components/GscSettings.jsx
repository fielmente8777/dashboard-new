import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BASE_URL } from "../data/constant";
import { CheckCircle2, Globe, Pencil } from "lucide-react";
import { useToast } from "../context/ToastContext";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { Field, Input } from "./ui/Field";
import Segmented from "./ui/Segmented";

const PROPERTY_TYPES = [
  { value: "domain", label: "Domain" },
  { value: "url_prefix", label: "URL prefix" },
];

// The Google Search Console site linked to the selected Analytics property.
const GscSettings = () => {
  const { showToast } = useToast();
  const [hasProperty, setHasProperty] = useState(Boolean(localStorage.getItem("activePropertyId")));
  const [rawDomain, setRawDomain] = useState("");
  const [propertyType, setPropertyType] = useState("domain"); // "domain" | "url_prefix"
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auto-collapse state
  const [isConfigured, setIsConfigured] = useState(false); // domain already set?
  const [savedDomain, setSavedDomain] = useState("");      // what's currently saved (for compact view)
  const [isEditing, setIsEditing] = useState(false);       // form open / closed

  const loadSettings = useCallback(async () => {
    let propertyId = localStorage.getItem("activePropertyId");
    // Only the Google Analytics page used to store the property, so ask the
    // backend which one this hotel has connected.
    const hid = localStorage.getItem("hid");
    if (!propertyId && hid) {
      try {
        const { data } = await axios.get(`${BASE_URL}/google/analytics-data/${hid}`, {
          params: { startDate: "today", endDate: "today" },
        });
        if (data?.activePropertyId) {
          propertyId = String(data.activePropertyId);
          localStorage.setItem("activePropertyId", propertyId);
        }
      } catch {
        // not connected
      }
    }
    setHasProperty(Boolean(propertyId));
    if (!propertyId) {
      setIsConfigured(false);
      setIsEditing(true); // no property -> nothing to show, keep form ready
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/google/gsc-settings/${propertyId}`);
      if (data.configured) {
        
        setRawDomain(data.rawDomain || "");
        setPropertyType(data.propertyType || "domain");
        setEmail(data.email || "");
        setSavedDomain(data.rawDomain || "");
        setIsConfigured(true);
        setIsEditing(false);
      } else {
        // Not configured -> show the form so the user can add it
        setRawDomain("");
        setPropertyType("domain");
        setEmail("");
        setSavedDomain("");
        setIsConfigured(false);
        setIsEditing(true);
      }
    } catch (err) {
      console.error("Failed to load GSC settings:", err);
      setIsConfigured(false);
      setIsEditing(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);


  useEffect(() => {
    const handleProp = () => loadSettings();
    window.addEventListener("dashboard_property_changed", handleProp);
    return () => window.removeEventListener("dashboard_property_changed", handleProp);
  }, [loadSettings]);

  // SearchConsoleQueries fires "gsc_configured" once it gets a successful (no
  // error_code) response — i.e. the domain is saved OR was just auto-detected.
  // Our initial loadSettings() may have run BEFORE auto-detection wrote to the
  // DB, leaving the form open even though GSC is actually configured. Re-check
  // here so we collapse to the compact view.
  // Guard: if the user is actively editing an already-configured property,
  // don't yank the form out from under them.
  useEffect(() => {
    const handleConfigured = () => {
      if (!(isEditing && isConfigured)) {
        loadSettings();
      }
    };
    window.addEventListener("gsc_configured", handleConfigured);
    return () => window.removeEventListener("gsc_configured", handleConfigured);
  }, [loadSettings, isEditing, isConfigured]);

  const handleSave = async () => {
    const propertyId = localStorage.getItem("activePropertyId");
    const hid = localStorage.getItem("hid");
    if (!propertyId || !rawDomain.trim()) {
      showToast({ message: "Enter your website's domain.", type: "error" });
      return;
    }
    try {
      setSaving(true);
      await axios.post(`${BASE_URL}/google/save-gsc-settings`, {
        property_id: propertyId,
        hid,
        email,
        rawDomain: rawDomain.trim(),
        propertyType,
      });

      
      window.dispatchEvent(new CustomEvent("dashboard_property_changed", {
        detail: { property_id: propertyId },
      }));

     
      setSavedDomain(rawDomain.trim());
      setIsConfigured(true);
      setIsEditing(false);

      showToast({ message: "Search Console connected" });
    } catch (err) {
      console.error("Failed to save GSC settings:", err);
      showToast({ message: "Could not save the Search Console settings.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const title = (
    <span className="flex items-center gap-2">
      <Globe className="size-4 text-app-text-muted" />
      Google Search Console
    </span>
  );

  if (!hasProperty) {
    return (
      <Card title={title} description="See which Google searches bring guests to your website.">
        <p className="text-sm text-app-text-muted">
          Connect Google Analytics first. Search Console is linked to your Analytics property.
        </p>
      </Card>
    );
  }

  // set up: one line with the domain
  if (isConfigured && !isEditing) {
    return (
      <Card
        title={title}
        actions={
          <Button size="sm" variant="secondary" icon={Pencil} onClick={() => setIsEditing(true)}>
            Change
          </Button>
        }
      >
        <div className="flex items-center gap-2 text-sm text-app-text">
          <CheckCircle2 className="size-4 text-green-500" />
          {savedDomain || "Detected automatically"}
          <Badge tone="green">Connected</Badge>
        </div>
      </Card>
    );
  }

  return (
    <Card title={title} description="Which website should we show Google search data for?">
      {loading ? (
        <p className="text-sm text-app-text-muted">Loading…</p>
      ) : (
        <div className="space-y-4">
          <Field as="div" label="Property type in Search Console">
            <Segmented
              label="Property type"
              options={PROPERTY_TYPES}
              value={propertyType}
              onChange={setPropertyType}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Website domain" hint="Just the domain; we format it for you.">
              <Input
                value={rawDomain}
                onChange={(e) => setRawDomain(e.target.value)}
                placeholder="www.yourhotel.com"
              />
            </Field>
            <Field label="Google account (optional)" hint="The account that owns the Search Console property.">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@yourhotel.com"
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            {isConfigured && (
              <Button
                variant="secondary"
                onClick={() => {
                  setRawDomain(savedDomain);
                  setIsEditing(false);
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            )}
            <Button onClick={handleSave} loading={saving} disabled={!rawDomain.trim()}>
              Save
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default GscSettings;
