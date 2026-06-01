import { useEffect, useRef, useState } from "react";
import { FiEdit2, FiUser, FiX } from "react-icons/fi";
import Loader from "../../../../components/Loader";
import { useToast } from "../../../../context/ToastContext";

const WhatsAppProfileCard = ({ profile, onSave, loading }) => {
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    about: profile?.about || "",
    vertical: profile?.vertical || "",
    websites: profile?.websites?.length ? profile.websites : [""], // ✅ array
    address: profile?.address || "",
    email: profile?.email || "",
    image: null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 📸 Handle image select
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    console.log(file.size);

    if (file.size > MAX_SIZE) {
      // 👉 show toast (adjust based on your toast library)
      console.log("aaya");
      showToast({
        message: "Image size should be less than 5MB",
        type: "error",
      });

      e.target.value = ""; // reset input
      return;
    }

    setForm({ ...form, image: file });
    setPreview(URL.createObjectURL(file));
  };

  //  Save
  const handleSave = async () => {
    const payload = {
      ...form,
      websites: form.websites.filter(Boolean), // ✅ clean empty
    };

    onSave && (await onSave(payload));
    setIsEditing(false);
  };

  //  Add website
  const handleAddWebsite = () => {
    setForm({ ...form, websites: [...form.websites, ""] });
  };

  //  Remove website
  const handleRemoveWebsite = (index) => {
    const updated = form.websites.filter((_, i) => i !== index);
    setForm({ ...form, websites: updated });
  };

  //  Change website
  const handleWebsiteChange = (index, value) => {
    const updated = [...form.websites];
    updated[index] = value;
    setForm({ ...form, websites: updated });
  };

  useEffect(() => {
    if (!isEditing) {
      setPreview(null);
      setForm({
        about: profile?.about || "",
        vertical: profile?.vertical || "",
        websites: profile?.websites?.length ? profile.websites : [""],
        address: profile?.address || "",
        email: profile?.email || "",
        image: null,
      });
    }
  }, [profile]);

  if (!profile) return null;

  return (
    <div className="bg-app-surface-secondary shadow-sm p-4 space-y-4 relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 dark:text-app-text-muted text-base">
          WhatsApp Business Profile
        </h3>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1 text-sm border border-primary/60! text-primary dark:text-app-text-faint hover:bg-primary hover:text-white  px-4 py-1 rounded-sm duration-300 shadow-md"
        >
          <FiEdit2 />
          <span>Edit</span>
        </button>
      </div>

      <div className="flex justify-between gap-20">
        <div className="flex-1">
          {/* VIEW MODE */}
          {!isEditing && (
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">About</p>
                <p className="text-sm text-gray-700 dark:text-app-text-faint">{profile.about || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm text-gray-700 dark:text-app-text-faint">{profile.email || "—"}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-sm text-gray-700 dark:text-app-text-faint">
                  {profile.address || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Industry</p>
                <p className="text-sm text-gray-700 dark:text-app-text-faint">
                  {profile.vertical || "—"}
                </p>
              </div>

              {/* ✅ Websites View */}
              <div>
                <p className="text-xs text-gray-500">Website</p>
                {profile.websites?.length > 0 ? (
                  profile.websites.map((site, i) => (
                    <a
                      key={i}
                      href={site}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:underline block"
                    >
                      {site}
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-gray-700 dark:text-app-text-faint">—</p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500">Platform</p>
                <p className="text-sm text-gray-700 dark:text-app-text-faint capitalize">
                  {profile.messaging_product || "—"}
                </p>
              </div>
            </div>
          )}

          {/* EDIT MODE */}
          {isEditing && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-app-text-faint">About</label>
                <textarea
                  name="about"
                  value={form.about}
                  rows={3}
                  onChange={handleChange}
                  className="w-full border rounded-md px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-app-text-faint">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border rounded-md px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-app-text-faint">Address</label>
                <input
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full border rounded-md px-2 py-1 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 dark:text-app-text-faint">Industry</label>
                <input
                  name="vertical"
                  value={form.vertical}
                  onChange={handleChange}
                  className="w-full border rounded-md px-2 py-1 text-sm"
                />
              </div>

              {/* ✅ Websites Edit */}
              <div>
                <label className="text-xs text-gray-500 dark:text-app-text-faint">Websites</label>

                <div className="space-y-2">
                  {form.websites.map((site, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        value={site}
                        onChange={(e) =>
                          handleWebsiteChange(index, e.target.value)
                        }
                        className="w-full border rounded-md px-2 py-1 text-sm"
                        placeholder="https://example.com"
                      />

                      <button
                        onClick={() => handleRemoveWebsite(index)}
                        className="text-red-500 hover:bg-red-500 hover:text-white duration-300 bg-red-200 rounded-full size-4 flex justify-center items-center text-xs"
                      >
                        <FiX size={10} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddWebsite}
                  className="text-primary dark:text-app-text-faint text-xs px-1 hover:underline mt-2 duration-300"
                >
                  + Add Website
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  disabled={loading}
                  onClick={handleSave}
                  className="bg-primary text-white px-3 py-1 rounded-md text-sm flex items-center gap-2 disabled:opacity-60 "
                >
                  Save {loading && <Loader color="#fefefe" size={12} />}
                </button>

                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-200 px-3 py-1 rounded-md text-sm dark:bg-app-text-faint dark:text-app-surface-secondary duration-300 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-2">
          <div
            onClick={() => isEditing && fileRef.current.click()}
            className={`w-20 h-20 rounded-full border flex items-center justify-center overflow-hidden ${
              isEditing ? "cursor-pointer hover:opacity-80" : ""
            }`}
          >
            {preview ? (
              <img
                src={preview}
                className="w-full h-full object-cover"
                alt="preview"
              />
            ) : profile?.profile_picture_url ? (
              <img
                src={profile.profile_picture_url}
                className="w-full h-full object-cover"
                alt="profile"
              />
            ) : (
              <FiUser size={28} className="text-gray-400" />
            )}
          </div>

          {isEditing && (
            <p className="text-xs text-gray-500">Click to change</p>
          )}

          <input
            type="file"
            ref={fileRef}
            className="hidden"
            accept="image/jpeg, image/png, image/jpg"
            onChange={handleImageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default WhatsAppProfileCard;

// const WhatsAppProfileCard = ({ profile }) => {
//   if (!profile) return null;

//   return (
//     <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
//       <h3 className="font-semibold text-gray-800 text-base">
//         WhatsApp Business Profile
//       </h3>

//       {/* Profile Image */}
//       {profile?.profile_picture_url && (
//         <div className="flex justify-center">
//           <img
//             src={profile.profile_picture_url}
//             alt="profile"
//             className="w-20 h-20 rounded-full object-cover border"
//           />
//         </div>
//       )}

//       {/* About */}
//       <div>
//         <p className="text-xs text-gray-500">About</p>
//         <p className="text-sm text-gray-700">{profile.about || "—"}</p>
//       </div>

//       {/* Industry */}
//       <div>
//         <p className="text-xs text-gray-500">Industry</p>
//         <p className="text-sm text-gray-700">{profile.vertical || "—"}</p>
//       </div>

//       {/* Websites */}
//       <div>
//         <p className="text-xs text-gray-500">Website</p>
//         {profile.websites?.length > 0 ? (
//           profile.websites.map((site, i) => (
//             <a
//               key={i}
//               href={site}
//               target="_blank"
//               rel="noreferrer"
//               className="text-sm text-blue-600 hover:underline block"
//             >
//               {site}
//             </a>
//           ))
//         ) : (
//           <p className="text-sm text-gray-700">—</p>
//         )}
//       </div>

//       {/* Messaging Product */}
//       <div>
//         <p className="text-xs text-gray-500">Platform</p>
//         <p className="text-sm text-gray-700 capitalize">
//           {profile.messaging_product || "—"}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default WhatsAppProfileCard;
