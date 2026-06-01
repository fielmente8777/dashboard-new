import { useState } from "react";
import { BASE_URL } from "../../../data/constant";

const CallInfoCard = ({ call }) => {
  const [play, setPlay] = useState(false);
  if (!call) return null;

  return (
    <div className="space-y-4">
      {/* ================= BASIC INFO ================= */}
      <div className="bg-white p-4 rounded-md">
        <h3 className="font-semibold mb-3">Call Information</h3>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <p>
            <b>From:</b> {call.from}
          </p>
          <p>
            <b>To:</b> {call.to}
          </p>
          <p>
            <b>Status:</b> {call.status}
          </p>
          <p>
            <b>Direction:</b> {call.direction}
          </p>
          <p>
            <b>Stage:</b> {call.stage}
          </p>
          <p>
            <b>Lead Status:</b> {call.leadStatus}
          </p>
          <p>
            <b>Duration:</b> {call.duration}s
          </p>
          <p>
            <b>Price:</b> ₹{call.price}
          </p>
          <p>
            <b>Answered By:</b> {call.answeredBy}
          </p>
          <p>
            <b>Caller Name:</b> {call.callerName || "—"}
          </p>
        </div>
      </div>

      {/* ================= TIME DETAILS ================= */}
      <div className="bg-white p-4 rounded-md">
        <h3 className="font-semibold mb-3">Time Details</h3>

        <div className="space-y-2 text-sm">
          <p>
            <b>Start Time:</b>{" "}
            {call.startTime ? new Date(call.startTime).toLocaleString() : "-"}
          </p>

          <p>
            <b>End Time:</b>{" "}
            {call.endTime ? new Date(call.endTime).toLocaleString() : "-"}
          </p>

          <p>
            <b>Created At:</b>{" "}
            {call.createdAt ? new Date(call.createdAt).toLocaleString() : "-"}
          </p>
        </div>
      </div>

      {/* ================= RECORDING ================= */}
      {call.recordingUrl && (
        <div className="bg-app-surface p-4 rounded-md">
          <h3 className="font-semibold mb-3">Call Recording</h3>

          {!play ? (
            <button
              onClick={() => setPlay(true)}
              className="px-4 py-2 bg-primary text-white rounded"
            >
              ▶ Play Recording
            </button>
          ) : (
            <audio controls autoPlay className="w-full">
              <source src={call.recordingUrl} type="audio/mpeg" />
            </audio>
          )}
        </div>
      )}
    </div>
  );
};

export default CallInfoCard;
