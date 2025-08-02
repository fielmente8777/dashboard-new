import React from "react";
import ColorPicker from "./ColorPicker";

const BotConfigStep = ({ onNext, onBack }) => {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Configure Bot</h2>
      {/* Select colors, fonts, position etc */}
      <ColorPicker />
    </div>
  );
};

export default BotConfigStep;
