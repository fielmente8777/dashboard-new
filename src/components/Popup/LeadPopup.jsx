import React, { useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Arrow } from "../../icons/icon";
import axios from "axios";
import Swal from "sweetalert2";
import { extractBookingInfo } from "../../pages/Enquiry/Leads";
import { MdMailOutline, MdOutlineClose } from "react-icons/md";
import { MdMail } from "react-icons/md";
import { FaPhoneFlip } from "react-icons/fa6";
import { FaPhone } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import QuickResponsePopup from "./QuickResponsePopup";
import { useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import CallDetails from "../../pages/AiSalesAgents/CallDetails";
import { BASE_URL, NEW_BASE_URL } from "../../data/constant";

const Tabs = ["All Details", "Call Details"];

const header = [
  { label: "Open Queries", value: "Open" },
  { label: "Contacted", value: "Contacted" },
  { label: "Converted", value: "Converted" },
  { label: "Out Of Budget", value: "Out Of Budget" },
  { label: "Potential For Later", value: "Potential For Later" },
  { label: "Quotation Provided", value: "Quotation Provided" },
  { label: "Dead Lead", value: "Dead Lead" },
  { label: "Date Sold Out", value: "Date Sold Out" },
];

export const formatPhoneNumber = (phone) => {
  let cleaned = phone.replace(/\D/g, ""); // remove non-digit characters

  if (cleaned.length === 10) {
    cleaned = "91" + cleaned; // prepend country code if it's a 10-digit
  }

  return cleaned;
};
const LeadPopup = ({
  hotelName = "Eazotel",
  isOpen,
  onClose,
  lead,
  fetchEnquires,
  handleTabClick,
  activeIndex,
}) => {
  // console.log(lead?.note);
  const [note, setNote] = useState();
  const [quickResponePopup, setQuickResponePopup] = useState(false);
  const [callDetails, setCallDetails] = useState(null);
  const [callDetailsLoading, setCallDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isEdit, setIsEdit] = useState(false);
  const [isNoteUpdateLoading, setIsNoteUpdateLoading] = useState(false);

  useEffect(() => {
    setNote(lead?.note || "");
  }, [lead]);
  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  // console.log(lead)
  const handleDelete = async (id, email) => {
    onClose();
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete user: ${email}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirmation.isConfirmed) {
      try {
        const response = await axios.post(
          "https://nexon.eazotel.com/eazotel/delete-contact-query",
          {
            token: localStorage.getItem("token"),
            id: id,
          }
        );

        const result = await response.data;

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: result.Message || "User has been deleted successfully.",
          timer: 600,
          showConfirmButton: false,
        }).then(() => {
          if (result.Status) {
            fetchEnquires(localStorage.getItem("token"));
          }
        });

        onClose();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "User Management API error. Please try again.",
        });
      }
    }
  };

  const handleQueryStatus = async (status) => {
    try {
      const response = await axios.post(
        "https://nexon.eazotel.com/eazotel/edit-contact-query",
        {
          token: localStorage.getItem("token"),
          Contact: lead.Contact,
          Email: lead.Email,
          Message: lead.Email,
          Name: lead.Name,
          Remark: lead.Remark,
          Subject: lead.Subject,
          id: lead._id,
          converted_by: lead.converted_by,
          created_from: lead.created_from,
          is_convertable: true,
          is_converted: false,
          ndid: lead.ndid,
          status: status,
          note: note,
        }
      );

      const result = await response.data;

      Swal.fire({
        icon: "success",
        title: "Query Status Updated!",
        text: result.Message || "Query has been updated successfully.",
        timer: 600,
        showConfirmButton: false,
      }).then(() => {
        if (result.Status) {
          handleTabClick(activeIndex);

          // fetchEnquires(localStorage.getItem('token'));
        }
      });

      onClose();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error updating Query Status",
      });
    }
  };

  // const callDetails = {
  //   ndid: "5617a084-5783-4bac-b299-bdb6e8e471bb",
  //   call_sid: "CA49997f6b9640e8a706d807d5c6d79e40",
  //   call_from: "+18454421865",
  //   call_to: "+919528295631",
  //   guest_name: "Abhijeet",
  //   status: "completed",
  //   start_time: "2025-09-22T10:48:39.008000",
  //   end_time: null,
  //   transcript: [
  //     {
  //       speaker: "AI",
  //       text: "Hello Abhijeet ! Thank you for calling Test multi. We have recieved you query for room booking from 27-09-2025 to 29-09-2025.I'm here to help you with reservations and answer any questions about our hotel. How can I assist you today? Do you want to confirm you reservation",
  //       timestamp: "2025-09-22T10:47:54.881000",
  //     },
  //     {
  //       speaker: "Customer",
  //       text: "yes, I want to confirm",
  //       timestamp: "2025-09-22T10:48:21.727000",
  //     },
  //     {
  //       speaker: "AI",
  //       text: "Hello Thanks you for calling me",
  //       timestamp: "2025-09-22T10:48:21.872000",
  //     },
  //     {
  //       speaker: "Customer",
  //       text: "Hello, how are you?",
  //       timestamp: "2025-09-22T10:48:28.296000",
  //     },
  //     {
  //       speaker: "AI",
  //       text: "Hello Thanks you for calling me",
  //       timestamp: "2025-09-22T10:48:28.428000",
  //     },
  //     {
  //       speaker: "Customer",
  //       text: "Can you please reply on McCreery?",
  //       timestamp: "2025-09-22T10:48:34.806000",
  //     },
  //     {
  //       speaker: "AI",
  //       text: "Hello Thanks you for calling me",
  //       timestamp: "2025-09-22T10:48:34.936000",
  //     },
  //   ],
  //   call_record_data: {
  //     recording_sid: "",
  //     recording_url: "",
  //     recording_status: "completed",
  //     recording_duration: "53",
  //     recording_updated_at: "2025-09-22T10:48:43.404788",
  //   },
  //   duration: 53,
  //   created_at: "2025-09-22T10:47:54.755000",
  //   updated_at: "2025-09-22T10:48:43.477000",
  // };

  const fetchCallData = async () => {
    setCallDetailsLoading(true);
    try {
      const response = await axios.get(
        `${NEW_BASE_URL}/api/v1/call/${lead?.guest_id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const result = await response.data;
      setCallDetails(result?.data);
      setCallDetailsLoading(false);
    } catch (error) {
      // console.log(error);
      setCallDetailsLoading(false);
    }
  };

  const updateNote = async (id) => {
    setIsNoteUpdateLoading(true);
    try {
      await axios.put(`${BASE_URL}/eazotel/add-note/${id}`, {
        token: localStorage.getItem("token"),
        note: note,
      });
    } catch (error) {
      console.error("Error updating note:", error);
    } finally {
      setIsNoteUpdateLoading(false);
      setIsEdit(false);
    }
  };

  // console.log(lead);

  useEffect(() => {
    if (lead) {
      fetchCallData();
    }
  }, [lead]);

  if (!lead) return null;
  return (
    <div
      // onClick={onClose}
      className={`fixed cursor-pointer z-[99999] inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 transition-opacity ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      // className={`fixed cursor-pointer inset-0  bg-black bg-opacity-50 transition-opacity ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
    >
      <div className="bg-[#f8f8fb] max-md:overflow-y-auto  px-4 pb-4 pt-2 rounded-sm lg:w-[60%] md:w-[50%] w-full md:h-auto h-full">
        <div className="flex justify-between py-3">
          <div className="text-black space-x-3">
            {Tabs?.map((tab, index) => (
              <button
                key={index}
                onClick={() => handleTabChange(index)}
                className={`text-base font-medium ${
                  index === activeTab
                    ? "bg-primary text-white px-4 py-2 rounded-md"
                    : "text-[#575757]/70"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              onClose();
              setCallDetails(null);
              setActiveTab(0);
            }}
            className="inline-flex items-center text-primary hover:text-blue-800"
          >
            <MdOutlineClose size={28} />
          </button>
        </div>

        {activeTab === 0 && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-[#575757] capitalize flex items-center gap-1.5">
                <span className="md:hidden block" onClick={onClose}>
                  <IoMdArrowRoundBack />
                </span>
                {lead?.Name}
              </h2>
              {/* <button
                onClick={onClose}
                className="text-[#575757]/70 text-2xl hover:text-[#575757] md:block hidden"
              >
                &times;
              </button> */}
            </div>
            {/* <div className="bg-purple-500 text-white px-4 py-2 font-medium uppercase rounded-sm w-max mb-4">Uncontacted</div> */}

            <div className="grid grid-cols-1 lg:grid-cols-2  gap-4">
              <div>
                <h1 className="font-medium text-[#575757]">Customer Info</h1>
                <div className=" grid gap-4 shadow-sm p-4 rounded-sm mt-2 text-base bg-white divide-y">
                  <div className="flex items-center gap-2 justify-between">
                    <div>
                      <p className=" font-medium text-[#575757]">
                        Mobile Number:
                      </p>
                      <Link
                        to={`tel:${formatPhoneNumber(lead?.Contact)}`}
                        className="text-[#575757]/70"
                      >
                        {formatPhoneNumber(lead?.Contact)}
                      </Link>
                    </div>

                    <Link
                      to={`tel:${formatPhoneNumber(lead?.Contact)}`}
                      className="text-primary"
                    >
                      <FaPhone size={18} />
                    </Link>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2">
                    <div>
                      <p className=" font-medium text-[#575757]">
                        {" "}
                        Email Address:
                      </p>
                      <Link
                        to={`mailto:${lead?.Email}`}
                        className="text-[#575757]/70 flex items-center gap-1 "
                      >
                        {lead?.Email}
                      </Link>
                    </div>

                    <Link to={`mailto:${lead?.Email}`} className="text-primary">
                      <MdMail size={22} />
                    </Link>
                  </div>

                  <div className="flex flex-col gap-2 text-[#575757] pt-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-[#575757]">
                            Check In :{" "}
                          </span>
                          <p>
                            {lead?.check_in
                              ? lead?.check_in
                              : extractBookingInfo(lead?.Message)?.checkIn
                              ? extractBookingInfo(lead?.Message)?.checkIn
                              : "-"}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[#575757] font-semibold">
                            Check Out :
                          </span>
                          <p>
                            {lead?.check_out
                              ? lead?.check_out
                              : extractBookingInfo(lead?.Message)?.checkOut
                              ? extractBookingInfo(lead?.Message)?.checkOut
                              : "-"}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-[#575757] font-semibold">
                              Number of Guests :
                            </span>
                            <p>
                              {lead?.number_of_guest
                                ? lead?.number_of_guest
                                : extractBookingInfo(lead?.Message)?.guests
                                ? extractBookingInfo(lead?.Message)?.guests
                                : "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-primary">
                        <FaUser size={22} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div>
                    <h3 className=" font-medium text-[#575757] mb-2">
                      Customer Message
                    </h3>

                    <div className="shadow-sm p-4 bg-white">
                      {lead?.Message ? (
                        <p className="text-[#575757]/70 text-base">
                          {lead?.Message.slice(0, 700)}
                        </p>
                      ) : (
                        <p className="text-[#575757]/70 text-base">
                          No message found
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="bg-white rounded-lg border h-68 overflow-auto">
                  <div className="border-b border-gray-200 p-3">
                    <h2 className="text-md font-semibold text-gray-900 flex items-center">
                      <i className="fas fa-comments text-blue-600"></i>
                      Conversations
                    </h2>
                  </div>

                  <div className="p-3 h-full">
                    <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hidden">
                      {!lead?.chats || lead?.chats?.length === 0 ? (
                        <div>No conversation found</div>
                      ) : (
                        lead?.chats?.map((t, idx) => (
                          <div
                            key={idx}
                            className={`flex ${
                              t.senderType === "bot"
                                ? "justify-start"
                                : "justify-end"
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-90 ${
                                t.speaker === "bot"
                                  ? "bg-blue-100 text-blue-900"
                                  : "bg-gray-100 text-gray-900"
                              } rounded-lg px-4 py-2`}
                            >
                              <div className="flex items-center mb-1">
                                {t.senderType === "bot" ? (
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
                                  {new Date(t.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                              <div
                                className="text-sm"
                                dangerouslySetInnerHTML={{ __html: t.message }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="" className="text-gray-600 font-medium">
                    Notes
                  </label>

                  <div>
                    <textarea
                      onChange={(e) => {
                        setIsEdit(true);
                        setNote(e.target.value);
                      }}
                      value={note?.text || note}
                      rows={2}
                      placeholder="Enter notes"
                      className="w-full border border-gray-400 bg-white mt-1 outline-none rounded-sm p-3"
                    />
                    {note?.updated_at && (
                      <p className="text-xs text-gray-600 font-medium">
                        Note Updated at :{" "}
                        {new Date(note?.updated_at).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    )}
                  </div>
                </div>
                {isEdit && (
                  <button
                    onClick={() => updateNote(lead._id)}
                    className="px-6 py-1 bg-green-600 rounded-md text-white"
                  >
                    {isNoteUpdateLoading ? "Please wait..." : "Save"}
                  </button>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 items-center mt-3">
              <div className="flex xl:flex-row flex-col justify-between gap-5">
                <div className="gap-4">
                  {/* <select
                    className="py-2  px-3 gap-2 xl:w-[150px] w-full bg-green-600 rounded-sm flex items-center capitalize text-base font-medium text-white"
                    onChange={(e) => handleQueryStatus(e.target.value)}
                    value={lead.status || ""}
                  >
                    <option value="" disabled className="text-white bg-white">
                      Select Status
                    </option>
                    <option value="Converted" className="bg-white text-black">
                      Converted
                    </option>
                    <option value="Contacted" className="bg-white  text-black">
                      Contacted
                    </option>
                    <option value="Open" className="bg-white  text-black">
                      Open
                    </option>
                  </select> */}

                  <select
                    className="border border-gray-300 rounded-md px-4 py-2"
                    onChange={(e) => handleQueryStatus(e.target.value)}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    {header.map((item, index) => (
                      <option value={item.value} key={index}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {lead.Contact && (
                  <div>
                    <div
                      // to={`https://wa.me/${formatPhoneNumber(
                      //   lead.Contact
                      // )}?text=${encodeURIComponent(
                      //   `Hi ${lead.Name}! 👋\nWelcome to ${hotelName} 🌐\nHow can I assist you today?`
                      // )}`}
                      target="_blank"
                      className="py-2 px-3 gap-2 bg-green-600 rounded-sm flex items-center capitalize text-base font-medium text-white"
                      onClick={() => setQuickResponePopup(true)}
                    >
                      <FaWhatsapp size={20} className="" /> send quick response
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-end items-center gap-5 lg:mt-0 mt-4">
                  <button
                    className="bg-red-900 hover:bg-red-900/90 text-white px-4 py-2 rounded-sm"
                    onClick={() => handleDelete(lead._id, lead.Email)}
                  >
                    Delete
                  </button>
                  <button
                    className="bg-[#0a3a75] hover:bg-[#0a3a75]/90 text-white px-4 py-2 rounded-sm"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
                <div className="flex flex-col items-end mt-2">
                  <p className="text-xs text-gray-600 font-medium">
                    Created at :{" "}
                    {new Date(lead?.Created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>

                  <p className="text-xs text-gray-600 font-medium">
                    Updated at :{" "}
                    {new Date(lead?.updated_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 1 && (
          <CallDetails call={callDetails} isLoading={callDetailsLoading} />
        )}
      </div>

      <QuickResponsePopup
        open={quickResponePopup}
        setOpen={setQuickResponePopup}
        lead={lead}
        hotelName={hotelName}
      />
    </div>
  );
};

export default LeadPopup;
