const TurnAwayModal = ({ isOpen, onClose, onSelect }) => {
  const turnAwayCodes = [
    "Not Interested",
    "Budget Issue",
    "Wrong Number",
    "Duplicate Lead",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-99999">
      <div className="bg-app-surface-secondary p-4 rounded-md w-80">
        <h3 className="text-lg font-semibold mb-3">Select Turn Away Code</h3>

        {turnAwayCodes.map((code) => (
          <div
            key={code}
            className="p-2 hover:bg-gray-100 cursor-pointer rounded"
            onClick={() => {
              onSelect(code);
              onClose();
            }}
          >
            {code}
          </div>
        ))}

        <button
          className="mt-3 text-sm bg-red-500 p-2 rounded-sm text-white"
          onClick={() => onClose()}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TurnAwayModal;
