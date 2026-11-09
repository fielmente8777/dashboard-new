import { Building2, KeyRound, Link2, Mail, Phone, Webhook } from "lucide-react";
import { Skeleton } from "../../components/ui/States";
import { useTenant } from "../../hooks/useTenant";
import ChangePassword from "./components/ChangePassword";
import HotelsSection from "./components/HotelsSection";
import LeadWebhooks from "./components/LeadWebhooks";
import MarketingEmail from "./components/MarketingEmail";
import ProfileOverview from "./components/ProfileOverview";
import SecondaryPhone from "./components/SecondaryPhone";
import SectionNav from "./components/SectionNav";
import { useProfile } from "./hooks/useProfile";
import UrlManager from "./UrlManager";

// the sections below the header, in page order (ids are the SettingsCard ids)
const SECTIONS = [
  { id: "locations", label: "Locations", icon: Building2 },
  { id: "marketing-email", label: "Marketing email", icon: Mail },
  { id: "secondary-phone", label: "Secondary phone", icon: Phone },
  { id: "links", label: "Websites & links", icon: Link2 },
  { id: "lead-webhooks", label: "Lead webhooks", icon: Webhook },
  { id: "security", label: "Password", icon: KeyRound },
];

// Settings → Profile: who is signed in, the account's locations and links,
// and changing the password.
const Setting = () => {
  const { profile, authUser, patchProfile } = useProfile();
  const { ndid } = useTenant();

  if (!profile) {
    return (
      <div className="space-y-5" aria-busy="true" aria-label="Loading profile">
        <Skeleton className="h-64" />
        <div className="grid gap-6 lg:grid-cols-[12rem_minmax(0,1fr)]">
          <Skeleton className="hidden h-48 lg:block" />
          <div className="space-y-5">
            <Skeleton className="h-40" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  // the webhooks need the account id; without it that section is not shown
  const sections = ndid ? SECTIONS : SECTIONS.filter((s) => s.id !== "lead-webhooks");

  return (
    <div className="space-y-5 sm:space-y-6">
      <ProfileOverview profile={profile} authUser={authUser} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <SectionNav sections={sections} />

        <div className="min-w-0 space-y-5 sm:space-y-6">
          <HotelsSection
            id="locations"
            hotels={profile.hotels ?? {}}
            hotelName={profile.hotelName}
            canManage={Boolean(authUser?.isAdmin)}
            onHotelsChange={(hotels) => patchProfile({ hotels })}
          />

          <MarketingEmail
            id="marketing-email"
            profile={profile}
            onSaved={(marketingEmail) => patchProfile({ marketingEmail })}
          />

          <SecondaryPhone
            id="secondary-phone"
            profile={profile}
            onSaved={(secondaryPhone) => patchProfile({ secondaryPhone })}
          />

          <UrlManager
            id="links"
            urls={profile.urls}
            onSaved={(urls) => patchProfile({ urls })}
          />

          <LeadWebhooks id="lead-webhooks" domain={profile.domain} />

          <ChangePassword id="security" />
        </div>
      </div>
    </div>
  );
};

export default Setting;
