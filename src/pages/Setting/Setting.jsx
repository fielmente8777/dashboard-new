import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { HiOutlineEyeOff } from "react-icons/hi";
import { AiOutlineEye } from "react-icons/ai";
import { BsPencil } from "react-icons/bs";
import { FaHotel } from "react-icons/fa";
import { BASE_URL } from "../../data/constant";
import Loader from "../../components/Loader";
import TrashBin from "../../components/Icon/TrashBin";
import UrlManager from "./UrlManager";

/* shared class strings — same scale as UrlManager */
const CARD = "bg-app-surface-secondary rounded-xl p-4 sm:p-6 lg:p-8";
const SECTION_TITLE =
  "font-bold text-base sm:text-lg text-gray-800 dark:text-app-text flex items-center gap-3";
const LABEL =
  "block mb-1.5 text-sm font-medium text-gray-700 dark:text-app-text-muted";
const FIELD =
  "w-full min-w-0 rounded-lg border border-gray-300 dark:border-app-text-faint/25 bg-white dark:bg-app-surface px-3 py-2.5 pr-11 text-sm text-gray-800 dark:text-app-text-muted placeholder:text-gray-400 dark:placeholder:text-app-text-faint outline-none transition-colors focus:ring-2 focus:ring-orange-400/60 focus:border-orange-400";
const META_KEY = "font-semibold text-gray-700 dark:text-app-text-muted";
const META_VAL = "text-gray-600 dark:text-app-text-faint break-words";

const PasswordField = ({ id, label, value, onChange, visible, onToggle }) => (
  <div>
    <label htmlFor={id} className={LABEL}>
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        name={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter your ${label.toLowerCase()}`}
        autoComplete="off"
        className={FIELD}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-lg text-gray-400 dark:text-app-text-faint hover:bg-gray-100 dark:hover:bg-app-surface-secondary transition-colors"
      >
        {visible ? <AiOutlineEye size={18} /> : <HiOutlineEyeOff size={18} />}
      </button>
    </div>
  </div>
);

const Setting = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const { user: hotel, authUser } = useSelector((state) => state.userProfile);
  const profile = hotel?.Profile;

  const resetPasswordFields = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Missing details",
        text: "Fill in all three password fields.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Passwords don't match",
        text: "Your new password and confirmation are different.",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${BASE_URL}/eazotel/edit/password`, {
        token: localStorage.getItem("token"),
        oldAccessId: oldPassword,
        newAccessId: newPassword,
      });

      if (response.data?.Status !== true) {
        Swal.fire({
          icon: "error",
          title: "Couldn't update",
          text: "Your current password is incorrect.",
          confirmButtonText: "OK",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Password changed",
          confirmButtonText: "OK",
        });
      }
      resetPasswordFields();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong. Try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="bg-app-surface p-3 sm:p-5 space-y-4 sm:space-y-5">
      {/* ── identity + org + contact ─────────────────────────── */}
      <div className={`${CARD} grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3`}>
        {/* user */}
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

        {/* organization */}
        <div className="min-w-0">
          <h3 className={`${META_KEY} text-sm`}>Organization</h3>
          <p className="mt-1 font-medium text-gray-800 dark:text-app-text">
            {profile.hotelName}
          </p>
          <p className="mt-0.5 text-sm text-gray-600 dark:text-app-text-faint break-words">
            {profile.hotelDescription}
          </p>
        </div>

        {/* contact */}
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

      {/* ── hotels ───────────────────────────────────────────── */}
      <div className={CARD}>
        <h3 className={SECTION_TITLE}>
          <FaHotel color="orange" className="text-xl sm:text-2xl shrink-0" />
          Hotels
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {profile.hotels &&
            Object.entries(profile.hotels).map(([hid, h]) => (
              <div
                key={hid}
                className="relative min-w-0 rounded-lg bg-gray-100 dark:bg-app-surface p-3 pr-20 transition-colors hover:bg-gray-200/70 dark:hover:bg-app-surface/70"
              >
                <p className="font-medium text-gray-800 dark:text-app-text truncate">
                  {h.local}
                </p>
                <p className="text-sm text-gray-600 dark:text-app-text-faint break-words">
                  {h.city}, {h.state}, {h.country}
                </p>
                <p className="text-xs text-gray-500 dark:text-app-text-faint">
                  Pin: {h.pinCode}
                </p>

                <div className="absolute right-2 top-2 flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Edit ${h.local}`}
                    className="h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-app-text-faint hover:bg-white dark:hover:bg-app-surface-secondary hover:text-gray-900 dark:hover:text-app-text transition-colors"
                  >
                    <BsPencil className="text-sm" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${h.local}`}
                    className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-app-surface-secondary transition-colors"
                  >
                    <TrashBin />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ── urls ─────────────────────────────────────────────── */}
      <UrlManager initialLinks={profile.urls} />

      {/* ── password ─────────────────────────────────────────── */}
      <div className={CARD}>
        <h3 className={SECTION_TITLE}>🔑 Change Password</h3>
        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-app-text-faint">
          Set a new password for your account.
        </p>

        <form onSubmit={handleConfirmSubmit} className="mt-5 max-w-xl space-y-4">
          <PasswordField
            id="currentPassword"
            label="Current Password"
            value={oldPassword}
            onChange={setOldPassword}
            visible={showCurrentPassword}
            onToggle={() => setShowCurrentPassword((v) => !v)}
          />
          <PasswordField
            id="newPassword"
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            visible={showNewPassword}
            onToggle={() => setShowNewPassword((v) => !v)}
          />
          <PasswordField
            id="confirmPassword"
            label="Re-enter Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((v) => !v)}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/90 hover:bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-60 sm:w-auto"
          >
            Confirm
            {isLoading && <Loader size={16} color="white" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Setting;