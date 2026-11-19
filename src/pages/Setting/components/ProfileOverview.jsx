import { Building2, Hotel, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useSelector } from "react-redux";
import Badge from "../../../components/ui/Badge";
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

// One fact about the account: icon, label, value (a link when href is given).
const Detail = ({ icon, label, href, external, children }) => {
  const value = children || <span className="text-app-text-faint">Not set</span>;

  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-app-surface-secondary text-app-text-muted">
        <Icon icon={icon} size="sm" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-app-text-muted">{label}</dt>
        <dd className="truncate text-sm font-medium text-app-text">
          {href && children ? (
            <a
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer" : undefined}
              className="hover:text-blue-500"
            >
              {children}
            </a>
          ) : (
            value
          )}
        </dd>
      </div>
    </div>
  );
};

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

// The page header: who is signed in, the organisation and location being
// managed, how guests reach it, and the ids support and integrations ask for.
const ProfileOverview = ({ profile, authUser }) => {
  const { hid, ndid } = useTenant();
  const location = useSelector(selectCurrentLocation);
  const whatsappNumber = useWhatsAppNumber(hid);

  const name = authUser?.userName || titleCase(profile.hotelName) || "—";
  const organisation = titleCase(profile.hotelName);
  // each location has its own name; the organisation name is the fallback
  const locationName = titleCase(location?.local) || organisation;
  const address = [location?.city, location?.state, location?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="overflow-hidden rounded-xl border border-app-border! bg-app-surface">
      <div className="h-20 bg-linear-to-r from-blue-600/20 via-purple-500/10 to-orange-400/15 sm:h-24" />

      <div className="relative px-4 pb-5 sm:px-6">
        <span className="absolute -top-8 left-4 flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-orange-400 to-orange-600 text-xl font-semibold text-white shadow-sm ring-4 ring-app-surface sm:left-6">
          {initials(authUser?.userName || profile.hotelName)}
        </span>

        <div className="flex flex-wrap items-start justify-between gap-3 pt-11">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-semibold capitalize text-app-text">{name}</h1>
              {authUser?.role && (
                <Badge tone={authUser.isAdmin ? "purple" : "gray"} className="capitalize">
                  {authUser.role}
                </Badge>
              )}
            </div>
            <p className="truncate text-sm text-app-text-muted">{authUser?.emailId}</p>
          </div>

          {location && (
            <Badge tone="blue" className="gap-1.5 py-1">
              <Icon icon={MapPin} size="xs" />
              Managing {locationName}
            </Badge>
          )}
        </div>

        {profile.hotelDescription && (
          <p className="mt-3 line-clamp-2 max-w-3xl text-sm text-app-text-muted">
            {profile.hotelDescription}
          </p>
        )}

        <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-app-border! pt-5 sm:grid-cols-2 xl:grid-cols-3">
          <Detail icon={Building2} label="Organisation">{organisation}</Detail>
          <Detail icon={Hotel} label="Current location">{locationName}</Detail>
          <Detail icon={MapPin} label="Address">
            {address && (
              <span title={address}>
                {address}
                {location?.pinCode && (
                  <span className="font-normal text-app-text-faint"> · {location.pinCode}</span>
                )}
              </span>
            )}
          </Detail>
          <Detail icon={Mail} label="Email" href={`mailto:${profile.hotelEmail}`}>
            {profile.hotelEmail}
          </Detail>
          <Detail icon={Phone} label="Phone" href={`tel:${profile.hotelPhone}`}>
            {profile.hotelPhone}
          </Detail>
          {profile.secondaryPhone && (
            <Detail
              icon={Phone}
              label="Secondary phone"
              href={`tel:+${profile.secondaryPhone}`}
            >
              +{profile.secondaryPhone}
            </Detail>
          )}
          {whatsappNumber && (
            <Detail
              icon={MessageCircle}
              label="WhatsApp"
              href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
              external
            >
              {whatsappNumber}
            </Detail>
          )}
        </dl>

        {(hid || ndid) && (
          <div className="mt-5 grid grid-cols-1 gap-3 rounded-lg bg-app-surface-secondary/60 p-3 sm:grid-cols-2">
            {hid && <CopyField label="Hotel ID (hid) · current location" value={hid} />}
            {ndid && <CopyField label="Account ID (ndid)" value={ndid} />}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfileOverview;
