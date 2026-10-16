import React, { useState } from "react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { HiOutlineEyeOff } from "react-icons/hi";
import { AiOutlineEye } from "react-icons/ai";
import { BsPencil } from "react-icons/bs";
import { FaHotel } from "react-icons/fa";
import { useChangePasswordMutation } from "../../redux/api/profileApi";
import Loader from "../../components/Loader";
import TrashBin from "../../components/Icon/TrashBin";
import UrlManager from "./UrlManager";

import ProfileOverview from "./components/ProfileOverview";
import HotelsSection from "./components/HotelsSection";
import HotelModal from "./components/HotelModal";
import ChangePassword from "./components/ChangePassword";

import useHotelManager from "./hooks/useHotelManager";

const CARD =
  "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-app-border dark:bg-app-surface";

const Setting = () => {
  const { hotel, authUser } = useSelector((state) => state.auth || {});
  const [changePassword] = useChangePasswordMutation();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const profile = hotel?.Profile;

  const {
    hotels,
    editingHotel,
    showAddHotel,
    hotelForm,
    hotelLoading,
    handleHotelChange,
    handleEditHotel,
    handleAddHotel,
    handleOpenAddHotel,
    handleCloseAddHotel,
    handleCloseHotelModal,
    handleUpdateHotel,
    handleDeleteHotel,
  } = useHotelManager(profile);

  const resetPasswordFields = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handlePasswordSubmit = async () => {
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
      const response = await changePassword({
        oldAccessId: oldPassword,
        newAccessId: newPassword,
      }).unwrap();

      if (response?.Status !== true) {
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
    <div className="space-y-4 sm:space-y-5">
      <div className={`${CARD} grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3`}>
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

        <ProfileOverview profile={profile} authUser={authUser} />

        <HotelsSection
          hotels={hotels}
          onEdit={handleEditHotel}
          onDelete={handleDeleteHotel}
          onAdd={handleOpenAddHotel}
        />
      </div>

      {showAddHotel && (
        <HotelModal
          mode="add"
          hotelForm={hotelForm}
          hotelLoading={hotelLoading}
          onChange={handleHotelChange}
          onClose={handleCloseAddHotel}
          onSave={handleAddHotel}
        />
      )}

      {editingHotel && (
        <HotelModal
          hotelForm={hotelForm}
          hotelLoading={hotelLoading}
          onChange={handleHotelChange}
          onClose={handleCloseHotelModal}
          onSave={handleUpdateHotel}
        />
      )}

      <UrlManager initialLinks={profile.urls} />

      <ChangePassword />
    </div>
  );
};

export default Setting;