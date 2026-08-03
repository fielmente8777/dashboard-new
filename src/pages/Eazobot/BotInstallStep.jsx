import ScriptGenerator from "./ScriptGenerator";

const BotInstallStep = ({ onBack }) => {
  return (
    <div className="px-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-600 dark:text-app-text-faint">Install Script</h2>
      <ScriptGenerator />
    </div>
  );
};

export default BotInstallStep;
