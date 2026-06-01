const ChannelToggle = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-700 dark:text-app-text">{label}</span>

    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        value ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          value ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

export default ChannelToggle;
