import { FiX } from "react-icons/fi";
import ButtonsSettings from "./ButtonSetting";
import CarouselSettings from "./CarouselSettings";
import ListSetting from "./ListSetting";
import QuestionSettings from "./QuestionSetting";
import FlowSettings from "./FlowSetting";

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

  if (!node)
    return (
      <div className="w-64 border-l p-4">
        <p>Select a node</p>
      </div>
    );

  return (
    <div className="fixed w-110 h-[95vh] bg-white top-16 border-l p-4 right-0 overflow-y-auto z-50">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold mb-2">Node Settings</h3>
          <p>Type: {node.type}</p>
        </div>

        <FiX
          size={20}
          className="cursor-pointer text-gray-500 hover:text-black"
          onClick={handleButtonCancel}
        />
      </div>

      {node.type === "message" && (
        <textarea
          placeholder="Enter message"
          className="border w-full p-2 mt-2"
        />
      )}

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
    </div>
  );
}
