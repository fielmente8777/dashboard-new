import { Eye, EyeOff, Globe, Instagram, Lock, Mail, MapPin, MessageCircle, Pencil, Phone, Trash2 } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import { formatNumber, relativeDate } from "./tradeUtils";
import { useTradeCategories } from "./useTradeCategories";

/** hotels may correct contacts of Eazotel's directory (off: only Eazotel's team edits them) */
const DIRECTORY_EDIT = false;

const Row = ({ icon: Icon, children }) => (
  <div className="flex items-start gap-2 text-sm text-app-text">
    <Icon className="mt-0.5 size-4 shrink-0 text-app-text-muted" aria-hidden />
    <div className="min-w-0 break-words">{children}</div>
  </div>
);

/**
 * One partner: the details a hotel may see, and the ways to reach them. Edit: the hotel's own
 * contact in full, or a correction to Eazotel's directory. Hide / delete only take it out of
 * this hotel's list.
 */
const PartnerDrawer = ({ partner: p, onClose, onReach, onEdit, onRemove, busy }) => {
  const { segmentOf } = useTradeCategories();
  const seg = segmentOf(p.segment);
  return (
    <Drawer open title={p.company || p.person || "Unlisted agency"} description={seg.label} onClose={onClose}>
      <div className="space-y-5 p-4 sm:p-5">
        {p.company && p.person && (
          <div>
            <p className="text-xs uppercase tracking-wide text-app-text-muted">Contact person</p>
            <p className="text-sm text-app-text">
              {p.person}
              {p.designation ? <span className="text-app-text-muted"> · {p.designation}</span> : null}
            </p>
          </div>
        )}
        <Row icon={MapPin}>{[p.city, p.state].filter(Boolean).join(", ") || "Location not on file"}</Row>

        <div className={`space-y-2 rounded-xl border border-app-border p-4 ${p.masked ? "select-none bg-app-surface-secondary" : ""}`}>
          {p.masked && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-app-text">
              <Lock className="size-4" aria-hidden /> Protected contact details
            </p>
          )}
          {(p.phones || []).map((ph) => (
            <Row key={ph} icon={Phone}>
              <span className="tabular-nums">{ph}</span>
            </Row>
          ))}
          {p.morePhones > 0 && <p className="text-xs text-app-text-muted">+ {p.morePhones} more number(s) on file</p>}
          {(p.emails || []).map((em) => (
            <Row key={em} icon={Mail}>
              {em}
            </Row>
          ))}
          {p.moreEmails > 0 && <p className="text-xs text-app-text-muted">+ {p.moreEmails} more email(s) on file</p>}
          {p.instagram && <Row icon={Instagram}>{p.instagram}</Row>}
          {!p.masked && p.website && <Row icon={Globe}>{p.website}</Row>}
          {p.masked && (
            <p className="text-xs text-app-text-muted">
              Numbers and emails are never shown or exported. Eazotel sends your message and replies come to your email.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {p.optOut?.email && <Badge tone="amber">Asked not to get emails</Badge>}
          {p.inDirectory && <Badge tone="blue">Also in Eazotel&apos;s directory</Badge>}
          {p.contactCount > 0 && (
            <Badge tone="gray">
              Contacted {formatNumber(p.contactCount)}× · last {relativeDate(p.lastContactedAt)}
            </Badge>
          )}
        </div>

        {!p.masked && p.notes && (
          <div>
            <p className="text-xs uppercase tracking-wide text-app-text-muted">Notes</p>
            <p className="text-sm whitespace-pre-wrap text-app-text">{p.notes}</p>
          </div>
        )}

        <div className="grid gap-2">
          <Button icon={MessageCircle} disabled={!p.reach.whatsapp || p.optOut?.whatsapp} onClick={() => onReach("whatsapp")}>
            Send WhatsApp
          </Button>
          <Button variant="secondary" icon={Mail} disabled={!p.reach.email || p.optOut?.email} onClick={() => onReach("email")}>
            Send email
          </Button>
          <Button variant="secondary" icon={Phone} disabled>
            Call through Eazotel (coming soon)
          </Button>
          <div className="grid grid-cols-2 gap-2">
            {/* Eazotel's directory: only Eazotel's team edits it for now (TRADE_DIRECTORY_CLIENT_EDIT on
                gian-new). Set DIRECTORY_EDIT to true to bring "Edit details" back. */}
            {(!p.masked || DIRECTORY_EDIT) && (
              <Button variant="ghost" icon={Pencil} onClick={onEdit}>
                {p.masked ? "Edit details" : "Edit contact"}
              </Button>
            )}
            {p.hiddenByMe ? (
              <Button variant="ghost" icon={Eye} loading={busy} onClick={onRemove}>
                Show again
              </Button>
            ) : p.masked ? (
              <Button variant="ghost" icon={EyeOff} loading={busy} onClick={onRemove}>
                Hide from my list
              </Button>
            ) : (
              <Button variant="ghost" icon={Trash2} loading={busy} onClick={onRemove} className="text-red-600">
                Delete
              </Button>
            )}
          </div>
          {p.masked && (
            <p className="text-xs text-app-text-muted">
              Hiding only removes it from your list.
              {DIRECTORY_EDIT
                ? " Edits are saved for every hotel and checked by Eazotel's team."
                : " Something wrong in this contact? Tell Eazotel's team and we'll correct it."}
            </p>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default PartnerDrawer;
