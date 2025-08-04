import ScriptGenerator from "./ScriptGenerator";

const BotInstallStep = ({ onBack }) => {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Install Script</h2>
      <ScriptGenerator />
    </div>
  );
};

export default BotInstallStep;
