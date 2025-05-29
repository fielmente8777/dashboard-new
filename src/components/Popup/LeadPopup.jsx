import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Arrow } from "../../icons/icon";
import axios from "axios";
import Swal from "sweetalert2";
import { extractBookingInfo } from "../../pages/Enquiry/Leads";

const LeadPopup = ({
  hotelName = "Eazotel",
  isOpen,
  onClose,
  lead,
  fetchEnquires,
  handleTabClick,
  activeIndex,
}) => {
  if (!lead) return null;

  // console.log(lead)
  const handleDelete = async (id, email) => {
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

  return (
    <div
      // onClick={onClose}
      className={`fixed cursor-pointer inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      // className={`fixed cursor-pointer inset-0  bg-black bg-opacity-50 transition-opacity ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
    >
      <div className="bg-[#f8f8fb] px-4 pb-4 pt-2 rounded-sm w-[60%] ">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-[#575757] capitalize">
            {lead?.Name}
          </h2>
          <button
            onClick={onClose}
            className="text-[#575757]/70 text-2xl hover:text-[#575757]"
          >
            &times;
          </button>
        </div>
        {/* <div className="bg-purple-500 text-white px-4 py-2 font-medium uppercase rounded-sm w-max mb-4">Uncontacted</div> */}

        <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
          <div>
            <h1 className="font-medium text-[#575757]">Customer Info</h1>
            <div className=" grid gap-4 shadow-sm p-4 rounded-sm mt-2 text-base bg-white">
              <div>
                <p className=" font-medium text-[#575757]">Mobile Number:</p>
                <p className="text-[#575757]/70">{lead?.Contact}</p>
              </div>

              <div>
                <p className=" font-medium text-[#575757]">Email Address:</p>
                <p className="text-[#575757]/70">{lead?.Email}</p>
              </div>

              <div className="flex flex-col gap-2 text-[#575757]">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-[#575757]">
                    Check In :{" "}
                  </span>
                  <p>
                    {lead?.check_in
                      ? lead?.check_in
                      : extractBookingInfo(lead?.Message).checkIn
                      ? extractBookingInfo(lead?.Message).checkIn
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
                      : extractBookingInfo(lead?.Message).checkOut
                      ? extractBookingInfo(lead?.Message).checkOut
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
                        : extractBookingInfo(lead?.Message).guests
                        ? extractBookingInfo(lead?.Message).guests
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
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

        <div className="flex justify-between mt-4">
          <div className="flex gap-5">
            <div className=" gap-4">
              {/* <button
                                className="py-2 px-3 gap-2 w-[150px] bg-green-600 justify-between rounded-sm flex items-center capitalize text-base font-medium text-white">

                                Status
                                <div className="-rotate-90">
                                    <Arrow size={20} className="-rotate-90" />
                                </div>
                            </button> */}

              <select
                className="py-2 px-3 gap-2 w-[150px] bg-green-600 rounded-sm flex items-center capitalize text-base font-medium text-white"
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
              </select>
            </div>
            {lead.Contact && (
              <div>
                <Link
                  to={`https://wa.me/${lead.Contact}?text=Hi%20${lead.Name}!%20%F0%9F%91%8B%0AWelcome%20to%20${hotelName}%20%F0%9F%8C%90%0AHow%20can%20I%20assist%20you%20today%3F`}
                  target="_blank"
                  className="py-2 px-3 gap-2 bg-green-600 rounded-sm flex items-center capitalize text-base font-medium text-white"
                >
                  <FaWhatsapp size={20} className="" /> send quick response
                </Link>
              </div>
            )}
          </div>

          <div className="flex gap-5">
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
        </div>
      </div>
    </div>
  );
};

export default LeadPopup;
