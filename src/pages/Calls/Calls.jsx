import { useEffect, useState } from "react";
import { FaPhone } from "react-icons/fa";
// import CallDetails from "./CallDetails";
import { IoIosClose, IoIosPlayCircle } from "react-icons/io";
import { MdRefresh } from "react-icons/md";
import { BASE_PATH, NEW_BASE_URL } from "../../data/constant";

import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";

export default function Calls() {
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [currentRecordingUrl, setCurrentRecordingUrl] = useState("");

  const [allCalls, setAllCalls] = useState([]);
  const [isTableDataLoading, setIsTableDataLoading] = useState(false);
  const [IsStatusLoading, setIsStatusLoading] = useState(false);
  const [isCreateConnectLoading, setIsCreateConnectLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const [formData, setFormData] = useState({
    apiKey: "",
    authToken: "",
    subDomain: "",
    accountSID: "",
  });

  const getAllCalls = async () => {
    setIsTableDataLoading(true);
    try {
      const { data } = await axios.get(`${NEW_BASE_URL}/api/v1/call/getall`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAllCalls(data?.result?.docs?.Call);
    } catch (error) {
      console.error("Error fetching call", error);
    } finally {
      setIsTableDataLoading(false);
    }
  };

  const getConnectStatus = async () => {
    // setLoading(true);
    setIsStatusLoading(true);
    try {
      const { data } = await axios.get(
        `${NEW_BASE_URL}/api/v1/call/connection/status`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (data?.result?.status) {
        setIsConnected(true);
        getAllCalls();
      } else {
        setIsConnected(false);
      }
      // const response = await getAllCallsApiCall();
      // setCalls(response);
      // console.log("Record data", response?.call_record_data);
    } catch (error) {
      console.error("Error fetching call");
    } finally {
      setIsStatusLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setIsCreateConnectLoading(true);
    // handle connect logic here
    console.log(formData);
    try {
      const { data } = await axios.post(
        `${NEW_BASE_URL}/api/v1/call/auth/connect`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (data?.success) {
        setShowSidebar(false);
        getConnectStatus();
      }
      // setTimeout(() => {}, 2000);
      // getConnectStatus();
    } catch (error) {
      console.log(error);
    } finally {
      setIsCreateConnectLoading(false);
    }
  };

  const playRecording = async (callSid) => {
    // console.log(recordingUrl);
    // setCurrentRecordingUrl(`${NEW_BASE_URL}/api/v1/call/recording/${callSid}`);

    try {
      const { data } = await axios.get(
        `${NEW_BASE_URL}/api/v1/call/recording/${callSid}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(data);
      setCurrentRecordingUrl(data?.result?.docs);
    } catch (error) {
      console.log(error);
    }
    setShowAudioModal(true);
  };

  useEffect(() => {
    getConnectStatus();
  }, []);

  const columns = [
    // "Sid",
    // "DateCreated",
    // "DateUpdated",
    // "AccountSid",
    "From",
    "To",
    "PhoneNumber",
    "Direction",

    // "PhoneNumberSid",
    "Status",
    "Time",
    // "EndTime",
    "Duration",
    "Recording",
    // "AnsweredBy",
    // "Uri",
    // "CustomField",
    // "RecordingUrl",
    // "Actions",
  ];

  console.log(currentRecordingUrl);
  return (
    <div className="">
      {/* Calls Table */}
      <div className="overflow-hidden px-4">
        <div className="px-6 bg-white  flex justify-between items-center py-4 border-b border-gray-200 b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Calls</h2>

          {isConnected && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border font-medium rounded-md gap-1 py-1 text-[#575757] px-3 ">
                <div
                  onClick={() => getAllCalls()}
                  className={`flex justify-end items-center cursor-pointer ${
                    isTableDataLoading ? "animate-spin" : ""
                  } `}
                >
                  <MdRefresh size={18} />
                </div>
                Refresh
              </div>

              {/* <div
                className="cursor-pointer"
                onClick={() => setShowSidebar(true)}
              >
                <IoMdSettings size={22} />
              </div> */}
            </div>
          )}
        </div>

        <div className="overflow-x-auto mt-4">
          {IsStatusLoading ? (
            <div className="flex justify-center">
              <Loader size={20} color="#000" />
            </div>
          ) : !isConnected ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-lg font-medium text-gray-700">
                Your account is not connected ❌
              </p>
              <p className="text-sm text-gray-500 max-w-md">
                Connect your account to start viewing and managing call logs in
                real time.
              </p>
              <Link
                to={`${BASE_PATH}/${localStorage.getItem("hid")}/integration`}
                // onClick={() => setShowSidebar(true)}
                className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium shadow-md transition"
              >
                Connect Now
              </Link>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left font-medium text-gray-600 capitalize tracking-wider whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {isTableDataLoading ? (
                  <tr>
                    <td
                      className="text-center py-2 text-gray-500"
                      colSpan={columns.length}
                    >
                      Loading...
                    </td>
                  </tr>
                ) : allCalls?.length > 0 ? (
                  allCalls?.map((call, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* <td className="px-4 py-2 text-gray-900">{call.Sid}</td> */}
                      {/* <td className="px-4 py-2 text-gray-900">
                      {call.DateCreated}
                    </td> */}
                      {/* <td className="px-4 py-2 text-gray-900">
                      {call.DateUpdated}
                    </td> */}
                      {/* <td className="px-4 py-2 text-gray-900">
                      {call.AccountSid}
                    </td> */}
                      <td className="px-4 py-2 text-gray-900">{call.From}</td>
                      <td className="px-4 py-2 text-gray-900">{call.To}</td>
                      <td className="px-4 py-2 text-gray-900">
                        {call.PhoneNumber}
                      </td>
                      <td className="px-4 py-2 text-gray-900">
                        {call.Direction === "outbound-dial" ? (
                          <span className="text-green-700">Outgoing</span>
                        ) : (
                          <span className="text-orange-700">Incoming</span>
                        )}
                      </td>
                      {/* <td className="px-4 py-2 text-gray-900">
                      {call.PhoneNumberSid}
                    </td> */}

                      {/* Status */}
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span
                          className={`text-gray-800 inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            call.Status === "completed"
                              ? ""
                              : call.Status === "in-progress"
                              ? ""
                              : ""
                          }`}
                        >
                          <FaPhone
                            className={`mr-1 ${
                              call.Status === "completed"
                                ? "text-green-700"
                                : "text-orange-700"
                            }`}
                            size={12}
                          />
                          {call.Status === "completed"
                            ? "Call was successfull"
                            : call.Status === "failed"
                            ? "Client unanswered"
                            : "Client hung-up before connecting to any user"}
                        </span>
                      </td>

                      {/* <td>{call.Status}</td> */}

                      <td className="px-4 py-2 text-gray-900">
                        {new Date(call.StartTime).toLocaleTimeString()}
                      </td>
                      {/* <td className="px-4 py-2 text-gray-900">
                      {new Date(call.EndTime).toLocaleTimeString()}
                    </td> */}
                      <td className="px-4 py-2 text-gray-900">
                        {`${Math.floor(call.Duration / 60)} min ${
                          call.Duration % 60
                        } sec`}
                      </td>
                      <td className="px-4 py-2 text-gray-900 flex justify-center">
                        <span
                          className="cursor-pointer "
                          onClick={() => playRecording(call?.Sid)}
                        >
                          {/* {call?.recordingUrl} */}
                          <IoIosPlayCircle size={20} />
                        </span>
                      </td>

                      {/* <td className="px-4 py-2 text-gray-900">{call.AnsweredBy}</td> */}
                      {/* <td className="px-4 py-2 text-gray-900 break-all">
                      {call.Uri}
                    </td> */}
                      {/* <td className="px-4 py-2 text-gray-900">
                      {call.CustomField}
                    </td> */}

                      {/* Recording */}
                      {/* <td className="px-4 py-2 text-gray-900">
                      {call.RecordingUrl ? (
                        <a
                          href={call.RecordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Recording Link
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td> */}

                      {/* Actions */}
                      {/* <td className="px-4 py-2 whitespace-nowrap flex items-center gap-3">
                      <button
                        // onClick={() => viewDetails(call)}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <FaEye className="mr-1" /> View
                      </button>
                      <button
                        // onClick={() => playRecording(call.RecordingUrl)}
                        className="text-green-600 hover:text-green-800 flex items-center"
                      >
                        <FaPlay className="mr-1" /> Play
                      </button>
                    </td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="12"
                      className="px-4 py-2 text-center text-gray-500 text-lg"
                    >
                      No calls found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* {selectedCall && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60">
              <CallDetails
                call={selectedCall}
                onClose={() => setSelectedCall(null)}
                backButton
              />
            </div>
          )} */}

          {/* {selectedCall && (
            <CallDetail
              call={selectedCall.callInfo}
              // conversation={selectedCall.conversation}
            />
          )} */}
        </div>
      </div>

      {showSidebar && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full shadow-xl transform transition-transform duration-300 ease-out translate-x-0 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Connect Your Account
              </h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <IoIosClose size={30} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleConnect}
              className="flex-1 overflow-y-auto px-6 py-4 space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  API Key
                </label>
                <input
                  type="text"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your API Key"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Auth Token
                </label>
                <input
                  type="password"
                  name="authToken"
                  value={formData.authToken}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your Auth Token"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subdomain
                </label>
                <input
                  type="text"
                  name="subDomain"
                  value={formData.subDomain}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your Subdomain"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Account SID
                </label>
                <input
                  type="text"
                  name="accountSID"
                  value={formData.accountSID}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your Account SID"
                  required
                />
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium shadow-md transition flex items-center justify-center gap-4"
                >
                  Connect {isCreateConnectLoading && <Loader color="#fff" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <source src={currentRecordingUrl} type="audio/mp3" />
              </audio>

              {/* <div className="flex justify-end">
                <button
                  // onClick={downloadRecording}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <i className="fas fa-download mr-2"></i>Download
                </button>
              </div> */}
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
          <p className={`text-2xl font-bold text-${color}-600`}>
            {title === "Avg Duration" ? `${value} sec` : value}
          </p>
        </div>
      </div>
    </div>
  );
}
