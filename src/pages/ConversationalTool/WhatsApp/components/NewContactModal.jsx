import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import TemplateChooser from "../../../../components/WhatsApp/TemplateChooser";
import {
  buildTemplatePayload,
  getTemplateDefaults,
  isTemplateFilled,
} from "../../../../components/WhatsApp/templateValues";
import Button from "../../../../components/ui/Button";
import Dialog from "../../../../components/ui/Dialog";
import {
  Field,
  Input,
  inputClassName,
} from "../../../../components/ui/Field";
import { useToast } from "../../../../context/ToastContext";
import { countriesCode } from "../../../../data/constant";
import { useTenant } from "../../../../hooks/useTenant";
import { useSendMessageMutation } from "../../../../redux/api/whatsappApi";

const DEFAULT_COUNTRY_CODE = "+91";
const NO_VALUES = { body: [], header: [] };

// Starts a conversation with a number that has not written yet. WhatsApp
// only allows that with an approved template. onClose(sent) gets true when
// the message went out.
const NewContactModal = ({ open, templates = [], loading, onClose }) => {
  const { showToast } = useToast();
  const { hid } = useTenant();
  const [sendMessage, { isLoading }] = useSendMessageMutation();

  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [phone, setPhone] = useState("");
  const [template, setTemplate] = useState(null);
  const [values, setValues] = useState(NO_VALUES);

  useEffect(() => {
    if (!open) return;
    setCountryCode(DEFAULT_COUNTRY_CODE);
    setPhone("");
    setTemplate(null);
    setValues(NO_VALUES);
  }, [open]);

  const canSend =
    phone.length >= 6 && Boolean(template) && isTemplateFilled(values);

  const handleSend = async () => {
    const number = `${countryCode.replace(/\D/g, "")}${phone}`;
    const result = await sendMessage({
      hid,
      payload: buildTemplatePayload(number, template, values),
    });

    if (result.data?.success) {
      showToast({ message: "Message sent" });
      onClose(true);
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
      onClose={() => onClose(false)}
      size="lg"
      title="Message a new number"
      description="The first message to a new number must be an approved template."
      footer={
        <>
          <Button variant="secondary" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <Button
            icon={Send}
            disabled={!canSend}
            loading={isLoading}
            onClick={handleSend}
          >
            Send message
          </Button>
        </>
      }
    >
      <Field label="Phone number" as="div" className="mb-4">
        {/* the wrappers set the widths: the field style itself is full width */}
        <div className="flex gap-2">
          <div className="w-32 shrink-0">
            <select
              aria-label="Country code"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className={inputClassName}
            >
              {countriesCode.map((country) => (
                <option key={country.name} value={country.code}>
                  {country.name} ({country.code})
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0 flex-1">
            <Input
              autoFocus
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="Phone number"
            />
          </div>
        </div>
      </Field>

      {loading ? (
        <p className="py-8 text-center text-sm text-app-text-muted">
          Loading templates...
        </p>
      ) : (
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

export default NewContactModal;
