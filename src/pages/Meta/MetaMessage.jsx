import React from "react";

const MetaMessages = () => {
  const messages = [
    {
      user: "Rahul Kumar",
      message: "Hey, can I get room availability for next week?",
      time: "2m ago",
    },
    {
      user: "Sophia Lee",
      message: "Do you offer honeymoon packages?",
      time: "1h ago",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Meta Messages</h1>

      <div className="bg-white shadow-md rounded-2xl divide-y divide-gray-100">
        {messages.map((msg) => (
          <div key={msg.user} className="p-4 hover:bg-gray-50 transition">
            <p className="font-semibold">{msg.user}</p>
            <p className="text-gray-600 text-sm">{msg.message}</p>
            <p className="text-xs text-gray-400 mt-1">{msg.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetaMessages;
