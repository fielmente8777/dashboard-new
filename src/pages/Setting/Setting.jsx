import axios from "axios";
import React, { useState } from "react";
import { BASE_URL } from "../../data/constant";
import Swal from "sweetalert2";
import { HiOutlineEyeOff } from "react-icons/hi";
import { AiOutlineEye } from "react-icons/ai";
import Loader from "../../components/Loader";
import { useSelector } from "react-redux";
import { RiArrowDownSLine } from "react-icons/ri";
import { FaHotel } from "react-icons/fa";
import { BsPencil, BsPencilFill, BsTrash, BsTrash2 } from "react-icons/bs";
import TrashBin from "../../components/Icon/TrashBin";
import Eazobot from "../Eazobot/Eazobot";

const Tabs = ["Profile", "Chatbot"];

const Setting = () => {
  // const [formData, setFormData] = useState({
  //   name: "John Doe",
  //   email: "john@example.com",
  //   profession: "Software Engineer",
  //   currentPassword: "",
  //   newPassword: "",
  //   confirmPassword: "",
  // });

  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const toggleCurrentPassword = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const toggleNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // const handleChange = (e) => {
  //   setFormData({ ...formData, [e.target.name]: e.target.value });
  // };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();

    if (oldPassword === "" || newPassword === "" || confirmPassword === "") {
      alert("Please fill all the fields!");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${BASE_URL}/eazotel/edit/password`, {
        token: localStorage.getItem("token"),
        oldAccessId: oldPassword,
        newAccessId: newPassword,
      });

      if (response.data.Status !== true) {
        Swal.fire({
          icon: "error",
          title: "error",
          text: "Old password is incorrect!",
          confirmButtonText: "OK",
        }).then(() => {
          //   onClose(); // Close the popup after submission
        });
        setConfirmPassword("");
        setNewPassword("");
        setOldPassword("");
      } else {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Password changed successfully!",
          confirmButtonText: "OK",
        }).then(() => {
          //   onClose(); // Close the popup after submission
        });
        setConfirmPassword("");
        setNewPassword("");
        setOldPassword("");
      }

      // onClose(); // Close the popup after submission
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
      });
      // console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const [isDropDownOpen, setIsDropDownOpen] = useState(null);

  // profile info
  const { user: hotel, authUser } = useSelector((state) => state.userProfile);
  const profile = hotel?.Profile;

  if (!hotel?.Profile) return null;
  return (
    <div>
      <div className="bg-gray-100 p-5 space-y-5">
        <div className="max-w-full mx-auto bg-white p-8 grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-4">
          {/* Profile info */}

          {/* user type and email */}
          <div className="flex space-x-4">
            <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-white">
              <p className="text-lg font-semibold">
                {hotel?.Profile?.hotelName?.charAt(0).toUpperCase()}
              </p>
            </div>
            <div>
              <div className="font-semibold text-lg capitalize">
                {authUser?.userName}
              </div>
              <div className="text-sm text-gray-500 capitalize">
                Role: {authUser?.role}
              </div>
              <div className="text-sm text-gray-600">{authUser?.emailId}</div>
            </div>
          </div>
          {/* Organization */}
          <div className="space-y-1 flex gap-4">
            <h3 className="font-semibold text-gray-700">Organization:</h3>

            <div className="">
              <p className="text-gray-800 font-medium">{profile.hotelName}</p>
              <p className="text-sm text-gray-600 break-words">
                {profile.hotelDescription}{" "}
              </p>
            </div>
          </div>
          {/* Contact */}
          <div className="space-y-1">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700 ">Domain:</span>{" "}
              {profile.domain}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">Email:</span>{" "}
              {profile.hotelEmail}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">Phone:</span>{" "}
              {profile.hotelPhone}
            </p>
          </div>
          {/* Subscription */}
          <div className="space-y-1">
            <div className="flex gap-4">
              <h3 className="font-semibold text-gray-700">Subscription Plan</h3>
              <p className="text-gray-800 font-medium">{profile.plan?.name}</p>
            </div>
            <p className="text-sm text-gray-500">
              <b>Active from :</b> {profile.plan?.activationDate} to{" "}
              {profile.plan?.expiryDate}
            </p>
          </div>

          {/* <div>
              <select
                name=""
                id=""
                className="border border-gray-300 px-4 py-2"
              >
                {hotels?.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div> */}
        </div>
        {/* Hotels */}
        <div className="bg-white p-8 ">
          <div className="flex items-center  cursor-pointer">
            <div>
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-4">
                <FaHotel color="orange" className="text-2xl" />
                Hotels
              </h3>
            </div>
            <span className="ml-auto">
              {/* <RiArrowDownSLine
                  className={`${
                    isDropDownOpen === 1 ? "rotate-180 " : ""
                  } text-2xl transform transition duration-300 ease-in-out`}
                /> */}
            </span>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 `}>
            {profile.hotels &&
              Object.entries(profile.hotels).map(([hid, h]) => (
                <div
                  key={hid}
                  className="p-2 rounded-md bg-blue-50 transition relative"
                >
                  <p className="font-medium text-gray-800">{h.local}</p>
                  <p className="text-sm text-gray-500">
                    {h.city}, {h.state}, {h.country}
                  </p>
                  <p className="text-xs text-gray-400">Pin: {h.pinCode}</p>
                  {/* delete & update */}
                  <div className="absolute top-2 right-2 rounded-full flex gap-4 items-center">
                    <button className="text-gray-950 hover:text-gray-100 hover:bg-gray-600 px-1 py-1 rounded-2xl">
                      <BsPencil className="text-sm" />
                    </button>
                    <button className="">
                      {/* <BsTrash className="text-sm" /> */}
                      <TrashBin />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="max-w-full mx-auto bg-white p-8">
          {/* password change section */}
          <div className="">
            <form className={`space-y-10`} onSubmit={handleConfirmSubmit}>
              {/* Profile Info */}
              {/* <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              👤 Profile Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-600 font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-600 font-medium mb-2">
                  Profession
                </label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </section> */}

              {/* Change Password */}
              <section>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  🔑 Change Password
                </h2>

                <div
                // onClick={onClose}
                // className={`fixed cursor-pointer inset-0  bg-black bg-opacity-50 transition-opacity ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
                >
                  <div className="bg-white rounded-lg overflow-hidden w-full ">
                    <div className="flex relative flex-col justify-between mb-4">
                      {/* <button
                    // onClick={onClose}
                    className="text-[#575757]/70 absolute right-2 top-2 text-2xl hover:text-[#575757]"
                  >
                    &times;
                  </button> */}
                      {/* <div className="h-60 ">
                    <img
                      src="/3099593.jpg"
                      alt="illustration"
                      className="w-full h-full"
                    />
                  </div> */}
                      {/* <h1 className="text-3xl font-semibold">Reset Password</h1> */}
                      <div>
                        <p className="text-sm text-[#575757]/70">
                          Please kindly set your new password
                        </p>
                      </div>
                    </div>

                    <div className="p-4">
                      <div
                        // onSubmit={handleConfirmSubmit}
                        className="flex flex-col gap-4"
                      >
                        <div className="flex flex-col gap-1">
                          <label
                            htmlFor="currentPassword"
                            className="font-medium text-[#575757]/90"
                          >
                            Current Password
                          </label>
                          <div className="w-full relative">
                            <input
                              name="password"
                              type={showCurrentPassword ? "text" : "password"}
                              placeholder="Enter your current password"
                              className="p-3 rounded-lg border border-text-light  outline-none placeholder:text-gray-400 shadow-sm w-full"
                              onChange={(e) => setOldPassword(e.target.value)}
                              value={oldPassword}
                            />

                            <div className="absolute right-3 top-1/2 -translate-y-1/2 ">
                              {showCurrentPassword ? (
                                <AiOutlineEye
                                  size={20}
                                  onClick={toggleCurrentPassword}
                                  className="text-gray-400"
                                />
                              ) : (
                                <HiOutlineEyeOff
                                  size={20}
                                  onClick={toggleCurrentPassword}
                                  className="text-gray-400"
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label
                            htmlFor="newPassword"
                            className="font-medium text-[#575757]/90"
                          >
                            New Password
                          </label>
                          <div className="w-full relative">
                            <input
                              name="password"
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Enter your new password"
                              className="p-3 rounded-lg border border-text-light  outline-none placeholder:text-gray-400 shadow-sm w-full"
                              onChange={(e) => setNewPassword(e.target.value)}
                              value={newPassword}
                            />

                            <div className="absolute right-3 top-1/2 -translate-y-1/2 ">
                              {showNewPassword ? (
                                <AiOutlineEye
                                  size={20}
                                  onClick={toggleNewPassword}
                                  className="text-gray-400"
                                />
                              ) : (
                                <HiOutlineEyeOff
                                  size={20}
                                  onClick={toggleNewPassword}
                                  className="text-gray-400"
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label
                            htmlFor="confirmPassword"
                            className="font-medium text-[#575757]/90 "
                          >
                            Re-enter Password
                          </label>
                          <div className="w-full relative">
                            <input
                              name="password"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Enter your confirm password"
                              className="p-3 rounded-lg border border-text-light  outline-none placeholder:text-gray-400 shadow-sm w-full"
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              value={confirmPassword}
                            />

                            <div className="absolute right-3 top-1/2 -translate-y-1/2 ">
                              {showConfirmPassword ? (
                                <AiOutlineEye
                                  size={20}
                                  onClick={toggleConfirmPassword}
                                  className="text-gray-400"
                                />
                              ) : (
                                <HiOutlineEyeOff
                                  size={20}
                                  onClick={toggleConfirmPassword}
                                  className="text-gray-400"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          disabled={isLoading}
                          type="submit"
                          className="bg-primary/90 text-white py-2 rounded-lg hover:bg-primary transition-colors flex items-center gap-2 justify-center"
                        >
                          Confirm{" "}
                          {isLoading && <Loader size={20} color="white" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-600 font-medium mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-red-400 focus:border-red-400"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 focus:border-green-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-600 font-medium mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 focus:border-green-400"
                />
              </div>
            </div> */}
              </section>

              {/* Save Button */}
              {/* <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all"
            >
              Save Changes
            </button>
          </div> */}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
