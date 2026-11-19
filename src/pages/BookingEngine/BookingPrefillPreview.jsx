import { useEffect, useRef, useState } from "react";
import { resolveBookingDeepLink } from "../../services/api/bookingDeepLinks";

export default function BookingPrefillPreview({ code, onClose }) {
  const dialog = useRef(null);
  const [prefill, setPrefill] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    const controller = new AbortController();
    resolveBookingDeepLink(code, controller.signal)
      .then((result) => setPrefill(result.prefill))
      .catch((failure) => {
        if (!controller.signal.aborted) setError(failure.response?.data?.message || "Could not load the saved link. Please try again.");
      });
    return () => { controller.abort(); element.close(); };
  }, [code]);
  const fields = [
    ["checkIn", "Check-in", "date"], ["checkOut", "Check-out", "date"],
    ["adults", "Adults", "number"], ["children", "Children", "number"],
    ["roomId", "Room ID", "text"], ["rateId", "Rate ID", "text"],
    ["promoCode", "Promo code", "text"], ["currency", "Currency", "text"],
  ];
  return <dialog ref={dialog} className="deep-link-demo" onCancel={onClose} onClose={onClose} aria-labelledby="deep-link-demo-title">
    <div className="deep-link-demo-header"><h2 id="deep-link-demo-title">Book Now — prefill preview</h2><button type="button" className="deep-link-secondary" onClick={onClose}>Close</button></div>
    <p className="deep-link-hint">Loaded from this saved link's public API. This is a demo form; it does not create a reservation.</p>
    {error ? <p role="alert" className="deep-link-error">{error}</p> : !prefill ? <p role="status">Loading booking details…</p> : <>
      <div className="deep-link-grid">{fields.map(([key, label, type]) => <div className="deep-link-field" key={key}>
        <label htmlFor={`prefill-preview-${key}`}>{label}</label>
        <input id={`prefill-preview-${key}`} type={type} defaultValue={prefill[key] ?? ""} min={key === "adults" ? 1 : key === "children" ? 0 : undefined} />
      </div>)}</div>
      <p className="deep-link-hint">Guests can edit these values. The actual booking form must connect its fields to the provided integration script or prefill API.</p>
    </>}
  </dialog>;
}
