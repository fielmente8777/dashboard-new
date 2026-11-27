import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Chip from "../../../components/ui/Chip";
import Dialog from "../../../components/ui/Dialog";
import { Field } from "../../../components/ui/Field";
import TagInput from "../../../components/ui/TagInput";
import { useToast } from "../../../context/ToastContext";
import { getApiErrorMessage } from "../../../redux/api/baseApi";
import { partLabel, useGetDashboardReportSettingsQuery, useSendDashboardReportMutation } from "../../../redux/api/reportsApi";

const EMAIL_RE = /^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]+$/;

// Email a saved report now: to the addresses typed here (prefilled with the usual
// recipients), the whole report or only some parts. The PDF is attached.
const EmailReportDialog = ({ hid, report, onClose }) => {
  const { showToast } = useToast();
  const settings = useGetDashboardReportSettingsQuery(hid, { skip: !hid || !report });
  const [send, { isLoading }] = useSendDashboardReportMutation();
  const [emails, setEmails] = useState([]);
  const [parts, setParts] = useState([]);

  useEffect(() => {
    if (!report) return;
    setParts(report.sections || []);
    setEmails(settings.data?.recipients || []);
  }, [report, settings.data]);

  const invalid = emails.filter((e) => !EMAIL_RE.test(e));
  const toggle = (key) => setParts((now) => (now.includes(key) ? now.filter((k) => k !== key) : [...now, key]));

  const submit = async () => {
    try {
      const result = await send({ id: report._id, emails, parts: parts.length === report.sections.length ? null : parts }).unwrap();
      const failed = result?.failed?.length;
      showToast({
        message: failed ? `Sent to ${result.to.length}; ${failed} address${failed === 1 ? "" : "es"} failed.` : `Report sent to ${result?.to?.length || emails.length} address${(result?.to?.length || emails.length) === 1 ? "" : "es"}.`,
        type: failed ? "warning" : "success",
      });
      onClose();
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Could not send the report."), type: "error" });
    }
  };

  return (
    <Dialog
      open={Boolean(report)}
      onClose={isLoading ? () => {} : onClose}
      title="Email this report"
      description={report ? `${report.period?.label} · the PDF goes as an attachment` : ""}
      sheetOnPhone
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button icon={Send} onClick={submit} loading={isLoading} disabled={!emails.length || invalid.length > 0 || !parts.length}>
            Send
          </Button>
        </>
      }
    >
      {report && (
        <div className="space-y-5">
          <Field
            as="div"
            label="Send to"
            hint={invalid.length ? `Not an email address: ${invalid.join(", ")}` : "Press Enter after each address. Up to 10."}
          >
            <TagInput suggest="email" value={emails} onChange={(next) => setEmails(next.slice(0, 10))} placeholder="name@hotel.com" />
          </Field>
          {report.sections?.length > 1 && (
            <Field as="div" label="What to send" hint="Untick a part to leave it out of the PDF.">
              <div className="flex flex-wrap gap-2">
                {report.sections.map((key) => (
                  <Chip key={key} selected={parts.includes(key)} onClick={() => toggle(key)}>
                    {partLabel(key)}
                  </Chip>
                ))}
              </div>
            </Field>
          )}
        </div>
      )}
    </Dialog>
  );
};

export default EmailReportDialog;
