import { useEffect, useState } from "react";
import { getWhatsAppFlowScreens } from "../../redux/api/whatsappBusinessApi";
import CustomDropdown from "../ui/Dropdown";
import { Field, Input, Select, Textarea } from "../ui/Field";
import { charHint } from "./blockStyles";
import { SettingsFooter, SettingsSection } from "./SettingsParts";

export default function FlowSettings({ onSave, onCancel, data }) {
  const [flowIds, setFlowIds] = useState([]);
  const interactive = data?.interactive || {};

  const [header, setHeader] = useState(interactive?.header?.text || "");

  const [body, setBody] = useState(
    interactive?.body?.text || "Please fill in your details below 👇",
  );

  const [footer, setFooter] = useState(
    interactive?.footer?.text || "Powered by Eazotel",
  );

  const [flowId, setFlowId] = useState(
    interactive?.action?.parameters?.flow_id || "",
  );

  const [cta, setCta] = useState(
    interactive?.action?.parameters?.flow_cta || "Fill Details",
  );

  const [screen, setScreen] = useState(
    interactive?.action?.parameters?.flow_action_payload?.screen,
  );

  // console.log(screen);

  const handleFlowChange = (e) => {
    const selectedFlowId = e.target.value;
    setFlowId(selectedFlowId);

    const selectedFlow = flowIds.find((f) => f.value === selectedFlowId);

    if (selectedFlow?.screens?.length) {
      const firstScreen = selectedFlow.screens[0];

      const formattedScreen = firstScreen.title
        ?.trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_")
        .replace(/^_|_$/g, "");

      setScreen(formattedScreen); // ✅ dynamic
    }
  };

  const handleSave = () => {
    const flowMessage = {
      type: "interactive",
      interactive: {
        type: "flow",

        header: header
          ? {
              type: "text",
              text: header,
            }
          : undefined,

        body: {
          text: body,
        },

        footer: footer
          ? {
              text: footer,
            }
          : undefined,

        action: {
          name: "flow",
          parameters: {
            flow_message_version: "3",
            flow_id: flowId,
            flow_cta: cta,
            flow_action: "navigate",
            flow_action_payload: {
              screen,
            },
          },
        },
      },
    };

    onSave(flowMessage);
  };

  const fetchFlowsScreens = async () => {
    const response = await getWhatsAppFlowScreens();

    if (response?.success) {
      const flowScreens = response?.result?.docs?.flows || [];

      const flowIds = flowScreens?.map((flow) => {
        return {
          label: flow?.flowName,
          value: flow?.flowId,
          screens: flow.screens,
        };
      });

      setFlowIds(flowIds);
    }
  };

  useEffect(() => {
    fetchFlowsScreens();
  }, []);

  return (
    <div className="space-y-4">
      <SettingsSection title="Message">
        <Field label="Header (optional)" hint={charHint(header, 60)}>
          <Input
            value={header}
            maxLength={60}
            onChange={(e) => setHeader(e.target.value)}
          />
        </Field>

        <Field label="Body" hint={charHint(body, 1024)}>
          <Textarea
            value={body}
            maxLength={1024}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
          />
        </Field>

        <Field label="Footer (optional)" hint={charHint(footer, 60)}>
          <Input
            value={footer}
            maxLength={60}
            onChange={(e) => setFooter(e.target.value)}
          />
        </Field>
      </SettingsSection>

      <SettingsSection title="Form to open" description="One of the flows under My flows.">
        <Field as="div" label="Flow">
          <Select
            aria-label="Flow"
            value={flowId || ""}
            onChange={handleFlowChange}
            options={[
              { value: "", label: "Select a flow" },
              ...(flowIds || []).map((flow) => ({ value: flow?.value, label: flow?.label })),
            ]}
          />
        </Field>

        <Field label="Button text" hint={charHint(cta, 30)}>
          <Input
            value={cta}
            maxLength={30}
            onChange={(e) => setCta(e.target.value)}
          />
        </Field>
      </SettingsSection>

      <SettingsFooter onCancel={onCancel} onSave={handleSave} />
    </div>
  );
}
