import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { useTenant } from "../../hooks/useTenant";
import { useSendMessageMutation } from "../../redux/api/whatsappApi";
import normalizePhone from "../../utils/normalizePhone";
import Button from "../ui/Button";
import Dialog from "../ui/Dialog";
import { Textarea } from "../ui/Field";
import Tabs from "../ui/Tabs";
import TemplateChooser from "../WhatsApp/TemplateChooser";
import {
  buildTemplatePayload,
  getTemplateDefaults,
  isTemplateFilled,
} from "../WhatsApp/templateValues";

const MODES = [
  { value: "text", label: "Message" },
  { value: "template", label: "Template" },
];

const NO_VALUES = { body: [], header: [] };

// Sends a WhatsApp message to a lead or caller: free text, or an approved
// template. `lead` needs { Contact, Name? }; `templates` are the account's
// approved templates.
const QuickResponsePopup = ({ open, setOpen, lead, templates = [] }) => {
  const { showToast } = useToast();
  const { hid } = useTenant();
  const [sendMessage, { isLoading }] = useSendMessageMutation();

  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [template, setTemplate] = useState(null);
  const [values, setValues] = useState(NO_VALUES);

  useEffect(() => {
    if (!open) return;
    setMode("text");
    setText("");
    setTemplate(null);
    setValues(NO_VALUES);
  }, [open]);

  const close = () => setOpen(false);

  const canSend =
    mode === "text"
      ? Boolean(text.trim())
      : Boolean(template) && isTemplateFilled(values);

  const handleSend = async () => {
    const phone = normalizePhone(lead.Contact);
    const payload =
      mode === "text"
        ? { phone, text: text.trim() }
        : buildTemplatePayload(phone, template, values);

    const result = await sendMessage({ hid, payload });
    if (result.data?.success) {
      showToast({ message: "Message sent" });
      close();
      return;
    }
    showToast({
      message: result.data?.responseMessage || "Could not send the message.",
      type: "error",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      size="lg"
      title={`Send a WhatsApp message${lead?.Name ? ` to ${lead.Name}` : ""}`}
      description={lead?.Contact}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button
            icon={Send}
            disabled={!canSend}
            loading={isLoading}
            onClick={handleSend}
          >
            {mode === "text" ? "Send message" : "Send template"}
          </Button>
        </>
      }
    >
      <Tabs tabs={MODES} value={mode} onChange={setMode} className="mb-4" />

      {mode === "text" && (
        <Textarea
          autoFocus
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message here..."
          aria-label="Message"
        />
      )}

      {mode === "template" && (
        <TemplateChooser
          templates={templates}
          selected={template}
          values={values}
          onSelect={(picked) => {
            setTemplate(picked);
            setValues(getTemplateDefaults(picked));
          }}
          onValuesChange={setValues}
        />
      )}
    </Dialog>
  );
};

export default QuickResponsePopup;
