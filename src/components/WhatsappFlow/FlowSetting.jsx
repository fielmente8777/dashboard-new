import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { getWhatsAppFlowScreens } from "../../services/api/whatsApp";
import CustomDropdown from "../ui/Dropdown";

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

  console.log(screen);

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
    <div className="bg-white w-full rounded-lg shadow-lg p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Set Flow</h2>
        <FiX className="cursor-pointer" onClick={onCancel} />
      </div>

      {/* Header */}
      <div className="mb-4">
        <label className="text-sm">Header</label>
        <input
          value={header}
          maxLength={60}
          onChange={(e) => setHeader(e.target.value)}
          className="border rounded w-full p-2 mt-1"
        />
      </div>

      {/* Body */}
      <div className="mb-4">
        <label className="text-sm">Body *</label>
        <textarea
          value={body}
          maxLength={1024}
          onChange={(e) => setBody(e.target.value)}
          className="border rounded w-full p-2 mt-1"
          rows={4}
        />
      </div>

      {/* Footer */}
      <div className="mb-4">
        <label className="text-sm">Footer</label>
        <input
          value={footer}
          maxLength={60}
          onChange={(e) => setFooter(e.target.value)}
          className="border rounded w-full p-2 mt-1"
        />
      </div>

      {/* Flow ID */}
      <div className="mb-4 flex flex-col ">
        <label className="text-sm">Flow ID *</label>

        <select
          onChange={handleFlowChange}
          className="border rounded w-full p-2 mt-1"
        >
          <option value="">Select a flow</option>
          {flowIds?.map((flow) => (
            <option value={flow?.value}>{flow?.label}</option>
          ))}
        </select>
      </div>

      {/* CTA */}
      <div className="mb-4">
        <label className="text-sm">CTA Button Text</label>
        <input
          value={cta}
          maxLength={30}
          onChange={(e) => setCta(e.target.value)}
          className="border rounded w-full p-2 mt-1"
        />
      </div>

      {/* Screen */}
      {/* <div className="mb-5">
        <label className="text-sm">Start Screen</label>
        <input
          value={screen}
          onChange={(e) => setScreen(e.target.value)}
          className="border rounded w-full p-2 mt-1"
        />
      </div> */}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="border px-4 py-2 rounded">
          Cancel
        </button>

        <button
          onClick={handleSave}
          className="bg-green-500 text-white px-5 py-2 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
}
