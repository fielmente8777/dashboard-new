import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BASE_URL } from "../data/constant";
import { FiGlobe, FiSave, FiCheckCircle, FiEdit2, FiX } from "react-icons/fi";

const GscSettings = () => {
  const [rawDomain, setRawDomain] = useState("");
  const [propertyType, setPropertyType] = useState("domain"); // "domain" | "url_prefix"
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // Auto-collapse state
  const [isConfigured, setIsConfigured] = useState(false); // domain already set?
  const [savedDomain, setSavedDomain] = useState("");      // what's currently saved (for compact view)
  const [isEditing, setIsEditing] = useState(false);       // form open / closed

  const loadSettings = useCallback(async () => {
    const propertyId = localStorage.getItem("activePropertyId");
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
      alert("Please select a GA property and enter a domain.");
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

      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    } catch (err) {
      console.error("Failed to save GSC settings:", err);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ---- COMPACT VIEW: domain configured, form hidden ----
  if (isConfigured && !isEditing) {
    return (
      <div className="bg-app-surface p-5 rounded-2xl shadow-sm border border-slate-200/80 max-w-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50 text-green-600 border border-green-100">
              <FiCheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-app-text dark:text-app-text-muted ">Search Console Connected</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {savedDomain || "Auto-detected"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-app-text dark:text-app-text-muted  hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-md px-3 py-1.5 transition"
          >
            <FiEdit2 className="w-3.5 h-3.5" /> Edit Settings
          </button>
        </div>
      </div>
    );
  }

  // ---- FORM VIEW: not configured, or user clicked Edit ----
  return (
    <div className="bg-app-surface p-6 ">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <FiGlobe className="w-5 h-5 text-app-text dark:text-app-text-muted " />
          <h2 className="text-md font-semibold">Search Console</h2>
        </div>
        {/* Allow cancelling the edit only if a domain was already configured */}
        {isConfigured && (
          <button
            onClick={() => { setRawDomain(savedDomain); setIsEditing(false); }}
            className="text-slate-400 hover:text-slate-600"
            title="Cancel"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>
      <p className="text-xs text-app-text dark:text-app-text-muted mb-6">
        Configure the Google Search Console property for this hotel.
      </p>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app-text-faint mb-1">Property Type</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="domain">Domain (sc-domain:example.com)</option>
              <option value="url_prefix">URL Prefix (https://example.com/)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-app-text-faint mb-1">Domain</label>
            <input
              type="text"
              value={rawDomain}
              onChange={(e) => setRawDomain(e.target.value)}
              placeholder="www.example.com"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Enter the bare domain. We'll format it correctly based on the property type above.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-app-text-faint mb-1">Connected Google Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@example.com"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-2.5 rounded-md text-sm font-medium transition disabled:opacity-60"
          >
            {savedFlash ? (
              <><FiCheckCircle className="w-4 h-4" /> Saved!</>
            ) : (
              <><FiSave className="w-4 h-4" /> {saving ? "Saving…" : "Save Settings"}</>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default GscSettings;
