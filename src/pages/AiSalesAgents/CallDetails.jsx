import React from "react";

const CallDetails = ({ callInfo, conversation }) => {
  return (
    <div className="fixed inset-0 bg-black/60 overflow-auto py-4">
      <div className="max-w-6xl mx-auto px-4 py-8 bg-white rounded-md">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
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
                <p className="text-gray-600 mt-1">Call ID: {callInfo[0]}</p>
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
                <span className="text-gray-600">Hotel:</span>
                <span className="font-medium">{callInfo[1]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Phone:</span>
                <span className="font-medium">{callInfo[2] || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    callInfo[3] === "completed"
                      ? "bg-green-100 text-green-800"
                      : callInfo[3] === "active"
                      ? "bg-blue-100 text-blue-800"
                      : callInfo[3] === "failed"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {callInfo[3]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">
                  {callInfo[4] ? `${callInfo[4]} seconds` : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Started:</span>
                <span className="font-medium">{callInfo[5]}</span>
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
                <span className="font-medium">{conversation.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Messages:</span>
                <span className="font-medium">
                  {conversation.filter((c) => c[0] === "Customer").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">AI Responses:</span>
                <span className="font-medium">
                  {conversation.filter((c) => c[0] === "AI").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Response Time:</span>
                <span className="font-medium">~2.3s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Intent:</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                  Detected
                </span>
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
              <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center">
                <i className="fas fa-user-plus mr-2"></i>Follow Up
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
              {conversation.map(([speaker, message, timestamp], idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    speaker === "AI" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md ${
                      speaker === "AI"
                        ? "bg-blue-100 text-blue-900"
                        : "bg-gray-100 text-gray-900"
                    } rounded-lg px-4 py-2`}
                  >
                    <div className="flex items-center mb-1">
                      {speaker === "AI" ? (
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
                        {timestamp}
                      </span>
                    </div>
                    <p className="text-sm">{message}</p>
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
