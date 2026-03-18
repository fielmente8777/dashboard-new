import ButtonsSettings from "./ButtonSetting";
import ListSetting from "./ListSetting";
import QuestionSettings from "./QuestionSetting";

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
    <div className="fixed w-110 h-[95vh] bg-white top-16 border-l p-4 right-0 overflow-y-auto">
      <h3 className="font-bold mb-2">Node Settings</h3>

      <p>Type: {node.type}</p>

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
    </div>
  );
}
