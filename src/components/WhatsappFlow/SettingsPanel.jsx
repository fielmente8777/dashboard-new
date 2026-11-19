import Drawer from "../ui/Drawer";
import ButtonsSettings from "./ButtonSetting";
import CarouselSettings from "./CarouselSettings";
import ListSetting from "./ListSetting";
import QuestionSettings from "./QuestionSetting";
import FlowSettings from "./FlowSetting";
import { blockStyle } from "./blockStyles";

// what the drawer says under the block's name
const DESCRIPTIONS = {
  button: "The message and up to 3 reply buttons the guest can tap.",
  list: "The message and the menu of options the guest picks from.",
  question: "The question and where the guest's answer is saved.",
  flow: "The message and which of your WhatsApp forms it opens.",
  carousel: "The message and the cards the guest can swipe through.",
};

export default function SettingsPanel({ node, setNode, setSelectedNode }) {
  const handleButtonCancel = () => {
    setSelectedNode(null);
  };

  const handleDataSave = (data) => {
    setNode((nodes) =>
      nodes.map((n) =>
        n.id === node.id
          ? {
              ...n,
              data,
            }
          : n,
      ),
    );

    setSelectedNode(null);
  };

  if (!node) return null;

  return (
    <Drawer
      open
      title={`Edit ${blockStyle(node.type).label.toLowerCase()} block`}
      description={DESCRIPTIONS[node.type]}
      onClose={handleButtonCancel}
    >
      {node.type === "button" && (
        <ButtonsSettings
          onSave={(data) => handleDataSave(data)}
          onCancel={() => handleButtonCancel()}
          data={node.data}
        />
      )}

      {node.type === "list" && (
        <ListSetting
          data={node.data}
          onSave={(data) => {
            handleDataSave(data);
          }}
          onCancel={() => handleButtonCancel()}
        />
      )}

      {node.type === "question" && (
        <QuestionSettings
          data={node.data}
          onSave={(data) => handleDataSave(data)}
          onCancel={() => handleButtonCancel()}
        />
      )}

      {node.type === "flow" && (
        <FlowSettings
          onSave={(data) => handleDataSave(data)}
          onCancel={() => handleButtonCancel()}
          data={node.data}
        />
      )}

      {node.type === "carousel" && (
        <CarouselSettings
          onSave={(data) => handleDataSave(data)}
          onCancel={() => handleButtonCancel()}
          data={node.data}
        />
      )}
    </Drawer>
  );
}
