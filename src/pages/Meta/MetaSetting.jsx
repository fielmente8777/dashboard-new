import React from "react";

export default function MetaSettings() {
  const handleDisconnect = () => alert("Meta account disconnected.");

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Meta Settings</h1>
      <p className="text-gray-600">
        Manage your Facebook integration settings.
      </p>

      <div className="border p-4 rounded-md bg-gray-50">
        <p>
          Connected Page: <strong>My Business Page</strong>
        </p>
        <p>
          Token Expires: <strong>2025-12-31</strong>
        </p>
      </div>

      <button
        onClick={handleDisconnect}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
      >
        Disconnect Facebook
      </button>
    </div>
  );
}
