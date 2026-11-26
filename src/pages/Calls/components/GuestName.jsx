import { Check, PencilLine, X } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import Icon from "../../../components/ui/Icon";
import { useToast } from "../../../context/ToastContext";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { useSaveGuestNameMutation } from "../../../redux/api/callsApi";
import { selectHid } from "../../../redux/slice/UserSlice";
import { getGuestNumber } from "../callUtils";

const stop = (e) => e.stopPropagation();

// The guest's name over the number. The name comes from the lead, the WhatsApp chat or a
// contact (gian matches the number); a caller found nowhere gets "Add name", which is kept
// for every call of that number.
const GuestName = ({ call, className = "" }) => {
  const hid = useSelector(selectHid);
  const { showToast } = useToast();
  const [save, { isLoading }] = useSaveGuestNameMutation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const number = call.guest?.number || getGuestNumber(call) || "";
  const name = call.guest?.name || call.guestName || call.callerName || null;

  const submit = async () => {
    const value = draft.trim();
    if (!value) return setEditing(false);
    try {
      await save({ hid: call.hid || hid, phone: number, name: value }).unwrap();
      showToast({ message: `Saved: ${value}`, type: "success" });
      setEditing(false);
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Could not save the name."), type: "error" });
    }
  };

  if (editing) {
    return (
      <span className={`flex items-center gap-1 ${className}`} onClick={stop}>
        <input
          autoFocus
          value={draft}
          maxLength={80}
          placeholder="Guest's name"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") setEditing(false);
          }}
          disabled={isLoading}
          className="h-7 w-36 min-w-0 rounded-md border border-blue-500! bg-app-surface px-2 text-sm text-app-text outline-none"
        />
        <button type="button" aria-label="Save name" onClick={submit} disabled={isLoading} className="rounded-md p-1 text-emerald-600 hover:bg-emerald-500/10">
          <Icon icon={Check} size="sm" />
        </button>
        <button type="button" aria-label="Cancel" onClick={() => setEditing(false)} className="rounded-md p-1 text-app-text-muted hover:bg-app-surface-secondary">
          <Icon icon={X} size="sm" />
        </button>
      </span>
    );
  }

  return (
    <span className={`block min-w-0 leading-tight ${className}`}>
      {name ? (
        <>
          <span className="block truncate font-medium text-app-text" title={name}>
            {name}
          </span>
          <span className="block text-xs tabular-nums text-app-text-muted">{number || "—"}</span>
        </>
      ) : (
        <>
          <span className="block font-medium tabular-nums text-app-text">{number || "—"}</span>
          {number && (
            <button
              type="button"
              onClick={(e) => {
                stop(e);
                setDraft("");
                setEditing(true);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              <Icon icon={PencilLine} size="xs" />
              Add name
            </button>
          )}
        </>
      )}
    </span>
  );
};

export default GuestName;
