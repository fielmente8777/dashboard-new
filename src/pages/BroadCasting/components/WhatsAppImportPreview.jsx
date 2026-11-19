
import { useEffect, useState } from "react";
import { X, Trash2, CheckCircle2 } from "lucide-react";

export default function WhatsAppImportPreview({
  data,
  onClose,
  onConfirm,
}) {
  const [contacts, setContacts] = useState([]);

  // Update contacts whenever new Excel data arrives
  useEffect(() => {
    setContacts(data?.contacts || []);
  }, [data]);

  if (!data) return null;

  const removeContact = (phone) => {
    setContacts((prev) =>
      prev.filter((item) => item.phone !== phone)
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-app-border p-5">
          <div>
            <h2 className="text-lg font-bold text-app-text">
              Imported WhatsApp Contacts
            </h2>
            <p className="mt-1 text-sm text-app-text-muted">
              Review your contacts before adding them to the broadcast.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-app-text-muted hover:bg-app-surface-secondary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3 p-5">
          <div className="rounded-xl bg-app-surface-secondary p-3">
            <p className="text-xs text-app-text-muted">Valid</p>
            <p className="mt-1 text-xl font-bold text-emerald-500">
              {data.valid}
            </p>
          </div>

          <div className="rounded-xl bg-app-surface-secondary p-3">
            <p className="text-xs text-app-text-muted">Invalid</p>
            <p className="mt-1 text-xl font-bold text-red-500">
              {data.invalid}
            </p>
          </div>

          <div className="rounded-xl bg-app-surface-secondary p-3">
            <p className="text-xs text-app-text-muted">Duplicates</p>
            <p className="mt-1 text-xl font-bold text-amber-500">
              {data.duplicates}
            </p>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="max-h-[380px] overflow-auto px-5">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-app-surface text-app-text-muted">
              <tr>
                <th className="py-3">#</th>
                <th>Name</th>
                <th>Phone Number</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {contacts.map((contact, index) => (
                <tr
                  key={contact.phone}
                  className="border-t border-app-border"
                >
                  <td className="py-3 text-app-text-muted">
                    {index + 1}
                  </td>

                  <td className="py-3 text-app-text">
                    {contact.name || "Unknown"}
                  </td>

                  <td className="py-3 font-medium text-app-text">
                    {contact.phone}
                  </td>

                  <td className="py-3">
                    <button
                      onClick={() => removeContact(contact.phone)}
                      className="text-red-500 hover:text-red-400"
                      title="Remove contact"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {!contacts.length && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-app-text-muted"
                  >
                    No contacts remaining.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-app-border p-5">
          <div className="flex items-center gap-2 text-sm text-emerald-500">
            <CheckCircle2 size={17} />
            {contacts.length} recipients selected
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-app-border px-4 py-2 text-sm text-app-text"
            >
              Cancel
            </button>

            <button
              disabled={!contacts.length}
              onClick={() => onConfirm(contacts)}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Add to Broadcast
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
