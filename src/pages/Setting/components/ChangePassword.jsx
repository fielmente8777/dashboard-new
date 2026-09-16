import Loader from "../../../components/Loader";
import PasswordField from "./PasswordField";
import { CARD, SECTION_TITLE } from "../constants/styles";
import useChangePassword from "../hooks/useChangePassword";

const ChangePassword = () => {
  const {
    oldPassword,
    newPassword,
    confirmPassword,

    setOldPassword,
    setNewPassword,
    setConfirmPassword,

    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,

    setShowCurrentPassword,
    setShowNewPassword,
    setShowConfirmPassword,

    isLoading,
    handleSubmit,
  } = useChangePassword();

  return (
    <div className={CARD}>
      <h3 className={SECTION_TITLE}>
        🔑 Change Password
      </h3>

      <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-app-text-faint">
        Set a new password for your account.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-5 max-w-xl space-y-4"
      >
        <PasswordField
          id="currentPassword"
          label="Current Password"
          value={oldPassword}
          onChange={setOldPassword}
          visible={showCurrentPassword}
          onToggle={() =>
            setShowCurrentPassword((v) => !v)
          }
        />

        <PasswordField
          id="newPassword"
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          visible={showNewPassword}
          onToggle={() =>
            setShowNewPassword((v) => !v)
          }
        />

        <PasswordField
          id="confirmPassword"
          label="Re-enter Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          visible={showConfirmPassword}
          onToggle={() =>
            setShowConfirmPassword((v) => !v)
          }
        />

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/90 hover:bg-primary px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
        >
          Confirm

          {isLoading && (
            <Loader size={16} color="white" />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;