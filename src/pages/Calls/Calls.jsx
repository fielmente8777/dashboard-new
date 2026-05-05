import { useEffect, useRef, useState } from "react";
import { FaPhone, FaWhatsapp } from "react-icons/fa";
// import CallDetails from "./CallDetails";
import { IoIosClose, IoIosPlayCircle } from "react-icons/io";
import { MdRefresh } from "react-icons/md";
import {
  BASE_PATH,
  GuestType,
  LeadStatus,
  MasterSegregation,
  NEW_BASE_URL,
  Priority,
  Property,
  ROUTES_PATH,
  Stages,
  WEBSOCKET_EVENTS,
  WS_BASE_URL,
} from "../../data/constant";

import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import CustomDropdown from "../../components/ui/Dropdown";
import DatePickerModal from "../../components/Modal/DatePickerModal";
import { getAllCalls, makeCall, updateCall } from "../../services/api/call.api";
import { useToast } from "../../context/ToastContext";
import Pagination from "../../components/Pagination";
import TablePaginationInfo from "../../components/TablePaginationInfo";
import usePagination from "../../hooks/usePagination";
import {
  TableRowSkelton,
  TableSkeleton,
} from "../../components/Skeltons/TableSkelton";
import { fetchUserManagementData } from "../../services/api";
import CustomDropdown2 from "../../components/ui/Dropdown2";
import { MdOutlineWifiCalling3 } from "react-icons/md";
import CustomSubDropdown from "../../components/ui/CustomSubDropdown";
import WebSocketClient from "../../config/websocketClient";
import QuickResponsePopup from "../../components/Popup/QuickResponsePopup";
import { getWhatsAppMessageTemplates } from "../../services/api/whatsApp";
import { timeAgo } from "../../utils/formateDate";
import { useSelector } from "react-redux";

export default function Calls() {
  const { user: hotel } = useSelector((state) => state.userProfile);
  console.log(hotel);
  const wsRef = useRef(null);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [currentRecordingUrl, setCurrentRecordingUrl] = useState("");

  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    page,
    limit,
    total,
    totalPages,
    setTotal,
    goToPage,
    nextPage,
    prevPage,
    changeLimit,
  } = usePagination({ initialLimit: 20 });

  const [allCalls, setAllCalls] = useState([]);
  const [isTableDataLoading, setIsTableDataLoading] = useState(true);
  const [isImportCallsLoading, setIsImportCallsLoading] = useState(false);
  const [IsStatusLoading, setIsStatusLoading] = useState(false);
  const [isCreateConnectLoading, setIsCreateConnectLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [templates, setTemplates] = useState([]);
  const [quickResponseOpen, setQuickResponseOpen] = useState(false);
  const [lead, setLead] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    apiKey: "",
    authToken: "",
    subDomain: "",
    accountSID: "",
  });

  const importCalls = async () => {
    setIsImportCallsLoading(true);
    try {
      await axios.get(
        `${NEW_BASE_URL}/api/v1/call/import?hid=${localStorage.getItem("hid")}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      fetchAllCalls();
    } catch (error) {
      console.error("Error fetching call", error);
    } finally {
      setIsImportCallsLoading(false);
    }
  };

  const fetchAllCalls = async () => {
    setIsTableDataLoading(true);
    try {
      const params = {
        hid: localStorage.getItem("hid"),
        page,
        limit,
        search: searchTerm,
      };
      const response = await getAllCalls(params);

      if (response?.success && response?.responseStatusCode === 200) {
        setAllCalls(response?.result?.docs?.calls);
        setTotal(response?.result?.pagination?.total || 0);
      }
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
        },
      );

      if (data?.result?.status) {
        setIsConnected(true);
        fetchAllCalls();
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
      setIsTableDataLoading(false);
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
    // console.log(formData);
    try {
      const { data } = await axios.post(
        `${NEW_BASE_URL}/api/v1/call/auth/connect?hid=${localStorage.getItem("hid")}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (data?.success) {
        setShowSidebar(false);
        getConnectStatus();
      }
      // setTimeout(() => {}, 2000);
      // getConnectStatus();
    } catch (error) {
      // console.log(error);
    } finally {
      setIsCreateConnectLoading(false);
    }
  };

  const playRecording = async ({ callUrl, callSid }) => {
    // console.log(recordingUrl);
    // setCurrentRecordingUrl(`${NEW_BASE_URL}/api/v1/call/recording/${callSid}`);
    setCurrentRecordingUrl(callUrl);

    // try {
    //   const { data } = await axios.get(
    //     `${NEW_BASE_URL}/api/v1/call/recording/${callSid}`,
    //     {
    //       headers: {
    //         Authorization: `Bearer ${localStorage.getItem("token")}`,
    //       },
    //     },
    //   );
    //   console.log(data);
    //   setCurrentRecordingUrl(data?.result?.docs);
    // } catch (error) {
    //   // console.log(error);
    // }
    setShowAudioModal(true);
  };

  const columns = [
    { label: "From", value: "from" },
    { label: "To", value: "to" },
    { label: "Phone Number", value: "phoneNumberSid" },
    { label: "WhatsApp", value: "whatsapp" },
    { label: "Direction", value: "direction" },
    { label: "Status", value: "status" },
    { label: "Time", value: "startTime" },
    { label: "Duration", value: "duration" },
    { label: "Recording", value: "recordingUrl" },
    // { label: "Attempted By", value: "assignedTo" },
    { label: "Property", value: "property" },
    { label: "Segregation", value: "segregation" },
    { label: "Guest Type", value: "guestType" },
    { label: "Priority", value: "priority" },
    { label: "Stage", value: "stage" },
  ];

  const newStages = Stages?.filter((stage) => {
    return stage?.value === "Closure" || stage?.value === "Follow Up";
  });

  const [callPopup, setCallPopup] = useState(false);
  const [incomingCallPopup, setIcomingCallPopup] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState({});
  const [fromNumber, setFromNumber] = useState(
    hotel?.Profile?.hotelPhone || "",
  );
  const [toNumber, setToNumber] = useState("");
  const handleMakeCall = async () => {
    try {
      if (!fromNumber || !toNumber) {
        alert("Both numbers are required");
        return;
      }

      const response = await makeCall({ fromNumber, toNumber });

      // const response = await fetch(
      //   `${NEW_BASE_URL}/api/v1/call/auth/make-call?hid=${localStorage.getItem("hid")}`,
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${localStorage.getItem("token")}`, // authMiddleware expects this
      //     },
      //     body: JSON.stringify({
      //       fromNumber,
      //       toNumber,
      //     }),
      //   },
      // );

      // const data = await response.json();
      if (response?.success) {
        showToast({
          message: response?.responseMessage || "Call initiated successfully",
          type: "success",
        });
      }

      alert("✅ Call initiated successfully");
      setCallPopup(false);
      setFromNumber("");
      setToNumber("");
    } catch (error) {
      console.error("Call error:", error);
      alert("Something went wrong while making the call");
    }
  };

  const handleUpdateCall = async (data) => {
    const payload = { ...data };

    try {
      const response = await updateCall(payload);
      if (response?.success && response?.responseStatusCode === 200) {
        showToast({
          message:
            response?.responseMessage || "Lead stage updated successfully",
          type: "success",
        });
        return;
      }
    } catch (error) {
      showToast({
        message: error?.message || "Failed to update lead stage",
        type: "error",
      });
    }
  };

  const handleUserAssign = async ({ item, sid }) => {
    const [phone, email] = item.value.split(",");
    try {
      const payload = {
        sid: sid,
        assignedTo: item?.label,
        assigneeNumber: phone || null,
        assigneeEmail: email || null,
      };

      handleUpdateCall(payload);
    } catch (error) {
      showToast({
        message: error?.message || "Failed to update lead stage",
        type: "error",
      });
    }
  };

  const handleRedirectToPage = (row, index) => {
    // localStorage.setItem(LOCAL_STORAGE.AllLeads, page);
    const hid = localStorage.getItem("hid");

    const queryParams = new URLSearchParams({
      sid: row.sid,
      hid: row?.hid,
      call: index,
    });

    const navigatePath = `${BASE_PATH}/${hid}/${ROUTES_PATH.CALLS_MANAGEMENT}/all-calls/${row._id}/view?${queryParams.toString()}`;
    navigate(navigatePath);
  };

  const fetchUsersData = async () => {
    const token = localStorage.getItem("token");
    const usersData = await fetchUserManagementData(token);
    setAllUsers(usersData);
  };

  const fetchTemplates = async () => {
    const response = await getWhatsAppMessageTemplates();
    if (response.success) {
      setTemplates(response?.result?.docs?.data || []);
    }
  };

  useEffect(() => {
    wsRef.current = new WebSocketClient(WS_BASE_URL);

    wsRef.current.connect((serverResponse) => {
      console.log("server response", serverResponse);
      if (
        serverResponse?.event === WEBSOCKET_EVENTS.EXOTEL_CALL &&
        serverResponse?.data?.ndid === localStorage.getItem("ndid")
      ) {
        const { data } = serverResponse;
        setIcomingCallPopup(true);
        setIncomingCallData(data);
        console.log("Data", data);
      } else if (
        serverResponse?.event === WEBSOCKET_EVENTS.EXOTEL_CALL_ANSWERED &&
        serverResponse?.data?.ndid === localStorage.getItem("ndid")
      ) {
        setIcomingCallPopup(false);
      } else if (
        serverResponse?.event === WEBSOCKET_EVENTS.EXOTEL_CALL_MISSED &&
        serverResponse?.data?.ndid === localStorage.getItem("ndid")
      ) {
        setIcomingCallPopup(false);
      }
    });

    return () => wsRef.current?.close();
  }, [incomingCallData, incomingCallPopup]);

  useEffect(() => {
    getConnectStatus();
    fetchUsersData();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchAllCalls();
    }
  }, [page, limit, searchTerm, isConnected]);

  const getCallStatus = (status, direction) => {
    console.log(status, direction);
    if (
      status === "no-answer" &&
      (direction === "outbound-dial" || direction === "outbound-api")
    ) {
      return "Client Unanswered";
    } else if (status === "no-answer" && direction === "inbound") {
      return "No user answered";
    } else if (
      status === "completed" &&
      (direction === "inbound" ||
        direction === "outbound-dial" ||
        direction === "outbound-api")
    ) {
      return "Call Successfull";
    } else if (
      status === "busy" &&
      (direction === "outbound-dial" || direction === "outbound-api")
    ) {
      return "Client Busy";
    }
    return status;
  };

  // console.log(new Date("2026-05-04T13:50"));

  return (
    <div className="">
      {/* Calls Table */}
      <div className="bg-white p-3 md:p-4 space-y-3 md:space-y-6 h-[90vh] flex flex-col">
        <div className=" flex items-center justify-between">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 h-10 w-72 px-3 rounded-lg border border-gray-300 bg-gray-50">
              <input
                type="text"
                placeholder="Search calls..."
                className="w-full bg-transparent outline-none text-sm"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* <h2 className="text-lg font-semibold text-gray-900">
              Recent Calls
            </h2> */}

            <button
              onClick={() => setCallPopup(true)}
              className="border border-primary/60! py-1 px-5 rounded hover:bg-primary hover:text-white duration-300 flex items-center gap-1"
            >
              <MdOutlineWifiCalling3 size={16} /> Call Now
            </button>

            {isConnected && (
              <div
                onClick={() => importCalls()}
                className="flex items-center border font-medium rounded-md gap-1 py-1  px-3 bg-primary text-white cursor-pointer"
              >
                <div
                  className={`flex justify-end items-center cursor-pointer ${
                    isImportCallsLoading ? "animate-spin" : ""
                  } `}
                >
                  <MdRefresh size={18} />
                </div>
                Import Calls
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          {/* 📊 TABLE */}
          <div className="border rounded-lg overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-primary sticky top-0 z-999">
                <tr>
                  <th className="px-3 py-2 text-white">#</th>
                  {columns.map((col) => (
                    <th
                      key={col.value}
                      className="px-3 py-3 text-left text-white whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* 🔄 LOADING */}
                {isTableDataLoading && (
                  <TableRowSkelton rows={limit} columns={columns?.length} />
                )}

                {/* ✅ DATA */}
                {!isTableDataLoading &&
                  allCalls?.length > 0 &&
                  allCalls.map((call, i) => {
                    const startTime = new Intl.DateTimeFormat("sv-SE", {
                      timeZone: "Asia/Kolkata",
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })
                      .format(new Date(call?.startTime))
                      .replace(" ", "T");

                    console.log("start", startTime);

                    return (
                      <tr
                        key={i}
                        className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 cursor-pointer"
                        onClick={() =>
                          handleRedirectToPage(call, i + limit * (page - 1) + 1)
                        }
                      >
                        {/* Index */}
                        <td className="px-3 py-1 whitespace-nowrap">
                          {(i + limit * (page - 1) + 1)
                            .toString()
                            .padStart(2, "0")}
                        </td>

                        {/* From */}
                        <td className="px-3 py-1 whitespace-nowrap">
                          {call.from || "-"}
                        </td>

                        {/* To */}
                        <td className="px-3 py-1 whitespace-nowrap">
                          {call.to || "-"}
                        </td>

                        {/* Phone */}
                        <td className="px-3 py-1 whitespace-nowrap">
                          {call.phoneNumberSid || "-"}
                        </td>

                        <td
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickResponseOpen(true);
                            setLead({
                              Contact:
                                call?.direction === "inbound"
                                  ? call?.from
                                  : call?.to,
                            });
                          }}
                          className="px-3 py-1 whitespace-nowrap text-center flex justify-center text-green-500"
                        >
                          <FaWhatsapp size={20} />
                        </td>

                        {/* Direction */}
                        <td className="px-3 py-1 whitespace-nowrap">
                          {call.direction === "outbound-dial" ||
                          call.direction === "outbound-api" ? (
                            <span className="text-green-700">Outgoing</span>
                          ) : (
                            <span className="text-orange-700">Incoming</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-1 whitespace-nowrap">
                          <span className="text-xs font-medium">
                            {getCallStatus(call.status, call.direction)}
                          </span>
                        </td>

                        {/* Time */}
                        <td className="px-3 py-1 whitespace-nowrap">
                          {/* {call.startTime
                          ? new Date(call.startTime).toLocaleString()
                          : "-"} */}
                          {timeAgo(startTime)}
                        </td>

                        {/* Duration */}
                        <td className="px-3 py-1 whitespace-nowrap">
                          {call.duration
                            ? `${Math.floor(call.duration / 60)}m ${
                                call.duration % 60
                              }s`
                            : "-"}
                        </td>

                        {/* Recording */}
                        <td
                          className="px-3 py-1 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {call.recordingUrl ? (
                            <span
                              onClick={() =>
                                playRecording({
                                  callUrl: call.recordingUrl,
                                  callSid: call.sid,
                                })
                              }
                              className="cursor-pointer text-blue-600"
                            >
                              Play
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* Attempted By  */}
                        {/* <td onClick={(e) => e.stopPropagation()} className="p-1">
                        <CustomDropdown2
                          label={call["assignedTo"] || "Attempted By"}
                          options={
                            allUsers?.map((user) => ({
                              value: `${user?.phone},${user?.emailId}`,
                              label: user?.userName,
                            })) || []
                          }
                          onChange={(value) =>
                            handleUserAssign({
                              item: value,
                              sid: call.sid,
                            })
                          }
                          className="border w-40! p-1! rounded-md! bg-gray-100! z-9!"
                        />
                      </td> */}

                        {/* Property  */}
                        <td
                          onClick={(e) => e.stopPropagation()}
                          className="p-1"
                        >
                          <CustomDropdown
                            label={call?.property || "Select"}
                            options={Property}
                            onChange={(value) =>
                              handleUpdateCall({
                                property: value,
                                sid: call.sid,
                              })
                            }
                            className="border w-40! p-1! rounded-md! bg-gray-100! z-9!"
                          />
                        </td>

                        {/* Segregation */}
                        <td
                          onClick={(e) => e.stopPropagation()}
                          className="p-1"
                        >
                          <CustomDropdown
                            label={call?.segregation?.value}
                            options={MasterSegregation}
                            onChange={(value) =>
                              handleUpdateCall({
                                sid: call.sid,
                                segregation: {
                                  label: value,
                                  value: value,
                                },
                              })
                            }
                            // handleUpdateCall({
                            //   sid: call.sid,
                            //   leadStatus: value,
                            // })

                            className="border w-40! p-1! rounded-md! bg-gray-100! z-9!"
                          />
                        </td>

                        {/* Guest Type  */}
                        <td
                          onClick={(e) => e.stopPropagation()}
                          className="p-1"
                        >
                          <CustomDropdown
                            label={call.guestType}
                            options={GuestType}
                            onChange={(value) => {
                              handleUpdateCall({
                                sid: call.sid,
                                guestType: value,
                              });
                            }}
                            className="border w-40! p-1! rounded-md! bg-gray-100! z-9!"
                          />
                        </td>

                        {/* Priority  */}
                        <td
                          onClick={(e) => e.stopPropagation()}
                          className="p-1"
                        >
                          <CustomDropdown
                            label={call.priority}
                            options={Priority}
                            onChange={(value) => {
                              handleUpdateCall({
                                sid: call.sid,
                                priority: value,
                              });
                            }}
                            className="border w-40! p-1! rounded-md! bg-gray-100! z-9!"
                          />
                        </td>

                        {/* Stage */}
                        <td
                          onClick={(e) => e.stopPropagation()}
                          className="p-1"
                        >
                          <CustomDropdown
                            label={call.stage}
                            options={newStages}
                            onChange={(value) => {
                              if (value === "Follow Up") {
                                setSelectedRow(call);
                                setShowDatePicker(true);
                              } else {
                                handleUpdateCall({
                                  sid: call.sid,
                                  stage: value,
                                });
                              }
                            }}
                            className="border w-40! p-1! rounded-md! bg-gray-100! z-9!"
                          />
                        </td>
                      </tr>
                    );
                  })}

                {!isTableDataLoading && allCalls?.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="py-6 text-center"
                    >
                      No Calls Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between items-center px-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={goToPage}
            onNext={nextPage}
            onPrev={prevPage}
          />

          <TablePaginationInfo
            limit={limit}
            onLimitChange={changeLimit}
            page={page}
            total={total}
          />
        </div>

        <QuickResponsePopup
          setOpen={() => setQuickResponseOpen(false)}
          open={quickResponseOpen}
          lead={lead}
          templates={templates || []}
        />

        {/* <div className="overflow-x-auto mt-4">
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
                      {col?.label}
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
                      onClick={() => {
                        handleRedirectToPage(call, idx + 10 * (1 - 1) + 1);
                      }}
                      key={idx}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-2 text-gray-900">{call.from}</td>
                      <td className="px-4 py-2 text-gray-900">{call.to}</td>
                      <td className="px-4 py-2 text-gray-900">
                        {call.phoneNumberSid}
                      </td>
                      <td className="px-4 py-2 text-gray-900">
                        {call.direction === "outbound-dial" ? (
                          <span className="text-green-700">Outgoing</span>
                        ) : (
                          <span className="text-orange-700">Incoming</span>
                        )}
                      </td>

                      <td className="px-4 py-2 whitespace-nowrap">
                        <span
                          className={`text-gray-800 inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            call.status === "completed"
                              ? ""
                              : call.status === "in-progress"
                                ? ""
                                : ""
                          }`}
                        >
                          <FaPhone
                            className={`mr-1 ${
                              call.status === "completed"
                                ? "text-green-700"
                                : "text-orange-700"
                            }`}
                            size={12}
                          />
                          {call.status === "completed"
                            ? "Call was successfull"
                            : call.status === "failed"
                              ? "Client unanswered"
                              : "Client hung-up before connecting to any user"}
                        </span>
                      </td>

                      <td className="px-4 py-2 text-gray-900">
                        {new Date(call.startTime).toLocaleTimeString()}
                      </td>

                      <td className="px-4 py-2 text-gray-900">
                        {`${Math.floor(call.duration / 60)} min ${
                          call.Duration % 60
                        } sec`}
                      </td>
                      <td className="px-4 py-2 text-gray-900 flex justify-center">
                        <span
                          className="cursor-pointer "
                          onClick={() => playRecording(call?.recordingUrl)}
                        >
                          <IoIosPlayCircle size={20} />
                        </span>
                      </td>

                      <td onClick={(e) => e.stopPropagation()}>
                        <CustomDropdown
                          label={call.stage}
                          options={newStages}
                          className="border w-40! p-1! rounded-md! bg-gray-100! z-9!"
                          onChange={(value) => {
                            if (value === "Follow Up") {
                              setSelectedRow(call);
                              setShowDatePicker(true);
                            } else {
                              handleUpdateCall({ sid: call.sid, stage: value });
                            }
                          }}
                        />
                      </td>

                      <td onClick={(e) => e.stopPropagation()} className="px-2">
                        <CustomDropdown
                          label={call.leadStatus}
                          options={LeadStatus}
                          className="border w-40! p-1! rounded-md! bg-gray-100! z-9!"
                          onChange={(value) => {
                            handleUpdateCall({
                              sid: call.sid,
                              leadStatus: value,
                            });
                          }}
                        />
                      </td>
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
        </div> */}
      </div>

      {callPopup && (
        <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-black/40 z-9999">
          <div className="w-100 max-w-md p-5 bg-white rounded-xl shadow-xl flex flex-col gap-4">
            <h1 className="text-lg font-semibold">
              Enter Number to Make a Call
            </h1>

            {/* 🔥 From Number (Dropdown + Input) */}
            <div className="flex flex-col gap-2">
              {/* <label className="text-sm font-medium">From</label> */}

              {/* <CustomDropdown2
                options={
                  allUsers?.map((user) => ({
                    value: user?.phone,
                    label: `${user?.userName} (${user?.phone})`,
                  })) || []
                }
                label={fromNumber || "Select User"}
                onChange={(item) => {
                  setFromNumber(item?.value);
                }}
                className="border p-1 rounded-md bg-gray-100 w-full"
              />

              <input
                value={fromNumber}
                onChange={(e) => setFromNumber(e.target.value)}
                placeholder="Or type number"
                className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              /> */}
            </div>

            {/* 🔥 To Number */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">To</label>
              <input
                value={toNumber}
                onChange={(e) => setToNumber(e.target.value)}
                placeholder="Guest number"
                className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 🔥 Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setCallPopup(false)}
                className="px-4 py-1.5 bg-red-100 text-red-600 rounded hover:bg-red-500 duration-300 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleMakeCall}
                className="px-4 py-1.5 bg-primary text-white rounded hover:opacity-90"
              >
                Call Now
              </button>
            </div>
          </div>
        </div>
      )}

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

      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSave={(date) => {
          handleUpdateCall({
            followUpDate: date,
            sid: selectedRow.sid,
            stage: "Follow Up",
          });
          setShowDatePicker(false);
        }}
      />

      {incomingCallPopup && (
        <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-black/40 z-99999">
          <div className="w-72 bg-white rounded-2xl shadow-xl p-4 border border-gray-200 animate-slideIn">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 text-green-600 p-2 rounded-full">
                📞
              </div>
              <div>
                <h3 className="text-sm font-semibold">Incoming Call</h3>
                <p className="text-xs text-gray-500">
                  {incomingCallData?.from}
                </p>
              </div>
            </div>
            <p className="text-xs mt-2 text-center text-gray-500">
              Please check your phone
            </p>

            <div className="flex justify-end mt-4">
              {/* <button className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-1.5 rounded-lg">
                Answer
              </button> */}

              <button
                onClick={() => setIcomingCallPopup(!incomingCallPopup)}
                className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-1.5 rounded-lg"
              >
                Close
              </button>
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
