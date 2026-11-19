import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Copy, Download, ExternalLink, Link2, Plus, Trash2 } from "lucide-react";
import handleLocalStorage from "../../utils/handleLocalStorage";
import {
  BOOKING_STEPS, bookingButtonHtml, buildBookingDeepLink, clientHandoff,
  createDeepLinkDefaults, localDateString,
} from "../../utils/bookingDeepLink";
import "./DeepLinks.css";
import BookingPrefillPreview from "./BookingPrefillPreview";
import {
  bookingShareUrl, clientIntegrationHtml, createBookingDeepLink, listBookingDeepLinks,
  isLocalBookingDemo, setBookingDeepLinkActive,
} from "../../services/api/bookingDeepLinks";

function Field({ label, name, error, hint, children, ...props }) {
  return (
    <div className="deep-link-field">
      <label htmlFor={`deep-link-${name}`}>{label}</label>
      {children || <input id={`deep-link-${name}`} name={name} aria-invalid={Boolean(error)} aria-describedby={error || hint ? `deep-link-${name}-help` : undefined} {...props} />}
      {(error || hint) && <p id={`deep-link-${name}-help`} className={error ? "deep-link-error" : "deep-link-hint"}>{error || hint}</p>}
    </div>
  );
}

function DeepLinkBuilder({ hotelId }) {
  const [config, setConfig] = useState(createDeepLinkDefaults);
  const [linkName, setLinkName] = useState("Website booking link");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState({ docs: [], total: 0, limit: 20 });
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [pendingCode, setPendingCode] = useState("");
  const [previewCode, setPreviewCode] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeError, setNoticeError] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [generated, setGenerated] = useState(null);
  const result = buildBookingDeepLink(config);
  const errors = showErrors ? result.errors : {};
  const current = generated && generated.directUrl === result.url && generated.linkName === linkName && generated.expiryInput === expiresAt ? generated : null;
  useEffect(() => {
    const controller = new AbortController();
    listBookingDeepLinks(hotelId, page, controller.signal)
      .then((data) => { setSaved(data); setListError(""); })
      .catch((error) => { if (!controller.signal.aborted) setListError(error.response?.data?.message || (isLocalBookingDemo ? "Local demo API unavailable. Run npm run dev:deep-links in gian, then click Refresh." : "Saved links could not be loaded. Check that the booking deep-link backend is deployed.")); })
      .finally(() => { if (!controller.signal.aborted) setListLoading(false); });
    return () => controller.abort();
  }, [hotelId, page, refresh]);

  function reloadSaved(nextPage = page) {
    setListLoading(true);
    setPage(nextPage);
    setRefresh((value) => value + 1);
  }

  function announce(message, isError = false) {
    setNotice(message);
    setNoticeError(isError);
  }

  function update(name, value) {
    setConfig((previous) => ({ ...previous, [name]: value }));
    setNotice("");
  }

  function input(name, label, props = {}, hint) {
    return <Field name={name} label={label} error={errors[name]} hint={hint} value={config[name]} onChange={(event) => update(name, event.target.value)} {...props} />;
  }

  function updateGroup(index, name, value) {
    update("childGroups", config.childGroups.map((group, i) => i === index ? { ...group, [name]: value } : group));
  }

  async function generate(event) {
    event.preventDefault();
    setShowErrors(true);
    if (!result.url) {
      setGenerated(null);
      announce("Check the highlighted fields before generating a link.", true);
      return;
    }
    if (!linkName.trim() || linkName.trim().length > 100) return announce("Enter a link name of 1 to 100 characters.", true);
    const snapshot = structuredClone(config);
    setSaving(true);
    try {
      const record = await createBookingDeepLink(hotelId, {
        name: linkName.trim(), config: snapshot,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      });
      setGenerated({ ...result, directUrl: result.url, url: bookingShareUrl(record.code), code: record.code, config: snapshot, linkName, expiryInput: expiresAt });
      reloadSaved(1);
      announce("Link saved to Eazotel. You can now share it or preview the prefilled form.");
    } catch (error) {
      const fields = error.response?.data?.errors;
      announce(fields ? Object.values(fields).join(" ") : error.response?.data?.message || (isLocalBookingDemo ? "Could not save the test link. Start npm run dev:deep-links in gian and try again." : "Could not save the link. Check the backend connection and try again."), true);
    } finally { setSaving(false); }
  }

  async function copy(value, description) {
    try {
      await navigator.clipboard.writeText(value);
      announce(`${description} copied.`);
    } catch {
      announce("Clipboard access is unavailable. Select and copy the text below, or download the client handoff.", true);
    }
  }

  function download() {
    const blob = new Blob([clientHandoff(current.config, current.url), "\nClient form integration\n", clientIntegrationHtml()], { type: "text/plain;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `booking-deep-link-${String(hotelId || "client").replace(/[^a-zA-Z0-9_-]/g, "_")}.txt`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    announce("Client handoff downloaded.");
  }

  async function toggleSaved(record) {
    setPendingCode(record.code);
    try {
      await setBookingDeepLinkActive(hotelId, record.code, !record.active);
      if (generated?.code === record.code) setGenerated(null);
      reloadSaved();
      announce(record.active ? "Booking link disabled." : "Booking link enabled.");
    } catch (error) { announce(error.response?.data?.message || "Could not update this link.", true); }
    finally { setPendingCode(""); }
  }

  function loadSaved(record) {
    setConfig(structuredClone(record.config));
    setLinkName(`${record.name} (copy)`.slice(0, 100));
    setExpiresAt("");
    setGenerated(null);
    announce("Settings loaded. Save to create a new link; the original link stays unchanged.");
  }

  return (
    <section className="deep-links" aria-labelledby="deep-links-title">
      <header className="deep-links-header">
        <span className="deep-links-eyebrow">BOOKING ENGINE / DEEP LINKS</span>
        <h1 id="deep-links-title"><Link2 aria-hidden="true" size={26} /> Create a booking link</h1>
        <p>Give clients a direct path from their website to the right booking experience.</p>
        <span className="deep-link-property">Current property: {hotelId || "not selected"}</span>
        {isLocalBookingDemo && <p className="deep-link-date-note" role="note">Local demo mode: test links are stored on this computer. Localhost links work on this computer only.</p>}
      </header>

      <div className="deep-links-layout">
        <form onSubmit={generate} noValidate className="deep-link-form">
          <div className="deep-link-card">
            <h2>1. Booking destination</h2>
            <div className="deep-link-grid">
              <Field name="linkName" label="Link name" value={linkName} maxLength={100} onChange={(event) => setLinkName(event.target.value)} />
              <Field name="expiresAt" label="Link expires at (optional)" type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} hint="Uses your local time. Leave blank for no scheduled expiry." />
            </div>
            {input("baseUrl", "Hotel booking-engine URL", { type: "url", placeholder: "https://www.hotelwebsite.com/hotelname", required: true }, "Use the live page hosting the booking engine. Hotel paths and existing property IDs are preserved.")}
            <div className="deep-link-grid">
              {input("propertyId", "Public property ID (optional)", { placeholder: "Property ID / pid" }, "Leave blank to keep the pid already in the URL.")}
              <Field name="step" label="Open booking step" error={errors.step}>
                <select id="deep-link-step" value={config.step} onChange={(event) => update("step", event.target.value)}>
                  {BOOKING_STEPS.map((step) => <option value={step.value} key={step.value}>{step.label}</option>)}
                </select>
              </Field>
            </div>
            {["summary", "checkout", "thank-you"].includes(config.step) && <p className="deep-link-hint">Later booking steps may require an existing session or completed booking. Use room selection for general website links.</p>}
            <div className="deep-link-grid">
              {input("language", "Language", { placeholder: "en / th-TH / en-US" })}
              {input("currency", "Currency", { placeholder: "INR", maxLength: 3, onChange: (event) => update("currency", event.target.value.toUpperCase()) })}
            </div>
            <label className="deep-link-check"><input type="checkbox" checked={config.expanded} onChange={(event) => update("expanded", event.target.checked)} /> Open booking engine expanded</label>
          </div>

          <div className="deep-link-card">
            <h2>2. Dates & guests</h2>
            <label className="deep-link-check"><input type="checkbox" checked={config.includeDates} onChange={(event) => update("includeDates", event.target.checked)} /> Include fixed travel dates</label>
            <p className="deep-link-hint">Leave dates off for a permanent website button. Guests choose their dates in the booking engine.</p>
            {config.includeDates && <div className="deep-link-grid">
              {input("checkIn", "Check-in", { type: "date", min: localDateString(), required: true })}
              {input("checkOut", "Check-out", { type: "date", min: config.checkIn || localDateString(), required: true })}
            </div>}
            {input("adults", "Adults", { type: "number", min: 1, step: 1, required: true })}
            <div className="deep-link-child-header"><h3>Children by age group</h3><button type="button" className="deep-link-text-button" onClick={() => update("childGroups", [...config.childGroups, { id: "", count: "0" }])}><Plus size={15} aria-hidden="true" /> Add child group</button></div>
            <p className="deep-link-hint">Use the age-group IDs configured in this hotel's booking engine. No groups means no children.</p>
            {config.childGroups.map((group, index) => <div className="deep-link-child-row" key={index}>
              <Field name={`group-${index}-id`} label="Child-group ID" error={errors[`group-${index}-id`]} value={group.id} placeholder="e.g. 2" onChange={(event) => updateGroup(index, "id", event.target.value)} />
              <Field name={`group-${index}-count`} label="Children" type="number" min={0} step={1} error={errors[`group-${index}-count`]} value={group.count} onChange={(event) => updateGroup(index, "count", event.target.value)} />
              <button type="button" className="deep-link-remove" aria-label={`Remove child group ${index + 1}`} onClick={() => update("childGroups", config.childGroups.filter((_, i) => i !== index))}><Trash2 size={17} aria-hidden="true" /></button>
            </div>)}
          </div>

          <div className="deep-link-card">
            <h2>3. Offers & tracking</h2>
            <div className="deep-link-grid">
              {input("promoCode", "Promo code (optional)", { placeholder: "SUMMER25" }, "A promo code also opens the engine expanded.")}
              {input("preferredRate", "Preferred rate ID (pr)", { placeholder: "e.g. 68462" }, "Highlights the rate when its validity and search rules match.")}
            </div>
            <details>
              <summary>Campaign tracking (optional)</summary>
              {input("utmSource", "UTM source", { placeholder: "hotel-website" })}
              <div className="deep-link-grid">
                {input("utmMedium", "UTM medium", { placeholder: "website" })}
                {input("utmCampaign", "UTM campaign", { placeholder: "summer-offer" })}
              </div>
            </details>
          </div>

          <div className="deep-link-card">
            <details open={Boolean(errors.sessionId || errors.packageId || errors.roomId || errors.rateId)}>
              <summary>Advanced booking IDs</summary>
              <p className="deep-link-hint">Leave these blank for general links. Use real booking-engine IDs for a specific package, room, rate or existing session.</p>
              <div className="deep-link-grid">
                {input("sessionId", "Session ID")}
                {input("packageId", "Package ID")}
                {input("roomId", "Room ID")}
                {input("rateId", "Rate ID in booking request (br)")}
              </div>
            </details>
          </div>

          <div className="deep-link-form-actions">
            <button type="submit" className="deep-link-primary" disabled={saving}><Link2 size={17} aria-hidden="true" /> {saving ? "Saving…" : "Save & generate link"}</button>
          </div>
          <p className="deep-link-hint">{isLocalBookingDemo ? "Test links are saved in the local demo server for this property." : "Links are saved to Eazotel for this property and available across browsers."}</p>
        </form>

        <aside className="deep-link-preview" aria-label="Generated booking link">
          <div className="deep-link-card">
            <span className="deep-links-eyebrow">CLIENT HANDOFF</span>
            <h2>Your booking link</h2>
            <div className={`deep-link-notice ${noticeError ? "deep-link-error" : ""}`} role="status" aria-live="polite">{notice}</div>
            {current ? <>
              <label className="deep-link-output-label" htmlFor="deep-link-output">Shareable URL</label>
              <textarea id="deep-link-output" readOnly value={current.url} rows={6} onFocus={(event) => event.target.select()} />
              <div className="deep-link-share-actions">
                <button type="button" className="deep-link-primary" onClick={() => copy(current.url, "Booking URL")}><Copy size={16} aria-hidden="true" /> Copy URL</button>
                <a href={current.url} target="_blank" rel="noopener noreferrer" className="deep-link-secondary"><ExternalLink size={16} aria-hidden="true" /> Open preview</a>
              </div>
              <button type="button" className="deep-link-secondary deep-link-preview-button" onClick={() => setPreviewCode(current.code)}>Preview prefilled form</button>
              <label className="deep-link-output-label" htmlFor="deep-link-html">Website button HTML</label>
              <textarea id="deep-link-html" readOnly value={bookingButtonHtml(current.url)} rows={4} onFocus={(event) => event.target.select()} />
              <div className="deep-link-share-actions">
                <button type="button" className="deep-link-secondary" onClick={() => copy(bookingButtonHtml(current.url), "Button HTML")}><Copy size={16} aria-hidden="true" /> Copy HTML</button>
                <button type="button" className="deep-link-secondary" onClick={download}><Download size={16} aria-hidden="true" /> Client handoff</button>
              </div>
              <details className="deep-link-parameters"><summary>Client form integration</summary>
                <p className="deep-link-hint">If the destination does not read deep links already, add this script and map its form fields once. It also handles forms opened later in a popup.</p>
                <textarea aria-label="Client form integration code" rows={7} readOnly value={clientIntegrationHtml()} />
                <button type="button" className="deep-link-secondary" onClick={() => copy(clientIntegrationHtml(), "Form integration code")}>Copy integration code</button>
              </details>
              {config.includeDates && <p className="deep-link-date-note">This link has fixed travel dates. Update it before {config.checkIn}.</p>}
              <details className="deep-link-parameters"><summary>URL parameters</summary><dl>{current.parameters.map(([key, value], index) => <div key={`${key}-${index}`}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></details>
            </> : <div className="deep-link-empty"><Link2 size={36} aria-hidden="true" /><p>{generated ? "Settings changed. Generate a new link to share the latest options." : "Add the booking destination and options, then generate your client's link."}</p></div>}
          </div>
          <div className="deep-link-card deep-link-guide">
            <h3>Using the link on a website</h3>
            <ol><li>Generate the link for this hotel.</li><li>Open the preview and check the selections.</li><li>Copy the URL into the website's booking button, or use the provided HTML.</li></ol>
            <p>For a website availability form, build the dates and guest values from the visitor's selections when they submit.</p>
            <p>The destination must support this deep-link format. Availability, prices and promo eligibility are confirmed there.</p>
          </div>
        </aside>
      </div>
      <div className="deep-link-card deep-link-saved">
        <div className="deep-link-child-header"><h2>Saved links</h2><button type="button" className="deep-link-secondary" onClick={() => reloadSaved()} disabled={listLoading}>Refresh</button></div>
        {listLoading ? <p role="status">Loading saved links…</p> : listError ? <p role="alert" className="deep-link-error">{listError}</p> : saved.docs.length === 0 ? <p className="deep-link-hint">No saved links for this property yet.</p> : <>
          {saved.docs.map((record) => <div key={record.code} className="deep-link-saved-row">
            <div><h3>{record.name}</h3><p className="deep-link-hint">{record.expired ? "Expired" : record.active ? "Active" : "Disabled"}{record.expiresAt ? ` · Expires ${new Date(record.expiresAt).toLocaleString()}` : ""}</p></div>
            <div className="deep-link-share-actions">
              <button type="button" className="deep-link-secondary" disabled={!record.active || record.expired} onClick={() => copy(bookingShareUrl(record.code), "Saved booking URL")}>Copy link</button>
              <button type="button" className="deep-link-secondary" disabled={!record.active || record.expired} onClick={() => setPreviewCode(record.code)}>Test prefill</button>
              <button type="button" className="deep-link-secondary" onClick={() => loadSaved(record)}>Use settings</button>
              <button type="button" className="deep-link-secondary" disabled={Boolean(pendingCode)} onClick={() => toggleSaved(record)}>{pendingCode === record.code ? "Updating…" : record.active ? "Disable" : "Enable"}</button>
            </div>
          </div>)}
          <div className="deep-link-share-actions"><button type="button" className="deep-link-secondary" disabled={page === 1} onClick={() => reloadSaved(page - 1)}>Previous</button><span className="deep-link-hint">Page {page} · {saved.total} links</span><button type="button" className="deep-link-secondary" disabled={page * saved.limit >= saved.total} onClick={() => reloadSaved(page + 1)}>Next</button></div>
        </>}
      </div>
      {previewCode && <BookingPrefillPreview key={previewCode} code={previewCode} onClose={() => setPreviewCode("")} />}
    </section>
  );
}

export default function DeepLinks() {
  // Remount when switching properties so one hotel's settings never carry over.
  const selectedHotelId = useSelector((state) => state.userProfile?.hid);
  const hotelId = handleLocalStorage("hid") || selectedHotelId || "";
  return <DeepLinkBuilder key={hotelId} hotelId={hotelId} />;
}
