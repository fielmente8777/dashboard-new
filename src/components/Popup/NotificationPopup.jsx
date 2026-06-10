import { MdClose } from "react-icons/md";

const notifications = [
  {
    id: 1,
    name: "nealgarg01",
    message: "sent you a message",
    time: "30 Jan 2026 04:48 PM",
  },
  {
    id: 2,
    name: "akash_147",
    message: "sent you a message",
    time: "29 Jan 2026 09:40 AM",
  },
  {
    id: 3,
    name: "soby.ai",
    message: "sent you a message",
    time: "27 Jan 2026 07:37 PM",
  },
  {
    id: 1,
    name: "nealgarg01",
    message: "sent you a message",
    time: "30 Jan 2026 04:48 PM",
  },
  {
    id: 2,
    name: "akash_147",
    message: "sent you a message",
    time: "29 Jan 2026 09:40 AM",
  },
  {
    id: 3,
    name: "soby.ai",
    message: "sent you a message",
    time: "27 Jan 2026 07:37 PM",
  },
  {
    id: 1,
    name: "nealgarg01",
    message: "sent you a message",
    time: "30 Jan 2026 04:48 PM",
  },
  {
    id: 2,
    name: "akash_147",
    message: "sent you a message",
    time: "29 Jan 2026 09:40 AM",
  },
  {
    id: 3,
    name: "soby.ai",
    message: "sent you a message",
    time: "27 Jan 2026 07:37 PM",
  },
  {
    id: 1,
    name: "nealgarg01",
    message: "sent you a message",
    time: "30 Jan 2026 04:48 PM",
  },
  {
    id: 2,
    name: "akash_147",
    message: "sent you a message",
    time: "29 Jan 2026 09:40 AM",
  },
  {
    id: 3,
    name: "soby.ai",
    message: "sent you a message",
    time: "27 Jan 2026 07:37 PM",
  },
];

export default function NotificationPopup({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed z-[99999] inset-0 bg-black/30 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[380px] bg-app-surface-secondary shadow-xl transform transition-transform duration-300 z-[99999] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shadow-2xl">
          <h2 className="text-lg font-medium">Notifications</h2>
          <button onClick={onClose}>
            <MdClose size={20} />
          </button>
        </div>

        {/* Notification List */}
        <div className="overflow-y-auto h-[calc(100%-60px)]">
          {notifications.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 p-4 border-b hover:bg-primary/60 cursor-pointer"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-primary flex items-center justify-center text-sm font-semibold">
                {item.name[0].toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{item.name}</span>{" "}
                  {item.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}