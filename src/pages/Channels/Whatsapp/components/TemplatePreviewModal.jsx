import Dialog from "../../../../components/ui/Dialog";
import TemplatePreview from "./TemplatePreview";

// Shows how a template looks in WhatsApp, with Meta's example values filled in.
// `components` is the template's components.
const TemplatePreviewModal = ({ components = [], onClose }) => {
  const header = components.find((c) => c.type === "HEADER");
  const body = components.find((c) => c.type === "BODY");

  return (
    <Dialog open onClose={onClose} title="Template preview">
      <div className="flex justify-center">
        <TemplatePreview
          components={components}
          headerVariables={header?.example?.header_text || []}
          bodyVariables={body?.example?.body_text?.[0] || []}
        />
      </div>
    </Dialog>
  );
};

export default TemplatePreviewModal;
