// import { CARD, META_KEY, META_VAL } from "../constants/styles";

// const ProfileOverview = ({ profile, authUser }) => {
//   return (
//     <div
//       className={`${CARD} grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3`}
//     >
//       {/* User */}
//       <div className="flex items-center gap-4 min-w-0">
//         <div className="shrink-0 h-14 w-14 rounded-full bg-orange-100 dark:bg-app-surface flex items-center justify-center">
//           <span className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-app-text-muted">
//             {profile?.hotelName?.charAt(0).toUpperCase()}
//           </span>
//         </div>

//         <div className="min-w-0">
//           <p className="font-semibold text-base sm:text-lg capitalize text-gray-800 dark:text-app-text truncate">
//             {authUser?.userName}
//           </p>

//           <p className="text-sm capitalize text-gray-500 dark:text-app-text-faint">
//             Role: {authUser?.role}
//           </p>

//           <p className="text-sm text-gray-600 dark:text-app-text-faint break-words">
//             {authUser?.emailId}
//           </p>
//         </div>
//       </div>

//       {/* Organization */}
//       <div className="min-w-0">
//         <h3 className={`${META_KEY} text-sm`}>
//           Organization
//         </h3>

//         <p className="mt-1 font-medium text-gray-800 dark:text-app-text">
//           {profile.hotelName}
//         </p>

//         <p className="mt-0.5 text-sm text-gray-600 dark:text-app-text-faint break-words">
//           {profile.hotelDescription}
//         </p>
//       </div>

//       {/* Contact */}
//       <div className="min-w-0 space-y-1.5 text-sm">
//         <p>
//           <span className={META_KEY}>Domain: </span>
//           <span className={META_VAL}>{profile.domain}</span>
//         </p>

//         <p>
//           <span className={META_KEY}>Email: </span>
//           <span className={META_VAL}>{profile.hotelEmail}</span>
//         </p>

//         <p>
//           <span className={META_KEY}>Phone: </span>
//           <span className={META_VAL}>{profile.hotelPhone}</span>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default ProfileOverview;

import { useEffect, useState } from "react";
import axios from "axios";
import { CARD, META_KEY, META_VAL } from "../constants/styles";
import { NEW_BASE_URL } from "../../../data/constant";

const ProfileOverview = ({ profile, authUser, onProfileUpdate }) => {
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [marketingEmail, setMarketingEmail] = useState(
    profile?.marketingEmail || "",
  );
  const [savedEmail, setSavedEmail] = useState(profile?.marketingEmail || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const email = profile?.marketingEmail || "";
    setMarketingEmail(email);
    setSavedEmail(email);
  }, [profile?.marketingEmail]);

  const handleSave = async () => {
    const email = marketingEmail.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      const response = await axios.put(
        `${NEW_BASE_URL}/api/v1/profile/marketing-email`,
        { marketingEmail: email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updatedEmail =
        response.data?.docs?.marketingEmail ??
        response.data?.marketingEmail ??
        email;

      setMarketingEmail(updatedEmail);
      setSavedEmail(updatedEmail);
      setIsEditingEmail(false);
      setSuccess("Marketing email updated successfully.");

      onProfileUpdate?.({ marketingEmail: updatedEmail });
    } catch (err) {
      console.error("Marketing email update failed:", err);

      setError(
        err?.response?.data?.responseMessage ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to save marketing email.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setMarketingEmail(savedEmail);
    setError("");
    setIsEditingEmail(false);
  };

  return (
    <div
      className={`${CARD} grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3`}
    >
      {/* User */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="shrink-0 h-14 w-14 rounded-full bg-orange-100 dark:bg-app-surface flex items-center justify-center">
          <span className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-app-text-muted">
            {profile?.hotelName?.charAt(0)?.toUpperCase() || "H"}
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
        <h3 className={`${META_KEY} text-sm`}>Organization</h3>
        <p className="mt-1 font-medium text-gray-800 dark:text-app-text">
          {profile?.hotelName}
        </p>
        <p className="mt-0.5 text-sm text-gray-600 dark:text-app-text-faint break-words">
          {profile?.hotelDescription}
        </p>
      </div>

      {/* Contact */}
      <div className="min-w-0 space-y-1.5 text-sm">
        <p className="break-words">
          <span className={META_KEY}>Domain: </span>
          <span className={META_VAL}>{profile?.domain}</span>
        </p>

        <p className="break-words">
          <span className={META_KEY}>Email: </span>
          <span className={META_VAL}>{profile?.hotelEmail}</span>
        </p>

        <p className="break-words">
          <span className={META_KEY}>Phone: </span>
          <span className={META_VAL}>{profile?.hotelPhone}</span>
        </p>

        {/* Marketing Email */}
        <div className="pt-3">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="marketingEmail" className={META_KEY}>
              Marketing Email
            </label>

            {!isEditingEmail && (
              <button
                type="button"
                onClick={() => {
                  setMarketingEmail(savedEmail);
                  setError("");
                  setSuccess("");
                  setIsEditingEmail(true);
                }}
                className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
              >
                Edit
              </button>
            )}
          </div>

          {isEditingEmail ? (
            <div className="mt-2 space-y-2">
              <input
                id="marketingEmail"
                type="email"
                value={marketingEmail}
                onChange={(e) => {
                  setMarketingEmail(e.target.value);
                  setError("");
                }}
                placeholder="Enter marketing email"
                required
                disabled={isSaving}
                className="w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-gray-700 dark:bg-app-surface dark:text-app-text"
              />

              {error && (
                <p role="alert" className="text-xs text-red-500">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60 dark:border-gray-700 dark:text-app-text"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 break-words text-gray-600 dark:text-app-text-faint">
              {savedEmail || "Not configured"}
            </p>
          )}

          {success && !isEditingEmail && (
            <p role="status" className="mt-2 text-xs text-green-600">
              {success}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;
