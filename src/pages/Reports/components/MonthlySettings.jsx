import { CalendarClock } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Chip from "../../../components/ui/Chip";
import { Field } from "../../../components/ui/Field";
import SettingsCard from "../../../components/ui/SettingsCard";
import { Skeleton } from "../../../components/ui/States";
import Switch from "../../../components/ui/Switch";
import TagInput from "../../../components/ui/TagInput";
import { useToast } from "../../../context/ToastContext";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { REPORT_PARTS, useGetDashboardReportSettingsQuery, useSaveDashboardReportSettingsMutation } from "../../../redux/api/reportsApi";

const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const EMAIL_RE = /^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]+$/;

// The monthly email: on the 1st (10 am India time) last month's dashboard report goes out
// with the PDF attached. This is the only report sent by itself; the Meta, Google Ads and
// other service reports are made by hand. Empty "Email to" means the hotel email and the
// account holder; no parts ticked is not allowed, all ticked means every part.
const MonthlySettings = ({ hid }) => {
  const { showToast } = useToast();
  const query = useGetDashboardReportSettingsQuery(hid, { skip: !hid });
  const [save, { isLoading: saving }] = useSaveDashboardReportSettingsMutation();
  const saved = query.data?.settings;
  const defaults = query.data?.defaults;
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (saved) setForm({ monthly: saved.monthly, emails: saved.emails ?? [], sections: saved.sections ?? REPORT_PARTS.map((p) => p.key) });
  }, [saved]);

  if (query.isLoading || !form) return <Skeleton className="h-72" />;

  const allParts = form.sections.length === REPORT_PARTS.length;
  const body = {
    monthly: form.monthly,
    emails: form.emails.length ? form.emails : null,
    sections: allParts ? null : form.sections,
  };
  const dirty = body.monthly !== saved.monthly || !same(body.emails, saved.emails) || !same(body.sections, saved.sections);
  const invalid = form.emails.filter((e) => !EMAIL_RE.test(e));
  const toggle = (key) =>
    setForm({ ...form, sections: form.sections.includes(key) ? form.sections.filter((k) => k !== key) : [...form.sections, key] });

  const submit = async () => {
    try {
      await save({ hid, ...body }).unwrap();
      showToast({ message: "Monthly report settings saved", type: "success" });
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Could not save the settings."), type: "error" });
    }
  };

  return (
    <SettingsCard
      icon={CalendarClock}
      title="Monthly report by email"
      description="On the 1st of every month at 10 am, last month's report goes out with the PDF attached."
      actions={<Switch label="Send the monthly report" checked={form.monthly} onChange={(monthly) => setForm({ ...form, monthly })} />}
      footer={
        <>
          <span>Sent while the subscription is active, to properties with enquiries that month.</span>
          <Button onClick={submit} loading={saving} disabled={!dirty || invalid.length > 0 || !form.sections.length}>
            Save
          </Button>
        </>
      }
    >
      <div className={`space-y-5 ${form.monthly ? "" : "opacity-60"}`}>
        <Field
          as="div"
          label="Email to"
          hint={
            invalid.length
              ? `Not an email address: ${invalid.join(", ")}`
              : form.emails.length
                ? "Up to 10 addresses."
                : `Empty: ${defaults?.join(", ") || "the hotel email and the account holder"}`
          }
        >
          <TagInput suggest="email" value={form.emails} onChange={(emails) => setForm({ ...form, emails: emails.slice(0, 10) })} placeholder={defaults?.[0] || "name@hotel.com"} />
        </Field>
        <Field as="div" label="In the monthly report" hint={form.sections.length ? "Parts that aren't connected show as missing in the PDF." : "Tick at least one part."}>
          <div className="flex flex-wrap gap-2">
            {REPORT_PARTS.map((p) => (
              <Chip key={p.key} selected={form.sections.includes(p.key)} onClick={() => toggle(p.key)}>
                {p.label}
              </Chip>
            ))}
          </div>
        </Field>
      </div>
    </SettingsCard>
  );
};

export default MonthlySettings;
