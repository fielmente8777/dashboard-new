import { Building2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useSelector } from "react-redux";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import Icon from "../../../components/ui/Icon";
import { useTenant } from "../../../hooks/useTenant";
import { whatsappBusinessApi } from "../../../redux/api/whatsappBusinessApi";
import { selectCurrentLocation } from "../../../redux/slice/UserSlice";
import CopyField from "./CopyField";

const initials = (text) =>
  String(text || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

// "test on bording" -> "Test On Bording"
const titleCase = (text) =>
  String(text || "").replace(/\b\w/g, (c) => c.toUpperCase());

// one way to reach the property: label above, value as a link
const ContactLink = ({ icon, label, href, external, children }) => (
  <a
    href={href}
    target={external ? "_blank" : undefined}
    rel={external ? "noreferrer" : undefined}
    className="group flex min-w-0 items-center gap-3 rounded-lg bg-app-surface-secondary px-3 py-2 transition"
  >
    <Icon icon={icon} size="sm" className="shrink-0 text-app-text-muted" />
    <span className="min-w-0">
      <span className="block text-[11px] text-app-text-muted">{label}</span>
      <span className="block truncate text-sm text-app-text group-hover:text-blue-500">
        {children}
      </span>
    </span>
  </a>
);

// The WhatsApp number of the connected WhatsApp Business account, when the
// plan includes WhatsApp. Same request as Settings → WhatsApp, so it is cached.
const useWhatsAppNumber = (hid) => {
  const hasWhatsApp = useSelector(
    (state) => state.subscription?.subscription?.appAccess?.whatsapp,
  );
  const { currentData } =
    whatsappBusinessApi.endpoints.getWhatsAppAccountDetails.useQuery(hid, {
      skip: !hid || !hasWhatsApp,
    });
  return currentData?.result?.docs?.phoneNumber?.displayPhoneNumber || "";
};

// Who is signed in, the organisation they belong to, and the ids support
// and integrations ask for.
const ProfileOverview = ({ profile, authUser }) => {
  const { hid, ndid } = useTenant();
  const location = useSelector(selectCurrentLocation);
  const whatsappNumber = useWhatsAppNumber(hid);

  // each location has its own name; the organisation name is the fallback
  const locationName = titleCase(location?.local) || titleCase(profile.hotelName) || "—";
  const address = [location?.city, location?.state, location?.country]
    .filter(Boolean)
    .join(", ");
  const hasContacts = profile.hotelEmail || profile.hotelPhone || whatsappNumber;

  return (
    <Card>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        {/* the signed-in person */}
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-orange-400 to-orange-600 text-lg font-semibold text-white">
            {initials(authUser?.userName || profile.hotelName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold capitalize text-app-text">
              {authUser?.userName || "—"}
            </p>
            <p className="truncate text-sm text-app-text-muted">
              {authUser?.emailId}
            </p>
            {authUser?.role && (
              <Badge
                tone={authUser.isAdmin ? "purple" : "gray"}
                className="mt-1.5 capitalize"
              >
                {authUser.role}
              </Badge>
            )}
          </div>
        </div>

        {/* the organisation and the location being managed */}
        <div className="grid min-w-0 grid-cols-1 gap-4 border-app-border! lg:border-l lg:pl-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-app-text-muted">
              Organisation · {titleCase(profile.hotelName) || "—"}
            </p>
            <div className="mt-2 flex min-w-0 items-center gap-2">
              <Icon icon={Building2} size="sm" className="shrink-0 text-app-text-muted" />
              <h2 className="truncate text-base font-semibold text-app-text" title={locationName}>
                {locationName}
              </h2>
              {location && <Badge tone="blue">Current location</Badge>}
            </div>
            <p className="mt-1.5 flex min-w-0 items-start gap-2 text-sm text-app-text-muted">
              <Icon icon={MapPin} size="sm" className="mt-0.5 shrink-0" />
              <span className="min-w-0">
                {address || "No address yet. Add it under Locations below."}
                {location?.pinCode && (
                  <span className="text-app-text-faint"> · PIN {location.pinCode}</span>
                )}
              </span>
            </p>
            {profile.hotelDescription && (
              <p className="mt-2 line-clamp-2 text-sm text-app-text-muted">
                {profile.hotelDescription}
              </p>
            )}
          </div>

          {hasContacts && (
            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {profile.hotelEmail && (
                <ContactLink icon={Mail} label="Email" href={`mailto:${profile.hotelEmail}`}>
                  {profile.hotelEmail}
                </ContactLink>
              )}
              {profile.hotelPhone && (
                <ContactLink icon={Phone} label="Phone" href={`tel:${profile.hotelPhone}`}>
                  {profile.hotelPhone}
                </ContactLink>
              )}
              {whatsappNumber && (
                <ContactLink
                  icon={MessageCircle}
                  label="WhatsApp"
                  href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                  external
                >
                  {whatsappNumber}
                </ContactLink>
              )}
            </div>
          )}
        </div>
      </div>

      {(hid || ndid) && (
        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-app-border! pt-4 sm:grid-cols-2">
          {hid && (
            <CopyField label="Hotel ID (hid) · current location" value={hid} />
          )}
          {ndid && <CopyField label="Account ID (ndid)" value={ndid} />}
        </div>
      )}
    </Card>
  );
};

export default ProfileOverview;
