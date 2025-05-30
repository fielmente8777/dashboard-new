import { useState } from "react";
import { IoMdExit } from "react-icons/io";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { CreateUser } from "../../services/api/userManagement.api";

export const accessRoles = [
  "CMS",
  "Social Media",
  "Front Desk",
  "Seo Manager",
  "Theme Manager",
  "Booking Engine",
  "Reservation Desk",
  "Channel Manager",
  "Food Manager",
  "Gateway Manager",
  "Enquiries Management",
  "Meta Leads",
  "Analytics Reporting",
  "Conversational Tool",
  "Eazobot",
  "Email Marketing",
  "Lead Gen Form",
  "SMS Marketing",
  "User Management",
  "WhatsApp Marketing",
  "FrontDesk",
  "Themes Manager",
  "SEO Manager",
  "Payment Gateway",
  "GRM",
  "HRM",
];

export const accessScopeMap = {
  CMS: "cms",
  "Booking Engine": "bookingEngine",
  "Front Desk": "frontDesk",
  "Social Media": "socialMedia",
  "Enquiries Management": "enquiriesManagement",
  "Reservation Desk": "reservationDesk",
  Frontdesk: "frontDesk",
  "Channel Manager": "channelManager",
  "Seo Manager": "seoManager",
  "Food Manager": "foodManager",
  "Themes Manager": "themes",
  "Payment Gateway": "gatewayManager",
  "Leads Form": "leadgenform",
  HRM: "humanResourceManagement",
  GRM: "guestRequestManagement",
  "Analytics Reporting": "analyticsandreporting",
  "Conversational Tool": "conversationaltool",
  Eazobot: "eazobot",
  "Email Marketing": "emailmarketing",
  "SMS Marketing": "smsmarketing",
  "User Management": "usermanagement",
  "WhatsApp Marketing": "whatsappmarketing",
};

const UserMgmtPopup = ({ isOpen, onClose, accessScope, fetchData }) => {
  const { user } = useSelector((state) => state?.userProfile);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(""); // selected location

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e) => {
    const loc = e.target.value.split("-")[0];
    const disPlayLocation = e.target.value.split("-")[1];
    setCurrentLocation(disPlayLocation);

    // If not already added
    if (!selectedLocations.find((l) => l.hid === loc)) {
      setSelectedLocations((prev) => [
        ...prev,
        { hid: loc, disPlayLocation, accessScope: [] },
      ]);
    }
  };

  const toggleRole = (location, role) => {
    setSelectedLocations((prev) =>
      prev.map((entry) =>
        entry.hid === location
          ? {
              ...entry,
              accessScope: entry.accessScope.includes(role)
                ? entry.accessScope.filter((r) => r !== role)
                : [...entry.accessScope, role],
            }
          : entry
      )
    );
  };

  // Remove location function
  const removeLocation = (location) => {
    console.log(location);
    setSelectedLocations((prev) =>
      prev.filter((entry) => entry.hid !== location)
    );
    // Also reset currentLocation if it matches removed one
    if (currentLocation === location) setCurrentLocation("");
  };

  const handleSubmit = async () => {
    const { name, email, password } = form;

    const allPermissions = {
      analyticsandreporting: false,
      bookingEngine: false,
      channelManager: false,
      cms: false,
      conversationaltool: false,
      eazobot: false,
      emailmarketing: false,
      enquiriesManagement: false,
      foodManager: false,
      frontDesk: false,
      gatewayManager: false,
      guestRequestManagement: false,
      humanResourceManagement: false,
      leadgenform: false,
      reservationDesk: false,
      seoManager: false,
      smsmarketing: false,
      socialMedia: false,
      themes: false,
      usermanagement: false,
      whatsappmarketing: false,
    };

    const processedLocations = selectedLocations.map((location) => {
      const accessScope = { ...allPermissions };

      location.accessScope.forEach((scope) => {
        const key = accessScopeMap[scope];
        if (key) accessScope[key] = "true";
      });

      return {
        hid: location.hid,
        disPlayLocation: location.disPlayLocation,
        accessScope,
      };
    });

    if (!name || !email || !password || selectedLocations.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Form",
        text: "Please fill all fields and assign at least one location with roles.",
      });
      return;
    }

    const formData = {
      emailId: email,
      displayName: name,
      userName: name,
      role: "admin",
      access_id: password,
      isAdmin: false,
      assigned_location: processedLocations,
    };

    try {
      const result = await CreateUser(formData);
      if (result?.Status) {
        Swal.fire({
          icon: "success",
          title: "Created Successfully",
          text: result?.Message,
        });
        fetchData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result?.Message,
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
      className={`fixed inset-0 px-5 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div className="bg-white grid md:grid-cols-8 gap-6 rounded-2xl shadow-xl p-8 w-full md:max-w-6xl max-h-[90vh] overflow-y-auto space-y-8 relative">
        <div className="md:col-span-3 bg-gray-100 shadow-md p-3 rounded-xl">
          <div className="sticky top-0">
            <div className="max-h-96">
              <img
                src="/createForm2.svg"
                alt="form"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-5 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center border-b-2 border-dashed pb-3">
            <h2 className="text-xl text-primary font-bold">Create New User</h2>
            <button
              onClick={onClose}
              className="text-2xl font-bold text-gray-400 hover:bg-transparent size-10 rounded-full border border-slate-900 hover:text-red-700 bg-blue-900 flex items-center justify-center hover:rotate-180 duration-300"
            >
              <span className="text-white hover:text-primary">
                <IoMdExit size={22} />
              </span>
            </button>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="px-4 py-2 rounded-md bg-gray-100 border border-gray-300 focus:border-primary/50 outline-none duration-300 shadow-sm"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="px-4 py-2 rounded-md bg-gray-100 border border-gray-300 focus:border-primary/50 outline-none duration-300 shadow-sm"
            />
          </div>

          {/* Location Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="px-4 py-2 rounded-md bg-gray-100 border border-gray-300 focus:border-primary/50 outline-none duration-300 shadow-sm"
            />

            <div className="py-2 pr-2 rounded-md bg-gray-100 border border-gray-300 focus:border-primary/50 outline-none duration-300 shadow-sm">
              <select
                value={currentLocation}
                onChange={handleLocationChange}
                className="bg-transparent outline-none w-full px-3"
              >
                <option value="">Select Location</option>
                {user?.Profile?.hotels &&
                  Object.entries(user.Profile.hotels).map(([key, value]) => (
                    <option
                      key={key}
                      className="px-8 text-primary font-medium disabled:text-gray-400"
                      value={`${key}-${value?.city}`}
                      disabled={selectedLocations.some(
                        (loc) => loc.hid === key
                      )} // Disable if already selected
                    >
                      {value.city}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Roles for Each Location */}
          {selectedLocations.map((locEntry) => (
            <div
              key={locEntry.location}
              className="mt-4 border border-primary/30 p-4 rounded-md relative shadow-md shadow-black/10 space-y-2"
            >
              {/* Remove icon */}
              <button
                onClick={() => removeLocation(locEntry.hid)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-2xl"
                title="Remove Location"
              >
                &times;
              </button>

              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm mb-2 text-primary tracking-widest bg-gray-200 w-fit py-1  rounded-full pr-4 pl-2">
                  {locEntry.disPlayLocation}
                </h4>

                <span className="font-semibold text-sm mb-2 text-primary tracking-widest bg-gray-200 w-fit py-1  rounded-full pr-4 pl-2">
                  Access Control
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {accessRoles?.map((role) => {
                  if (accessScope[accessScopeMap[role]])
                    return (
                      <label key={role} className="flex gap-2 items-center">
                        <input
                          type="checkbox"
                          className="accent-lime-700"
                          checked={locEntry.accessScope.includes(role)}
                          onChange={() => toggleRole(locEntry.hid, role)}
                        />
                        {role}
                      </label>
                    );

                  return null;
                })}
              </div>
            </div>
          ))}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={handleSubmit}
              className="bg-primary rounded-full hover:bg-primary/90 text-white font-medium px-6 py-2 shadow-md"
            >
              Create User
            </button>
            <button
              onClick={onClose}
              className="border bg-gray-200 border-gray-700  text-primary font-medium hover:bg-red-700 hover:border-red-700 hover:text-white px-6 py-2 rounded-full duration-300 shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMgmtPopup;

/* <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] md:w-[60%] max-h-[90vh] overflow-y-auto">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-semibold text-[#575757]">Add User</h2>
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
      value={form.email}
      onChange={handleChange}
      className="p-2 border rounded-md outline-none placeholder-gray-500"
    />
    <input
      type="password"
      name="password"
      placeholder="Password"
      value={form.password}
      onChange={handleChange}
      className="p-2 border rounded-md outline-none placeholder-gray-500 col-span-1 md:col-span-2"
    />
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-6">
    {roles.map((role) => (
      <label key={role} className="flex items-center space-x-2 text-gray-700">
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
      Add
    </button>
    <button
      onClick={onClose}
      className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-md"
    >
      Cancel
    </button>
  </div>
</div>; */
