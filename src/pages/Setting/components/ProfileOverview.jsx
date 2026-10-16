import { ExternalLink } from "lucide-react";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import Detail from "../../../components/ui/Detail";
import Icon from "../../../components/ui/Icon";

const initials = (text) =>
  String(text || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

// `domain` is usually the site's slug ("testonbording48599302"), which the
// website lives under as <slug>.eazotel.com; a full domain is used as it is.
const siteUrl = (domain) => {
  const text = String(domain).trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  return text.includes(".") ? `https://${text}` : `https://${text}.eazotel.com`;
};

// Who is signed in, and the organisation's details.
const ProfileOverview = ({ profile, authUser }) => (
  <Card>
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
      <div className="flex min-w-0 items-center gap-4 lg:w-80 lg:shrink-0">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-orange-400 to-orange-600 text-lg font-semibold text-white">
          {initials(authUser?.userName || profile.hotelName)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold capitalize text-app-text">
            {authUser?.userName || "—"}
          </p>
          <p className="truncate text-sm text-app-text-muted">{authUser?.emailId}</p>
          {authUser?.role && (
            <Badge tone={authUser.isAdmin ? "purple" : "gray"} className="mt-1.5 capitalize">
              {authUser.role}
            </Badge>
          )}
        </div>
      </div>

      <dl className="grid min-w-0 flex-1 gap-4 border-app-border! sm:grid-cols-2 lg:border-l lg:pl-6 xl:grid-cols-3">
        <Detail label="Organisation">{profile.hotelName}</Detail>
        <Detail label="Email">
          {profile.hotelEmail && (
            <a href={`mailto:${profile.hotelEmail}`} className="hover:text-blue-500">
              {profile.hotelEmail}
            </a>
          )}
        </Detail>
        <Detail label="Phone">
          {profile.hotelPhone && (
            <a href={`tel:${profile.hotelPhone}`} className="hover:text-blue-500">
              {profile.hotelPhone}
            </a>
          )}
        </Detail>
        <Detail label="Website">
          {profile.domain && (
            <a
              href={siteUrl(profile.domain)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-1 hover:text-blue-500"
            >
              <span className="truncate">{siteUrl(profile.domain).replace(/^https:\/\//, "")}</span>
              <Icon icon={ExternalLink} size={12} className="shrink-0 opacity-60" />
            </a>
          )}
        </Detail>
        {profile.hotelDescription && (
          <div className="sm:col-span-2">
            <Detail label="About">{profile.hotelDescription}</Detail>
          </div>
        )}
      </dl>
    </div>
  </Card>
);

export default ProfileOverview;
