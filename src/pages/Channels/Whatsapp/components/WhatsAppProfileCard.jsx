import { Camera, Pencil, Plus, Store, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import Detail from "../../../../components/ui/Detail";
import { Field, Input, Textarea } from "../../../../components/ui/Field";
import Icon from "../../../../components/ui/Icon";
import IconButton from "../../../../components/ui/IconButton";
import { useToast } from "../../../../context/ToastContext";

const MAX_IMAGE = 5 * 1024 * 1024;

const toForm = (profile) => ({
  about: profile?.about || "",
  vertical: profile?.vertical || "",
  websites: profile?.websites?.length ? [...profile.websites] : [""],
  address: profile?.address || "",
  email: profile?.email || "",
  image: null,
});

// The business profile guests see when they open the chat with the hotel.
const WhatsAppProfileCard = ({ profile, onSave, loading }) => {
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => toForm(profile));
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  // a reloaded profile replaces the form, unless the user is editing it
  useEffect(() => {
    if (!isEditing) setForm(toForm(profile));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  if (!profile) return null;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const pickImage = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE) {
      showToast({ message: "The picture must be smaller than 5 MB.", type: "error" });
      return;
    }
    setForm({ ...form, image: file });
    setPreview(URL.createObjectURL(file));
  };

  const cancel = () => {
    setIsEditing(false);
    setPreview(null);
    setForm(toForm(profile));
  };

  const save = async () => {
    await onSave?.({ ...form, websites: form.websites.map((w) => w.trim()).filter(Boolean) });
    setIsEditing(false);
    setPreview(null);
  };

  const setWebsite = (index, value) =>
    setForm({ ...form, websites: form.websites.map((w, i) => (i === index ? value : w)) });

  const picture = preview || profile.profile_picture_url;

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <Store className="size-4 text-app-text-muted" />
          Business profile
        </span>
      }
      description="What guests see when they tap your name in WhatsApp."
      actions={
        !isEditing && (
          <Button size="sm" variant="secondary" icon={Pencil} onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-5 sm:flex-row-reverse">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <button
            type="button"
            disabled={!isEditing}
            onClick={() => fileRef.current?.click()}
            className="group relative size-20 overflow-hidden rounded-full border border-app-border! bg-app-surface-secondary disabled:cursor-default"
            aria-label="Change profile picture"
          >
            {picture ? (
              <img src={picture} alt="" className="size-full object-cover" />
            ) : (
              <Icon icon={Store} size="2xl" tone="faint" className="mx-auto" />
            )}
            {isEditing && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition group-hover:opacity-100">
                <Icon icon={Camera} size="lg" />
              </span>
            )}
          </button>
          {isEditing && <p className="text-[11px] text-app-text-faint">JPG or PNG, 5 MB</p>}
          <input ref={fileRef} type="file" hidden accept="image/jpeg,image/png" onChange={pickImage} />
        </div>

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <Field label="About">
                <Textarea rows={2} maxLength={139} value={form.about} onChange={set("about")} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Email">
                  <Input type="email" value={form.email} onChange={set("email")} />
                </Field>
                <Field label="Industry">
                  <Input value={form.vertical} onChange={set("vertical")} placeholder="e.g. HOTEL" />
                </Field>
              </div>
              <Field label="Address">
                <Input value={form.address} onChange={set("address")} />
              </Field>
              <Field as="div" label="Websites">
                <div className="space-y-2">
                  {form.websites.map((site, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={site}
                        onChange={(e) => setWebsite(index, e.target.value)}
                        placeholder="https://yourhotel.com"
                      />
                      {form.websites.length > 1 && (
                        <IconButton
                          icon={X}
                          label="Remove website"
                          tone="danger"
                          onClick={() =>
                            setForm({ ...form, websites: form.websites.filter((_, i) => i !== index) })
                          }
                        />
                      )}
                    </div>
                  ))}
                  {/* WhatsApp allows two websites */}
                  {form.websites.length < 2 && (
                    <Button
                      size="sm"
                      variant="dashed"
                      icon={Plus}
                      onClick={() => setForm({ ...form, websites: [...form.websites, ""] })}
                    >
                      Add website
                    </Button>
                  )}
                </div>
              </Field>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="secondary" onClick={cancel} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={save} loading={loading}>
                  Save profile
                </Button>
              </div>
            </div>
          ) : (
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Detail label="About">{profile.about}</Detail>
              </div>
              <Detail label="Email">{profile.email}</Detail>
              <Detail label="Industry">{profile.vertical}</Detail>
              <div className="sm:col-span-2">
                <Detail label="Address">{profile.address}</Detail>
              </div>
              <div className="sm:col-span-2">
                <Detail label="Website">
                  {profile.websites?.length
                    ? profile.websites.map((site) => (
                        <a
                          key={site}
                          href={site}
                          target="_blank"
                          rel="noreferrer"
                          className="block break-all text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {site}
                        </a>
                      ))
                    : null}
                </Detail>
              </div>
            </dl>
          )}
        </div>
      </div>
    </Card>
  );
};

export default WhatsAppProfileCard;
