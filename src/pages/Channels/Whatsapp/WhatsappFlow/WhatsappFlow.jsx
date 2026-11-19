import { useState } from "react";
import FlowCard from "./FlowCard";
import FlowModal from "./FlowModal";
import FlowScreenBuilder from "./FlowScreenBuilder";
import { FLOW_TEMPLATES } from "./flowUtils";

// Create a WhatsApp flow (a form guests fill in inside WhatsApp):
// pick a template -> name it -> build its screens -> publish.
const WhatsappFlow = ({ onPublished }) => {
  const [picked, setPicked] = useState(null);
  const [flowMeta, setFlowMeta] = useState(null);

  if (flowMeta) {
    return (
      <FlowScreenBuilder
        flowMeta={flowMeta}
        onBack={() => setFlowMeta(null)}
        onPublished={onPublished}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h2 className="text-base font-semibold text-app-text">Create a WhatsApp flow</h2>
        <p className="mt-1 text-sm text-app-text-muted">
          Flows are short forms guests fill in without leaving WhatsApp. Pick a template
          to start from, then change the screens and fields to suit you.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {FLOW_TEMPLATES.map((template) => (
          <FlowCard key={template.id} data={template} onClick={setPicked} />
        ))}
      </div>

      <FlowModal
        template={picked}
        onClose={() => setPicked(null)}
        onSave={(meta) => {
          setPicked(null);
          setFlowMeta(meta);
        }}
      />
    </div>
  );
};

export default WhatsappFlow;
