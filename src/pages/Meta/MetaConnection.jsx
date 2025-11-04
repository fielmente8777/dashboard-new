import axios from "axios";
import React, { useState } from "react";
import { FaFacebook } from "react-icons/fa";
import { NEW_BASE_URL } from "../../data/constant";

export default function MetaConnections() {
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    try {
      //   const { data } = await axios.get(
      //     `${NEW_BASE_URL}/api/v1/auth/meta/start`
      //   );

      //   console.log(data);

      window.open(`${NEW_BASE_URL}/api/v1/auth/meta/start`, "MetaConnect");

      // setConnected(true);
    } catch (error) {
      // console.log(error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Meta Connections</h1>
      <p className="text-gray-600">
        Connect your Facebook account to start syncing leads and messages.
      </p>

      {!connected ? (
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          <FaFacebook /> Connect with Facebook
        </button>
      ) : (
        <div className="bg-green-100 p-4 rounded-md text-green-800">
          ✅ Connected to Facebook Page <strong>My Business Page</strong>
        </div>
      )}
    </div>
  );
}
