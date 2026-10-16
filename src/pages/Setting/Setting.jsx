import { Skeleton } from "../../components/ui/States";
import ChangePassword from "./components/ChangePassword";
import HotelsSection from "./components/HotelsSection";
import LeadWebhooks from "./components/LeadWebhooks";
import ProfileOverview from "./components/ProfileOverview";
import { useProfile } from "./hooks/useProfile";
import UrlManager from "./UrlManager";

// Settings → Profile: who is signed in, the account's locations and links,
// and changing the password.
const Setting = () => {
  const { profile, authUser, patchProfile } = useProfile();

  if (!profile) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading profile">
        <Skeleton className="h-32" />
        <Skeleton className="h-40" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <ProfileOverview profile={profile} authUser={authUser} />

      <HotelsSection
        hotels={profile.hotels ?? {}}
        canManage={Boolean(authUser?.isAdmin)}
        onHotelsChange={(hotels) => patchProfile({ hotels })}
      />

      <UrlManager urls={profile.urls} onSaved={(urls) => patchProfile({ urls })} />

      <LeadWebhooks domain={profile.domain} />

      <ChangePassword />
    </div>
  );
};

export default Setting;
