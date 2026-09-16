import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../../../data/constant";

const useChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const resetFields = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e) => {
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

      const response = await axios.post(
        `${BASE_URL}/eazotel/edit/password`,
        {
          token: localStorage.getItem("token"),
          oldAccessId: oldPassword,
          newAccessId: newPassword,
        }
      );

      if (response.data?.Status !== true) {
        Swal.fire({
          icon: "error",
          title: "Couldn't update",
          text: "Your current password is incorrect.",
          confirmButtonText: "OK",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Password changed",
        confirmButtonText: "OK",
      });

      resetFields();
    } catch (error) {
      console.error("Password update error:", error);

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong. Try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
};

export default useChangePassword;