import { Building2, Mail, Phone } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import Icon from "../../../components/ui/Icon";
import { useTenant } from "../../../hooks/useTenant";
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

const ContactLink = ({ icon, href, children }) => (
  <a
    href={href}
    className="inline-flex min-w-0 items-center gap-2 rounded-lg bg-app-surface-secondary px-3 py-1.5 text-sm text-app-text transition hover:text-blue-500"
  >
    <Icon icon={icon} size="sm" className="shrink-0 text-app-text-muted" />
    <span className="truncate">{children}</span>
  </a>
);

// Who is signed in, the organisation they belong to, and the ids support
// and integrations ask for.
const ProfileOverview = ({ profile, authUser }) => {
  const { hid, ndid } = useTenant();

  return (
    <Card>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
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

        {/* the organisation */}
        <div className="min-w-0 border-app-border! lg:border-l lg:pl-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-app-text-muted">
            Organisation
          </p>
          <div className="mt-2 flex min-w-0 items-center gap-2">
            <Icon
              icon={Building2}
              size="sm"
              className="shrink-0 text-app-text-muted"
            />
            <h2 className="truncate text-base font-semibold text-app-text">
              {titleCase(profile.hotelName) || "—"}
            </h2>
          </div>
          {profile.hotelDescription && (
            <p className="mt-1 line-clamp-2 text-sm text-app-text-muted">
              {profile.hotelDescription}
            </p>
          )}
          {(profile.hotelEmail || profile.hotelPhone) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.hotelEmail && (
                <ContactLink icon={Mail} href={`mailto:${profile.hotelEmail}`}>
                  {profile.hotelEmail}
                </ContactLink>
              )}
              {profile.hotelPhone && (
                <ContactLink icon={Phone} href={`tel:${profile.hotelPhone}`}>
                  {profile.hotelPhone}
                </ContactLink>
              )}
            </div>
          )}
        </div>
      </div>

      {(hid || ndid) && (
        <div className="mt-5 grid gap-3 border-t border-app-border! pt-4 sm:grid-cols-2">
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
