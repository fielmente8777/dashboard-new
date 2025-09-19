import React, { useEffect, useState, useRef } from "react";
import { FaCircle, FaEye, FaHotel, FaPlay } from "react-icons/fa";
import CallDetails from "./CallDetails";
import { getAiSalesAgentCall } from "../../services/api/AiSales.api";
import { MdClose, MdRefresh } from "react-icons/md";
import { NEW_BASE_URL } from "../../data/constant";

export default function AiSaleAgent() {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [currentRecordingUrl, setCurrentRecordingUrl] = useState("");
  const [activeCalls, setActiveCalls] = useState(0);
  const [completedCalls, setCompletedCalls] = useState(0);
  const [avgDuration, setAvgDuration] = useState("0s");
  const [bookingCount, setBookingCount] = useState(0);
  const [successRate, setSuccessRate] = useState("0%");
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: "call_start",
      message: "New call started from +1234567890 to Grand Plaza Hotel",
      time: "2 minutes ago",
    },
    {
      id: 2,
      type: "message",
      message: "Customer inquiring about weekend availability",
      time: "3 minutes ago",
    },
    {
      id: 3,
      type: "call_end",
      message: "Call completed - Duration: 4m 32s",
      time: "5 minutes ago",
    },
  ]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [loading,setLoading]=useState(true)

  const audioPlayerRef = useRef(null);

  // Simulated call data
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    loadStats();
    const interval = setInterval(() => {
      loadStats();
      updateActivityFeed();
    }, 10000);
    return () => clearInterval(interval);
  }, [calls]);

  const loadStats = () => {
    // const completed = calls?.filter((c) => c[3] === "completed").length;
    const completed = calls?.filter((c) => c.status === "completed").length;

    const active = calls?.filter((c) => c[3] === "active").length;
    setCompletedCalls(completed);
    setActiveCalls(active);

    const averageDuration =
      calls.reduce((acc, call) => acc + (call.duration || 0), 0) / calls.length;

    if (averageDuration) {

      setAvgDuration(averageDuration/60);
    }

    const completedWithDuration = calls.filter(
      (c) => c[3] === "completed" && c[4]
    );
    if (completedWithDuration.length > 0) {
      const totalDuration = completedWithDuration.reduce(
        (sum, c) => sum + c[4],
        0
      );
      const avgSeconds = Math.round(
        totalDuration / completedWithDuration.length
      );
      // setAvgDuration(`${Math.floor(avgSeconds / 60)}m ${avgSeconds % 60}s`);
      setAvgDuration(averageDuration);
    }

    const totalCalls = calls?.length;
    if (totalCalls > 0) {
      setSuccessRate(`${Math.round((completed / totalCalls) * 100)}%`);
    }

    setBookingCount(calls?.filter((c) => c[4] && c[4] > 120).length);
  };

  const updateActivityFeed = () => {
    const messages = [
      "New call received from customer",
      "AI agent successfully answered pricing question",
      "Customer requested room availability",
      "Call transferred to human agent",
      "Booking inquiry completed",
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setActivities((prev) => [
      {
        id: Date.now(),
        type: "message",
        message: randomMessage,
        time: "Just now",
      },
      ...prev.slice(0, 9),
    ]);
  };

  const playRecording = (callSid) => {
    setCurrentRecordingUrl(`${NEW_BASE_URL}/api/v1/play/${callSid}`);
    setShowAudioModal(true);
  };

  console.log(currentRecordingUrl);

  const downloadRecording = () => {
    const link = document.createElement("a");
    link.href = currentRecordingUrl;
    link.download = `call-recording-${Date.now()}.mp3`;
    link.click();
  };

  const getAiSalesAgentApiCall = async () => {
    setLoading(true)
    try {
      const formBody = {
          skip: 0,
          limit: 100,
       };
      const response = await getAiSalesAgentCall(formBody);
      setCalls(response);
      console.log("Record data",response?.call_record_data);
    } catch (error) {
      console.error("Error fetching call")
    } finally{
      setLoading(false)
    }
    
  };

  useEffect(() => {
    getAiSalesAgentApiCall();
  }, []);

  return (
    <div className="">
      {/* Header */}
      <div className="mb-4">
        <div className="bg-white py-6 px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Hotel AI Voice Agent Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Monitor and manage AI-powered hotel booking calls
              </p>
            </div>
            <div className="flex items-center space-x-4">
             
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {calls?.length}
                </div>
                <div className="text-sm text-gray-500">Total Calls</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {activeCalls}
                </div>
                <div className="text-sm text-gray-500">Active Now</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4 px-4">
        <StatCard
          icon="fa-phone"
          title="Completed Calls"
          value={completedCalls}
          color="green"
        />
        <StatCard
          icon="fa-clock"
          title="Avg Duration"
          value={avgDuration}
          color="blue"
        />
        <StatCard
          icon="fa-bed"
          title="Bookings"
          value={bookingCount}
          color="purple"
        />
        <StatCard
          icon="fa-star"
          title="Success Rate"
          value={successRate}
          color="yellow"
        />
      </div>

      {/* Filters */}
      {/* <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Call Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="active">Active</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
          <button
            onClick={loadStats}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-refresh mr-2"></i>Refresh
          </button>
        </div>
      </div> */}

      {/* Calls Table */}
      <div className="overflow-hidden px-4">
        <div className="px-6 bg-white  flex justify-between items-center py-4 border-b border-gray-200 b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Calls</h2>
          <div
            onClick={() => getAiSalesAgentApiCall()}
            className={`flex justify-end items-center font-medium rounded-md gap-1 py-1 border text-[#575757] px-3 cursor-pointer ${
              loading ? "animate-spin" : ""
            } `}
          >
             <MdRefresh size={18} />Refresh
          </div>
        </div>
         
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  // "Call ID",
                  "Hotel Number",
                  "Guest Number",
                  "Status",
                  "Duration",
                  "Time",
                  "Actions",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {!loading? calls?.map((call, idx) => {
                const duration =
                  call.start_time && call.end_time
                    ? Math.round(
                        (new Date(call.end_time) - new Date(call.start_time)) /
                          1000
                      )
                    : null;

                return (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    {/* Call ID */}
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {call.call_sid.slice(0, 8)}...
                    </td> */}

                    {/* From */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <FaHotel className="text-primary mr-2" />
                        {call.call_from || "Unknown"}
                      </div>
                    </td>

                    {/* To */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {call.call_to || "Unknown"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          call.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : call.status === "active"
                            ? "bg-blue-100 text-blue-800"
                            : call.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <FaCircle className="mr-1" size={8} />
                        {call.status}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeof call?.duration === "number"
                        ? `${Math.floor(call.duration / 60)} min ${
                            call.duration % 60
                          } sec`
                        : "-"}
                    </td>

                    {/* Time */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(call.created_at).toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedCall(call)}
                        className="text-blue-600 hover:text-blue-900 mr-4 flex items-center"
                      >
                        <FaEye className="mr-1" /> View Details
                      </button>
                      <button
                        onClick={() =>
                          playRecording(call?.call_record_data?.recording_sid)
                        }
                        className="text-green-600 hover:text-green-900 flex items-center"
                      >
                        <FaPlay className="mr-1" /> Play
                      </button>
                    </td>
                  </tr>
                );
              })

              :
              [1,2,3,4,5,6,7,8].map((item)=>(
                <tr key={item}>
                  <td  className="px-6 py-4 whitespace-nowrap"></td>

                </tr>
              ))
            
            }
            </tbody>
          </table>

          {selectedCall && (
            <CallDetails
              call={selectedCall}
              onClose={() => setSelectedCall(null)}
            />
          )}

          {/* {selectedCall && (
            <CallDetail
              call={selectedCall.callInfo}
              // conversation={selectedCall.conversation}
            />
          )} */}
        </div>
      </div>

      {/* Activity Feed */}
      {/* <div className="mt-8 bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Live Activity Feed
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {activity.type === "call_start" && (
                    <i className="fas fa-phone text-green-600"></i>
                  )}
                  {activity.type === "call_end" && (
                    <i className="fas fa-phone-slash text-red-600"></i>
                  )}
                  {activity.type === "message" && (
                    <i className="fas fa-comment text-blue-600"></i>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* Audio Modal */}
      {showAudioModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Call Recording</h3>
              <button
                onClick={() => setShowAudioModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                {/* <i className="fas fa-times"></i> */}
                <span className="font-bold text-black">X</span>
              </button>
            </div>
            <div className="space-y-4">
              {/* <audio controls className="w-full" ref={audioPlayerRef}>
                <source src={currentRecordingUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio> */}

              <audio controls>
                <source src={currentRecordingUrl} type="audio/mpeg" />
              </audio>

              <div className="flex justify-end">
                <button
                  onClick={downloadRecording}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-download mr-2"></i>Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Stat Card
function StatCard({ icon, title, value, color }) {

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="flex items-center">
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          <i className={`fas ${icon} text-${color}-600`}></i>
        </div>
        <div className="ml-4">
          <h3 className="text-md font-semibold text-gray-900">{title}</h3>
          <p className={`text-2xl font-bold text-${color}-600`}>{title==="Avg Duration"?`${value} sec`: value}</p>
        </div>
      </div>
    </div>
  );
}
