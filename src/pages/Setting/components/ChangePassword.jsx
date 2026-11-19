import { KeyRound } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button";
import SettingsCard from "../../../components/ui/SettingsCard";
import { useApiAction } from "../../../hooks/useApiAction";
import { useChangePasswordMutation } from "../../../redux/api/profileApi";
import PasswordField from "./PasswordField";

const MIN_LENGTH = 8;
const EMPTY = { current: "", next: "", confirm: "" };
const FORM_ID = "change-password-form";

const ChangePassword = ({ id }) => {
  const run = useApiAction();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [form, setForm] = useState(EMPTY);
  // field errors show only after the first attempt
  const [submitted, setSubmitted] = useState(false);

  const set = (name) => (value) => setForm({ ...form, [name]: value });

  const errors = {
    current: !form.current && "Enter your current password.",
    next: !form.next
      ? "Enter a new password."
      : form.next.length < MIN_LENGTH
        ? `Use at least ${MIN_LENGTH} characters.`
        : form.next === form.current && "The new password must be different.",
    confirm: !form.confirm
      ? "Re-enter the new password."
      : form.confirm !== form.next && "The passwords don't match.",
  };
  const show = (field) => (submitted ? errors[field] || undefined : undefined);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return;

    // core answers { Status: false } when the current password is wrong
    const changed = await run(
      changePassword({ oldAccessId: form.current, newAccessId: form.next }),
      {
        success: "Password changed",
        error: "Your current password is incorrect.",
      },
    );
    if (changed) {
      setForm(EMPTY);
      setSubmitted(false);
    }
  };

  return (
    <SettingsCard
      id={id}
      icon={KeyRound}
      title="Password"
      description="Use a password you don't use anywhere else."
      footer={
        <>
          <span>Passwords need at least {MIN_LENGTH} characters.</span>
          <Button type="submit" form={FORM_ID} size="sm" loading={isLoading}>
            Update password
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        noValidate
        className="grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2"
      >
        <div className="md:col-span-2 md:max-w-[calc(50%-0.5rem)]">
          <PasswordField
            label="Current password"
            value={form.current}
            onChange={set("current")}
            error={show("current")}
            autoComplete="current-password"
          />
        </div>
        <PasswordField
          label="New password"
          value={form.next}
          onChange={set("next")}
          error={show("next")}
          autoComplete="new-password"
        />
        <PasswordField
          label="Confirm new password"
          value={form.confirm}
          onChange={set("confirm")}
          error={show("confirm")}
          autoComplete="new-password"
        />
      </form>
    </SettingsCard>
  );
};

export default ChangePassword;
