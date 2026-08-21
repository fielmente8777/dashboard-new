import { useEffect, useRef, useState } from "react";
import { FiEdit2, FiUser, FiX } from "react-icons/fi";
import Loader from "../../../../components/Loader";
import { useToast } from "../../../../context/ToastContext";

const FIELD =
  "w-full min-w-0 rounded-[var(--r-sm)] border border-app-border bg-app-surface px-[var(--sp-2)] py-1 text-[length:var(--fs-sm)] text-app-text placeholder:text-app-text-faint outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30";
const LABEL =
  "text-[length:var(--fs-xs)] text-gray-500 dark:text-app-text-faint";
const VALUE =
  "text-[length:var(--fs-sm)] text-gray-700 dark:text-app-text-muted break-words";

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
    <div className="bg-app-surface shadow-sm p-[var(--sp-4)] space-y-[var(--sp-4)] relative">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-[var(--sp-3)]">
        <h3 className="font-semibold text-gray-800 dark:text-app-text-muted text-[length:var(--fs-base)]">
          WhatsApp Business Profile
        </h3>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1 text-[length:var(--fs-sm)] border border-app-border text-primary dark:text-app-text hover:bg-primary hover:text-white hover:border-primary px-[var(--sp-4)] py-[var(--sp-1)] rounded-[var(--r-sm)] transition-colors shadow-sm"
        >
          <FiEdit2 />
          <span>Edit</span>
        </button>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between gap-[var(--sp-5)] lg:gap-[var(--sp-6)]">
        <div className="flex-1 min-w-0">
          {/* VIEW MODE */}
          {!isEditing && (
            <div className="space-y-2">
              <div>
                <p className={LABEL}>About</p>
                <p className={VALUE}>{profile.about || "—"}</p>
              </div>

              <div>
                <p className={LABEL}>Email</p>
                <p className={VALUE}>{profile.email || "—"}</p>
              </div>

              <div>
                <p className={LABEL}>Address</p>
                <p className={VALUE}>{profile.address || "—"}</p>
              </div>

              <div>
                <p className={LABEL}>Industry</p>
                <p className={VALUE}>{profile.vertical || "—"}</p>
              </div>

              {/* ✅ Websites View */}
              <div>
                <p className={LABEL}>Website</p>
                {profile.websites?.length > 0 ? (
                  profile.websites.map((site, i) => (
                    <a
                      key={i}
                      href={site}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[length:var(--fs-sm)] text-blue-600 dark:text-blue-400 hover:underline block break-all"
                    >
                      {site}
                    </a>
                  ))
                ) : (
                  <p className={VALUE}>—</p>
                )}
              </div>

              <div>
                <p className={LABEL}>Platform</p>
                <p className={`${VALUE} capitalize`}>
                  {profile.messaging_product || "—"}
                </p>
              </div>
            </div>
          )}

          {/* EDIT MODE */}
          {isEditing && (
            <div className="space-y-[var(--sp-3)]">
              <div>
                <label className={LABEL}>About</label>
                <textarea
                  name="about"
                  value={form.about}
                  rows={3}
                  onChange={handleChange}
                  className={`${FIELD} resize-y`}
                />
              </div>

              <div>
                <label className={LABEL}>Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={FIELD}
                />
              </div>

              <div>
                <label className={LABEL}>Address</label>
                <input
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleChange}
                  className={FIELD}
                />
              </div>

              <div>
                <label className={LABEL}>Industry</label>
                <input
                  name="vertical"
                  value={form.vertical}
                  onChange={handleChange}
                  className={FIELD}
                />
              </div>

              {/* ✅ Websites Edit */}
              <div>
                <label className={LABEL}>Websites</label>

                <div className="space-y-2">
                  {form.websites.map((site, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        value={site}
                        onChange={(e) =>
                          handleWebsiteChange(index, e.target.value)
                        }
                        className={FIELD}
                        placeholder="https://example.com"
                      />

                      <button
                        type="button"
                        aria-label="Remove website"
                        onClick={() => handleRemoveWebsite(index)}
                        className="shrink-0 text-red-500 hover:bg-red-500 hover:text-white bg-red-100 dark:bg-red-500/20 dark:text-red-400 rounded-full size-6 flex justify-center items-center transition-colors"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddWebsite}
                  className="text-primary dark:text-app-text-muted text-[length:var(--fs-xs)] px-1 hover:underline mt-2"
                >
                  + Add Website
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary/90 text-white px-[var(--sp-3)] py-[var(--sp-1)] rounded-[var(--r-sm)] text-[length:var(--fs-sm)] flex items-center gap-2 transition-colors disabled:opacity-60"
                >
                  Save {loading && <Loader color="#fefefe" size={12} />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-app-surface-secondary border border-app-border text-app-text px-[var(--sp-3)] py-[var(--sp-1)] rounded-[var(--r-sm)] text-[length:var(--fs-sm)] hover:bg-app-surface transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div
            onClick={() => isEditing && fileRef.current.click()}
            className={`w-20 h-20 rounded-full border border-app-border bg-app-surface-secondary flex items-center justify-center overflow-hidden ${
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
              <FiUser
                size={28}
                className="text-gray-400 dark:text-app-text-faint"
              />
            )}
          </div>

          {isEditing && (
            <p className="text-[length:var(--fs-xs)] text-gray-500 dark:text-app-text-faint">
              Click to change
            </p>
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