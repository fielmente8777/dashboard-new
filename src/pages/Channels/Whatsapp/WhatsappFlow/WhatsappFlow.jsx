import { useState } from "react";
import FlowCard from "./FlowCard";
import FlowModal from "./FlowModal"; // your existing builder
import FlowScreenBuilder from "./FlowScreenBuilder";

const TEMPLATES = [
  {
    id: "lead",
    title: "Lead Generation",
    desc: "Request user sign up and generate leads effortlessly.",
    icon: "L",
  },
  {
    id: "feedback",
    title: "Feedback Form",
    desc: "Send feedback forms to customers and get feedback easily.",
    icon: "F",
  },
];

const WhatsappFlow = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [flowData, setFlowData] = useState(null);
  const [step, setStep] = useState("list"); // list | builder

  const handleCreate = (template) => {
    setSelectedTemplate(template);
    setShowModal(true);
  };

  const handleSaveFlow = (data) => {
    setFlowData(data);
    setStep("builder"); // ✅ go to builder
  };

  // 👉 If flow created → open builder
  if (step === "builder") {
    return <FlowScreenBuilder flowMeta={flowData} />;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">WhatsApp Flows</h1>

      <p className="text-sm text-gray-500 mb-4">TEMPLATES</p>

      <div className="flex flex-col gap-3">
        {TEMPLATES.map((item) => (
          <FlowCard key={item.id} data={item} onClick={handleCreate} />
        ))}
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
        <p>
          Select a template from above and make it your own by customising it.
        </p>
      </div>

      {/* Modal */}
      {showModal && (
        <FlowModal
          template={selectedTemplate}
          onClose={() => setShowModal(false)}
          onSave={handleSaveFlow}
        />
      )}
    </div>
  );
};

export default WhatsappFlow;
