import Dialog from "../../../../components/ui/Dialog";
import TemplatePreview from "./TemplatePreview";

// Shows how a template will look in WhatsApp. `components` is the
// template's components.
const TemplatePreviewModal = ({ components = [], onClose }) => (
  <Dialog open onClose={onClose} title="Template preview">
    <div className="flex justify-center">
      <TemplatePreview components={components} />
    </div>
  </Dialog>
);

export default TemplatePreviewModal;
