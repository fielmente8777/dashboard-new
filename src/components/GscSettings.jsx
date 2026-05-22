import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BASE_URL } from "../data/constant";
import { FiGlobe, FiSave, FiCheckCircle } from "react-icons/fi";

const GscSettings = () => {
  const [rawDomain, setRawDomain] = useState("");
  const [propertyType, setPropertyType] = useState("domain"); // "domain" | "url_prefix"
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const loadSettings = useCallback(async () => {
    const propertyId = localStorage.getItem("activePropertyId");
    if (!propertyId) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/google/gsc-settings/${propertyId}`);
      if (data.configured) {
        setRawDomain(data.rawDomain || "");
        setPropertyType(data.propertyType || "domain");
        setEmail(data.email || "");
      } else {
        setRawDomain("");
        setPropertyType("domain");
      }
    } catch (err) {
      console.error("Failed to load GSC settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Reload when the property changes elsewhere in the app
  useEffect(() => {
    const handleProp = () => loadSettings();
    window.addEventListener("dashboard_property_changed", handleProp);
    return () => window.removeEventListener("dashboard_property_changed", handleProp);
  }, [loadSettings]);

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

      // Notify the dashboard so the queries widget re-fetches immediately
      window.dispatchEvent(new CustomEvent("dashboard_property_changed", {
        detail: { property_id: propertyId },
      }));

      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2500);
    } catch (err) {
      console.error("Failed to save GSC settings:", err);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 max-w-lg">
      <div className="flex items-center gap-2 mb-1">
        <FiGlobe className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-900">Search Console Settings</h2>
      </div>
      <p className="text-xs text-slate-500 mb-6">
        Configure the Google Search Console property for this hotel.
      </p>

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Property Type</label>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Domain</label>
            <input
              type="text"
              value={rawDomain}
              onChange={(e) => setRawDomain(e.target.value)}
              placeholder="arkayamukteshwar.com"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Enter the bare domain. We'll format it correctly based on the property type above.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Connected Google Email (optional)</label>
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
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md text-sm font-medium transition disabled:opacity-60"
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
