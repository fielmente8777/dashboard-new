import { MapPin, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import Dialog from "../../components/ui/Dialog";
import { Field, Input, Select } from "../../components/ui/Field";
import Icon from "../../components/ui/Icon";
import IconButton from "../../components/ui/IconButton";
import { useApiAction } from "../../hooks/useApiAction";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../../redux/api/usersApi";
import {
  NO_PERMISSIONS,
  accessRoles,
  accessScopeMap,
  isGranted,
} from "./userAccess";

const EMPTY_FORM = { name: "", phone: "", email: "", password: "" };

// Adds a team member, or edits one (`user` given). A user is given access
// location by location: for each location, the areas they may use.
//   accessScope - the signed-in user's own access; only areas they have
//                 themselves can be given to someone else
//   onSaved()   - called after a successful save
const UserFormDialog = ({ open, user, accessScope, onClose, onSaved }) => {
  const run = useApiAction();
  const hotels = useSelector((state) => state.userProfile.user?.Profile?.hotels);
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const isEdit = Boolean(user);

  const [form, setForm] = useState(EMPTY_FORM);
  // [{ hid, disPlayLocation, accessScope: { [permission]: granted } }]
  const [locations, setLocations] = useState([]);

  // start from the user's values (or empty) every time the dialog opens
  useEffect(() => {
    if (!open) return;
    setForm({
      name: user?.displayName || "",
      phone: user?.phone || "",
      email: user?.emailId || "",
      password: "",
    });
    setLocations(
      Array.isArray(user?.assigned_location) ? user.assigned_location : [],
    );
  }, [open, user]);

  const setField = (name) => (e) => setForm({ ...form, [name]: e.target.value });

  const grantableRoles = accessRoles.filter(
    (role) => accessScope?.[accessScopeMap[role]],
  );

  const locationOptions = [
    { value: "", label: "Add a location..." },
    ...Object.entries(hotels || {})
      .filter(([hid]) => !locations.some((item) => String(item.hid) === hid))
      .map(([hid, hotel]) => ({ value: hid, label: hotel.city || hid })),
  ];

  const addLocation = (hid) => {
    if (!hid) return;
    setLocations([
      ...locations,
      {
        hid,
        disPlayLocation: hotels[hid]?.city,
        accessScope: { ...NO_PERMISSIONS },
      },
    ]);
  };

  const toggleRole = (hid, role) => {
    const key = accessScopeMap[role];
    setLocations(
      locations.map((item) =>
        item.hid === hid
          ? {
              ...item,
              accessScope: {
                ...item.accessScope,
                // new users are stored with "true"; edits with a boolean
                [key]: isGranted(item.accessScope?.[key])
                  ? false
                  : isEdit || "true",
              },
            }
          : item,
      ),
    );
  };

  const canSave =
    form.name.trim() &&
    form.phone.trim() &&
    form.email.trim() &&
    (isEdit || form.password) &&
    locations.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = {
      emailId: form.email.trim(),
      phone: form.phone.trim(),
      displayName: form.name.trim(),
      userName: form.name.trim(),
      role: "admin",
      access_id: form.password,
      isAdmin: false,
      assigned_location: locations,
    };

    const saved = await run(isEdit ? updateUser(body) : createUser(body), {
      success: isEdit ? "User updated" : "User created",
      error: "Could not save the user.",
    });
    if (!saved) return;

    onSaved?.();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={isEdit ? "Edit user" : "Add user"}
      description="Choose the locations this person works on and what they can use in each."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input autoFocus value={form.name} onChange={setField("name")} />
          </Field>
          <Field label="Phone number">
            <Input type="tel" value={form.phone} onChange={setField("phone")} />
          </Field>
          <Field
            label="Email"
            hint={isEdit ? "The email cannot be changed." : undefined}
          >
            <Input
              type="email"
              disabled={isEdit}
              value={form.email}
              onChange={setField("email")}
            />
          </Field>
          <Field
            label="Password"
            hint={isEdit ? "Leave empty to keep the current one." : undefined}
          >
            <Input
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={setField("password")}
            />
          </Field>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-app-text">
              Locations and access
            </h3>
            {locationOptions.length > 1 && (
              <div className="w-56">
                <Select
                  aria-label="Add a location"
                  value=""
                  onChange={(e) => addLocation(e.target.value)}
                  options={locationOptions}
                />
              </div>
            )}
          </div>

          {locations.length === 0 && (
            <p className="rounded-lg border border-dashed border-app-border! px-4 py-6 text-center text-sm text-app-text-muted">
              Add at least one location for this user.
            </p>
          )}

          {locations.map((location) => (
            <div
              key={location.hid}
              className="rounded-lg border border-app-border! p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-app-text">
                  <Icon icon={MapPin} tone="muted" />
                  <span className="truncate">
                    {location.disPlayLocation ||
                      hotels?.[location.hid]?.city ||
                      location.hid}
                  </span>
                </p>
                <IconButton
                  icon={Trash2}
                  label="Remove this location"
                  tone="danger"
                  onClick={() =>
                    setLocations(
                      locations.filter((item) => item.hid !== location.hid),
                    )
                  }
                />
              </div>

              <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2 md:grid-cols-3">
                {grantableRoles.map((role) => (
                  <label
                    key={role}
                    className="flex cursor-pointer items-center gap-2 text-sm text-app-text"
                  >
                    <input
                      type="checkbox"
                      className="size-4 cursor-pointer accent-primary"
                      checked={isGranted(
                        location.accessScope?.[accessScopeMap[role]],
                      )}
                      onChange={() => toggleRole(location.hid, role)}
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!canSave}
            loading={isCreating || isUpdating}
          >
            {isEdit ? "Save changes" : "Create user"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default UserFormDialog;
