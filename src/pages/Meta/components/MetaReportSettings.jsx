import { Settings2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import SettingsCard from "../../../components/ui/SettingsCard";
import { Skeleton } from "../../../components/ui/States";
import Switch from "../../../components/ui/Switch";
import { dashboardPath, PAGES } from "../../../routes/paths";
import TagInput from "../../../components/ui/TagInput";
import { useToast } from "../../../context/ToastContext";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import {
  useGetMetaReportAdAccountsQuery,
  useGetMetaReportSettingsQuery,
  useSaveMetaReportSettingsMutation,
} from "../../../redux/api/metaReportApi";

const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

// Who gets the Meta report when Send is pressed (email with the PDF, WhatsApp), and which ad
// accounts it covers. Empty lists mean "the defaults": the hotel email and the account
// holder, the hotel phone and the second phone. The Meta report is not sent monthly: the
// monthly email is the dashboard report (Reports page), which holds the Meta slides.
const MetaReportSettings = ({ hid }) => {
  const { showToast } = useToast();
  const settingsQuery = useGetMetaReportSettingsQuery(hid, { skip: !hid });
  const accountsQuery = useGetMetaReportAdAccountsQuery(hid, { skip: !hid });
  const [save, { isLoading: saving }] = useSaveMetaReportSettingsMutation();

  const saved = settingsQuery.data?.settings;
  const defaults = settingsQuery.data?.defaults;
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (saved) {
      setForm({
        whatsapp: saved.whatsapp,
        emails: saved.emails ?? [],
        phones: saved.phones ?? [],
        adAccountIds: saved.adAccountIds,
      });
    }
  }, [saved]);

  if (settingsQuery.isLoading || !form) return <Skeleton className="h-64" />;

  const body = {
    whatsapp: form.whatsapp,
    emails: form.emails.length ? form.emails : null,
    phones: form.phones.length ? form.phones.map((p) => p.replace(/[^\d]/g, "")) : null,
    adAccountIds: form.adAccountIds?.length ? form.adAccountIds : null,
  };
  const dirty =
    body.whatsapp !== saved.whatsapp ||
    !same(body.emails, saved.emails) ||
    !same(body.phones, saved.phones) ||
    !same(body.adAccountIds, saved.adAccountIds);

  const submit = async () => {
    try {
      await save({ hid, ...body }).unwrap();
      showToast({ message: "Report settings saved", type: "success" });
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Could not save the settings."), type: "error" });
    }
  };

  const accounts = accountsQuery.data?.accounts ?? [];
  const chosen = form.adAccountIds ?? accounts.map((a) => a.id);
  const toggleAccount = (id) => {
    const next = chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id];
    // every account ticked = "all", so a new account is picked up by itself
    setForm({ ...form, adAccountIds: next.length === accounts.length ? null : next });
  };

  return (
    <SettingsCard
      icon={Settings2}
      title="Report settings"
      description="Who gets the Meta report when you press Send, and which ad accounts it covers."
      footer={
        <>
          <span>
            The monthly email is the full dashboard report, set up in{" "}
            <Link to={dashboardPath(PAGES.REPORTS)} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              Reports
            </Link>
            .
          </span>
          <Button onClick={submit} loading={saving} disabled={!dirty}>
            Save
          </Button>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Field
          as="div"
          label="Email to"
          hint={form.emails.length ? "Up to 10 addresses." : `Empty: ${defaults?.emails?.join(", ") || "the hotel email"}`}
        >
          <TagInput
            suggest="email"
            value={form.emails}
            onChange={(emails) => setForm({ ...form, emails })}
            placeholder={defaults?.emails?.[0] || "name@hotel.com"}
          />
        </Field>

        <Field
          as="div"
          label={
            <span className="flex items-center justify-between gap-2">
              WhatsApp to
              <span className="flex items-center gap-2 font-normal">
                <Switch label="Send on WhatsApp" checked={form.whatsapp} onChange={(whatsapp) => setForm({ ...form, whatsapp })} />
              </span>
            </span>
          }
          hint={
            form.phones.length
              ? "With country code, e.g. 919876543210. Up to 5 numbers."
              : `Empty: ${defaults?.phones?.join(", ") || "the hotel phone"}`
          }
        >
          <TagInput
            suggest="phone"
            value={form.phones}
            onChange={(phones) => setForm({ ...form, phones })}
            placeholder={defaults?.phones?.[0] || "919876543210"}
          />
        </Field>

        <Field
          as="div"
          label="Ad accounts in the report"
          className="lg:col-span-2"
          hint={
            accountsQuery.data?.problem ||
            "Only ad accounts that ran ads for this property's Facebook page are listed."
          }
        >
          {accountsQuery.isLoading ? (
            <Skeleton className="h-10" />
          ) : accounts.length ? (
            <div className="flex flex-wrap gap-2">
              {accounts.map((a) => (
                <label
                  key={a.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-app-border! px-3 py-2 text-sm"
                >
                  <input type="checkbox" checked={chosen.includes(a.id)} onChange={() => toggleAccount(a.id)} />
                  <span className="text-app-text">{a.name}</span>
                  <span className="text-xs text-app-text-faint">
                    {a.accountId} · {a.currency} · {a.status}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-app-text-muted">
              No ad account found for this page. The report will show the page and Instagram only.
            </p>
          )}
        </Field>
      </div>
    </SettingsCard>
  );
};

export default MetaReportSettings;
