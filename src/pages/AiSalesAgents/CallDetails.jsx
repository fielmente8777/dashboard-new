import React from "react";

const CallDetails = ({ call, onClose }) => {
  if (!call) return null;

  console.log(call);

  // Calculate duration if both start_time and end_time exist
  const duration =
    call.start_time && call.end_time
      ? Math.round((new Date(call.end_time) - new Date(call.start_time)) / 1000)
      : null;

  return (
    <div className="fixed inset-0 bg-black/60 overflow-auto py-4 z-50">
      <div className="max-w-6xl mx-auto px-4 py-8 bg-white rounded-md shadow-lg">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={onClose}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Dashboard
          </button>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  <i className="fas fa-phone-alt text-blue-600 mr-3"></i>
                  Call Details
                </h1>
                <p className="text-gray-600 mt-1">Call ID: {call.call_sid}</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.print()}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  <i className="fas fa-print mr-2"></i>Print
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  <i className="fas fa-download mr-2"></i>Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Call Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i className="fas fa-info-circle text-blue-600 mr-2"></i>
              Call Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">From:</span>
                <span className="font-medium">{call.call_from}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To:</span>
                <span className="font-medium">{call.call_to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    call.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : call.status === "active"
                      ? "bg-blue-100 text-blue-800"
                      : call.status === "failed"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {call.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">
                  {duration ? `${duration} seconds` : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {new Date(call.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Call Analytics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i className="fas fa-chart-line text-green-600 mr-2"></i>
              Call Analytics
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Messages:</span>
                <span className="font-medium">{call.transcript.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Messages:</span>
                <span className="font-medium">
                  {call.transcript.filter((t) => t.speaker === "Customer")
                    .length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">AI Responses:</span>
                <span className="font-medium">
                  {call.transcript.filter((t) => t.speaker === "AI").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Response Time:</span>
                <span className="font-medium">~2.3s</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i className="fas fa-bolt text-yellow-600 mr-2"></i>
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center">
                <i className="fas fa-play mr-2"></i>Play Recording
              </button>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center">
                <i className="fas fa-download mr-2"></i>Download Audio
              </button>
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center">
                <i className="fas fa-file-alt mr-2"></i>Export Transcript
              </button>
            </div>
          </div>
        </div>

        {/* Conversation Transcript */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <i className="fas fa-comments text-blue-600 mr-3"></i>
              Conversation Transcript
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {call.transcript.map((t, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    t.speaker === "AI" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md ${
                      t.speaker === "AI"
                        ? "bg-blue-100 text-blue-900"
                        : "bg-gray-100 text-gray-900"
                    } rounded-lg px-4 py-2`}
                  >
                    <div className="flex items-center mb-1">
                      {t.speaker === "AI" ? (
                        <>
                          <i className="fas fa-robot mr-2 text-blue-600"></i>
                          <span className="text-xs font-semibold text-blue-600">
                            AI Agent
                          </span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user mr-2 text-gray-600"></i>
                          <span className="text-xs font-semibold text-gray-600">
                            Customer
                          </span>
                        </>
                      )}
                      <span className="text-xs text-gray-500 ml-auto">
                        {new Date(t.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{t.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallDetails;
