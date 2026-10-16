import { useEffect, useState } from "react";
import Button from "../../../../components/ui/Button";
import Dialog from "../../../../components/ui/Dialog";
import { Field, Input, Textarea } from "../../../../components/ui/Field";

const DEFAULT_TEXT = {
  header: "",
  body: "Please fill in your details below 👇",
  footer: "Powered by Eazotel",
  cta: "Fill Details",
};

// The message that goes with a form (WhatsApp flow): its text and the label
// of the button that opens the form. `flow` is the form being sent, or null
// when closed. onSend gets { header, body, footer, cta }.
const FlowDialog = ({ flow, onSend, onClose }) => {
  const [text, setText] = useState(DEFAULT_TEXT);

  useEffect(() => {
    if (flow) setText(DEFAULT_TEXT);
  }, [flow]);

  const setField = (name) => (e) => setText({ ...text, [name]: e.target.value });

  return (
    <Dialog
      open={Boolean(flow)}
      onClose={onClose}
      title={`Send form${flow ? `: ${flow.flowName}` : ""}`}
      description="The guest gets this message with a button that opens the form."
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSend(text);
        }}
      >
        <Field label="Header (optional)">
          <Input value={text.header} onChange={setField("header")} />
        </Field>
        <Field label="Message">
          <Textarea rows={3} value={text.body} onChange={setField("body")} />
        </Field>
        <Field label="Footer (optional)">
          <Input value={text.footer} onChange={setField("footer")} />
        </Field>
        <Field label="Button text">
          <Input value={text.cta} onChange={setField("cta")} />
        </Field>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!text.body.trim()}>
            Send form
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default FlowDialog;
