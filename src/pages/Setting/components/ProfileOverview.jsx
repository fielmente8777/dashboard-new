import { CARD, META_KEY, META_VAL } from "../constants/styles";

const ProfileOverview = ({ profile, authUser }) => {
  return (
    <div
      className={`${CARD} grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3`}
    >
      {/* User */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="shrink-0 h-14 w-14 rounded-full bg-orange-100 dark:bg-app-surface flex items-center justify-center">
          <span className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-app-text-muted">
            {profile?.hotelName?.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="min-w-0">
          <p className="font-semibold text-base sm:text-lg capitalize text-gray-800 dark:text-app-text truncate">
            {authUser?.userName}
          </p>

          <p className="text-sm capitalize text-gray-500 dark:text-app-text-faint">
            Role: {authUser?.role}
          </p>

          <p className="text-sm text-gray-600 dark:text-app-text-faint break-words">
            {authUser?.emailId}
          </p>
        </div>
      </div>

      {/* Organization */}
      <div className="min-w-0">
        <h3 className={`${META_KEY} text-sm`}>
          Organization
        </h3>

        <p className="mt-1 font-medium text-gray-800 dark:text-app-text">
          {profile.hotelName}
        </p>

        <p className="mt-0.5 text-sm text-gray-600 dark:text-app-text-faint break-words">
          {profile.hotelDescription}
        </p>
      </div>

      {/* Contact */}
      <div className="min-w-0 space-y-1.5 text-sm">
        <p>
          <span className={META_KEY}>Domain: </span>
          <span className={META_VAL}>{profile.domain}</span>
        </p>

        <p>
          <span className={META_KEY}>Email: </span>
          <span className={META_VAL}>{profile.hotelEmail}</span>
        </p>

        <p>
          <span className={META_KEY}>Phone: </span>
          <span className={META_VAL}>{profile.hotelPhone}</span>
        </p>
      </div>
    </div>
  );
};

export default ProfileOverview;