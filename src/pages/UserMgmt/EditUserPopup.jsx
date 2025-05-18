import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
const EditUserPopup = ({
  editData,
  setEditUserData,
  isEditPopupOpen,
  onClose,
  fetchData,
}) => {
  const roles = [
    "CMS",
    "Social Media",
    "Frontdesk",
    "SEO Manager",
    "Themes Manager",
    "Booking Engine",
    "Reservation Desk",
    "Channel Manager",
    "Food Manager",
    "Gateway Manager",
  ];

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    permissions: [],
  });

  useEffect(() => {
    setForm({
      name: editData.displayName || "",
      email: editData.emailId || "",
      password: "", // optional: leave empty if not changing
      permissions: Object.entries(editData.accessScope || {})
        .filter(([_, value]) => value === true)
        .map(([key]) => {
          const roleMap = {
            cms: "CMS",
            bookingEngine: "Booking Engine",
            socialMedia: "Social Media",
            reservationDesk: "Reservation Desk",
            frontDesk: "Frontdesk",
            channelManager: "Channel Manager",
            seoManager: "SEO Manager",
            foodManager: "Food Manager",
            themes: "Themes Manager",
            gatewayManager: "Gateway Manager",
          };
          return roleMap[key];
        }),
    });
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (role) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(role)
        ? prev.permissions.filter((r) => r !== role)
        : [...prev.permissions, role],
    }));
  };

  const handleSubmit = async () => {
    const { name, email, password, permissions } = form;

    const accessScope = {
      cms: permissions.includes("CMS"),
      bookingEngine: permissions.includes("Booking Engine"),
      socialMedia: permissions.includes("Social Media"),
      reservationDesk: permissions.includes("Reservation Desk"),
      frontDesk: permissions.includes("Frontdesk"),
      channelManager: permissions.includes("Channel Manager"),
      seoManager: permissions.includes("SEO Manager"),
      foodManager: permissions.includes("Food Manager"),
      themes: permissions.includes("Themes Manager"),
      gatewayManager: permissions.includes("Gateway Manager"),
    };

    try {
      const response = await fetch(
        `https://nexon.eazotel.com/user/edit/${localStorage.getItem("token")}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailId: email,
            displayName: name,
            userName: name,
            access_id: password,
            isAdmin: false,
            accessScope: Object.fromEntries(
              Object.entries(accessScope).map(([k, v]) => [k, v.toString()])
            ),
          }),
        }
      );

      const result = await response.json();

      if (result?.Status) {
        Swal.fire({
          icon: "success",
          title: "User Info Updated",
          text: result.Message || "User has been successfully added!",
          timer: 600,
          showConfirmButton: false,
        }).then(() => {
          if (result.Status) {
            fetchData();
            setEditUserData({});
          }
        });

        setForm({
          name: "",
          email: "",
          password: "",
          permissions: [],
        });
        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "User Exists",
          text: "A user with this email already exists!",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "API Error",
        text: "User Management API error. Please try again.",
      });
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${
        isEditPopupOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] md:w-[60%] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#575757]">Edit User</h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-gray-600 hover:text-red-500"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="p-2 border rounded-md outline-none placeholder-gray-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            disabled={!!editData}
            value={form.email}
            onChange={handleChange}
            className="p-2 border rounded-md text-gray-300 outline-none placeholder-gray-500"
          />
          <input
            type="password"
            name="password"
            placeholder="New Password (optional)"
            value={form.password}
            onChange={handleChange}
            className="p-2 border rounded-md outline-none placeholder-gray-500 col-span-1 md:col-span-2"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-6">
          {roles.map((role) => (
            <label
              key={role}
              className="flex items-center space-x-2 text-gray-700"
            >
              <input
                type="checkbox"
                checked={form.permissions.includes(role)}
                onChange={() => handleCheckbox(role)}
                className="accent-blue-600"
              />
              <span>{role}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md"
          >
            Update
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserPopup;
