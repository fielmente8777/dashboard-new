import React, { useCallback, useEffect, useState } from "react";
import { MdClose, MdRefresh } from "react-icons/md";
import LeadPopup, { formatPhoneNumber } from "../../components/Popup/LeadPopup";
import { Arrow, Filter, Search } from "../../icons/icon";
import { formatDateTime } from "../../services/formateDate";
import handleLocalStorage from "../../utils/handleLocalStorage";
import { getAllClientEnquires } from "../../services/api/clientEnquire.api";
import FilterPopup from "../../components/Popup/FilterPopup";
import { FaFileExcel, FaPlus, FaTrash, FaTrashAlt } from "react-icons/fa";
import jsonToCsvExport from "json-to-csv-export";
import axios from "axios";
import Swal from "sweetalert2";
import { MdDeleteOutline } from "react-icons/md";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReservationForm from "../../components/ReservationForm/hotel_reservation_form_react_frontend";
import {
  addLeadGenForm,
  deleteLMultipleeadGenForm,
} from "../../services/api/MetaLeads.api";
import { useSelector } from "react-redux";
import Loader from "../../components/Loader";
export const extractBookingInfo = (input) => {
  if (!input) return null;
  const parts = input.split(",");
  const booking = {
    checkIn: "",
    checkOut: "",
    guests: 0,
  };

  parts.forEach((part) => {
    const [key, value] = part.split(":").map((s) => s.trim());
    if (key === "check-in") booking.checkIn = value;
    if (key === "check-out") booking.checkOut = value;
    if (key === "number of guest") booking.guests = parseInt(value, 10);
  });

  return booking;
};
const header = [
  "All",
  "Open Queries",
  "Contacted",
  "Converted",
  "Out Of Budget",
  "Potential For Later",
  "Quotation Provided",
  "Dead Lead",
  "Date Sold Out",
  "Duplicate",
  "Hot",
];

const Leads = () => {
  const { user: hotel } = useSelector((state) => state.userProfile);

  const [active, setActive] = useState(0);

  const [exportedData, setExportedData] = useState([]);
  const [enquires, setEnquires] = useState([]);
  const [filteredEnquires, setFilteredEnquires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [open, setOpen] = useState(false);

  const [filterPopup, setFilterPopup] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reserveData, setReserveData] = useState(null);

  const [rowSelected, setRowSelected] = useState([]);
  const [newRow, setNewRow] = useState(null);
  const [isLeadLoading, setIsLeadLoading] = useState(false);

  const [lead, setLead] = useState({
    Domain: "",
    hId: localStorage.getItem("hid"),
    email: "",
    name: "",
    contact: "",
    Description: "",
    check_in: "",
    check_out: "",
    created_from: "webform",
  });

  const setDateRange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      // Normalize to full-day range
      // console.log("inn");
      const startOfDay = new Date(start);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(end);
      endOfDay.setHours(23, 59, 59, 999);

      const filtered = enquires.filter((item) => {
        const createdAtDate = new Date(item.Created_at);
        return createdAtDate >= startOfDay && createdAtDate <= endOfDay;
      });

      setFilteredEnquires(filtered);
    }
  };

  const createExportData = (apiData) => {
    return apiData.map((item) => {
      const message = item?.Message || "";

      const checkInMatch = message.match(/check-in:\s*(\d{2}-\d{2}-\d{4})/i);
      const checkOutMatch = message.match(/check-out:\s*(\d{2}-\d{2}-\d{4})/i);
      const guestsMatch = message.match(/number of guest:\s*([\w\s\d]+)/i);
      return {
        ...item,
        check_in: checkInMatch ? checkInMatch[1] : null,
        check_out: checkOutMatch ? checkOutMatch[1] : null,
        number_of_guest: guestsMatch ? guestsMatch[1].trim() : null,
      };
    });
  };

  const fetchEnquires = async (token) => {
    setLoading(true);
    try {
      const hid = handleLocalStorage("hid");
      const response = await getAllClientEnquires({
        token,
        hid,
        // status: "Open",
      });
      const data = createExportData(response);
      setExportedData(data);
      const quer = response.filter(
        (enq) => enq.Contact && enq.Contact !== "undefined"
      );
      setEnquires(quer?.reverse());
    } catch (error) {
      console.error("Error fetching enquires:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquires(localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0 && enquires.length > 0) {
      const filtered = enquires.filter(
        (enquery) =>
          enquery?.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          enquery?.Contact?.includes(searchTerm) ||
          enquery?.Message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEnquires(filtered);
    } else {
      setFilteredEnquires(enquires);
    }
    setCurrentPage(1); // Reset to page 1 when search or data changes
  }, [searchTerm, enquires]);

  const handleTabClick = async (index) => {
    setSearchTerm("");
    setLoading(true);
    setActive(index);
    setCurrentPage(1);

    // setNewRow((prev) => ({
    //   ...prev,
    //   stages: header[index],
    // }));
    const token = localStorage.getItem("token");
    const hid = handleLocalStorage("hid");

    // console.log(index);

    try {
      let response;
      switch (Number(index) + 1) {
        case 0:
          response = await getAllClientEnquires({ token, hid });
          break;
        case 2:
          response = await getAllClientEnquires({ token, hid, status: "Open" });
          break;
        case 3:
          response = await getAllClientEnquires({
            token,
            hid,
            status: "Contacted",
          });
          break;
        case 4:
          response = await getAllClientEnquires({
            token,
            hid,
            status: "Converted",
          });
          break;

        case 5:
          response = await getAllClientEnquires({
            token,
            hid,
            status: "Out Of Budget",
          });
          break;

        case 6:
          response = await getAllClientEnquires({
            token,
            hid,
            status: "Potential",
          });
          break;

        case 7:
          response = await getAllClientEnquires({
            token,
            hid,
            status: "Quotation Provided",
          });
          break;

        case 8:
          response = await getAllClientEnquires({
            token,
            hid,
            status: "Dead Lead",
          });
          break;

        case 9:
          response = await getAllClientEnquires({
            token,
            hid,
            status: "Date Sold Out",
          });
          break;

        case 10:
          response = await getAllClientEnquires({
            token,
            hid,
            status: "Duplicate",
          });
          break;

        case 11:
          response = await getAllClientEnquires({
            token,
            hid,
            status: "Hot",
          });
          break;
        default:
          response = await getAllClientEnquires({ token, hid });
      }
      // console.log(response);
      setEnquires(response?.reverse());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // const handleQueryStatus = async (status) => {
  //     try {
  //       const response = await axios.post(
  //         "https://nexon.eazotel.com/eazotel/edit-contact-query",
  //         {
  //           token: localStorage.getItem("token"),
  //           Contact: lead.Contact,
  //           Email: lead.Email,
  //           Message: lead.Email,
  //           Name: lead.Name,
  //           Remark: lead.Remark,
  //           Subject: lead.Subject,
  //           id: lead._id,
  //           converted_by: lead.converted_by,
  //           created_from: lead.created_from,
  //           is_convertable: true,
  //           is_converted: false,
  //           ndid: lead.ndid,
  //           status: status,
  //         }
  //       );

  //       const result = await response.data;

  //       Swal.fire({
  //         icon: "success",
  //         title: "Query Status Updated!",
  //         text: result.Message || "Query has been updated successfully.",
  //         timer: 600,
  //         showConfirmButton: false,
  //       }).then(() => {
  //         if (result.Status) {
  //           handleTabClick(activeIndex);

  //           // fetchEnquires(localStorage.getItem('token'));
  //         }
  //       });

  //       onClose();
  //     } catch (error) {
  //       Swal.fire({
  //         icon: "error",
  //         title: "Error",
  //         text: "Error updating Query Status",
  //       });
  //     }
  //   };

  // Pagination Logic
  const totalPages = Math.ceil(filteredEnquires.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredEnquires.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page) => {
    setRowSelected([]);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const headers = [
    { key: "Name", label: "Name" },
    { key: "Contact", label: "Contact" },
    { key: "Email", label: "Email" },
    { key: "check_in", label: "Check In" },
    { key: "check_out", label: "Check Out" },
    { key: "number_of_guest", label: "Number of Guest" },
    { key: "Message", label: "Message" },
    { key: "created_from", label: "Lead Source" },
    { key: "status", label: "Status" },
  ];

  const handleStatusChange = async (lead, status) => {
    if (status === "Reserved") {
      setReserveData(lead);
      return;
    }
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
          handleTabClick(active);
          // fetchEnquires(localStorage.getItem("token"));
        }
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error updating Query Status",
      });
    }
  };

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

        // onClose();
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "User Management API error. Please try again.",
        });
      }
    }
  };
  const handleRowSelect = (id) => {
    if (rowSelected.length < 10) {
      setRowSelected((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      if (rowSelected.includes(id)) {
        setRowSelected((prev) => prev.filter((item) => item !== id));
        return;
      }
      alert("You can select only 10 rows at a time");
    }
  };

  // const handleSelectAll = () => {
  //   setRowSelected((prev) =>
  //     prev.length === currentItems.length
  //       ? []
  //       : currentItems.map((item) => item._id)
  //   );
  // };

  const handleCloseModal = () => setNewRow(false);

  const handleDeleteAll = () => {
    // alert("We are working on it");
    Swal.fire({
      title: "Are you sure?",
      text: `This will permanently delete ${"this record"}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const data = await deleteLMultipleeadGenForm(rowSelected);
        if (data?.Status) {
          fetchEnquires(localStorage.getItem("token"));
          Swal.fire("Deleted!", "The record has been removed.", "success");
          setRowSelected([]);
        } else {
          Swal.fire("Error!", data?.Message, "error");
        }
      }
    });
  };

  const handleAddRow = () => {
    setNewRow({
      id: Date.now(), // temp id
      name: "",
      contact: "",
      email: "",
      status: "",
      check_in: "",
      check_out: "",
      number_of_guest: "",
      source: "Dashboard",
      isReserved: false,
    });
  };

  const handleSaveRow = async () => {
    setIsLeadLoading(true);
    if (!lead?.name || !lead?.contact || !lead?.email) {
      alert("Please fill all fields");
      setIsLeadLoading(false);
      return;
    }

    const formData = {
      Domain: hotel?.Profile?.domain,
      Contact: lead.contact,
      email: lead.email,
      hId: localStorage.getItem("hid"),
      Description: "",
      Name: lead.name,
      Remark: "",
      Subject: null,
      check_in: `${lead.check_in}`,
      check_out: `${lead.check_out}`,
      numbers_of_guest: ``,
      created_from: lead.created_from,
    };

    try {
      const data = await addLeadGenForm(formData);
      if (data?.Status) {
        fetchEnquires(localStorage.getItem("token"));
        Swal.fire("Success", data?.Message, "success");
      }
    } catch (error) {
      // console.log(error);
    } finally {
      setIsLeadLoading(false);
      setNewRow(null);
    }

    // add new row at the start
    // setCurrentItems([newRow, ...currentItems]);
    // setNewRow(null);
  };

  const handleCancelRow = () => {
    setNewRow(null);
  };
  const [btnLength, setBtnLength] = useState(header.length);

  useEffect(() => {
    const updateBtnLength = () => {
      let length;

      if (window.innerWidth <= 768) {
        length = 3; // mobile (sm)
      } else if (window.innerWidth < 1024) {
        length = 4; // tablet (md)
      } else {
        length = header.length; // desktop (lg+)
      }

      setBtnLength(length);
    };

    // run on mount
    updateBtnLength();

    // update on resize
    window.addEventListener("resize", updateBtnLength);
    return () => window.removeEventListener("resize", updateBtnLength);
  }, [header]);

  return (
    <div className="cardShadow">
      <div className="flex flex-col justify-between  bg-white">
        {/* <div className="flex flex-wrap mt-4">
          {header.slice(0, btnLength).map((item, index) => (
            <button
              onClick={() => handleTabClick(index)}
              key={index}
              className={`text-[14px] whitespace-nowrap ${
                active === index
                  ? "border-b-2 !border-[#575757]"
                  : "border-b-2 border-transparent"
              } px-4 py-3 bg-white font-medium text-[#575757] hidden sm:block`}
            >
              {item}
            </button>
          ))}
          <div className="min-lg:hidden">
            <button
              type="button"
              className="px-4 py-3 bg-white"
              onClick={() => setFilterPopup(!filterPopup)}
            >
              {filterPopup ? <MdClose /> : <Filter size={25} />}
            </button>
            <div
              className={`w-[80%] h-full bg-white flex flex-col gap-2 fixed top-[7rem] transition-all duration-300 ease-in-out z-50 ${
                filterPopup ? "right-2" : "right-[-100%]"
              }`}
            >
              {header.map((item, index) => (
                <button
                  onClick={() => handleTabClick(index)}
                  key={index}
                  className={`text-[14px] whitespace-nowrap ${
                    active === index
                      ? "border-l-2 border-[#575757]"
                      : "border-l-2 border-transparent"
                  } px-4 py-3 bg-white font-medium text-[#575757]`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div
            onClick={() => fetchEnquires(localStorage.getItem("token"))}
            className={`flex justify-end items-center text-[#575757] px-3 cursor-pointer ${
              loading ? "animate-spin" : ""
            } `}
          >
            <MdRefresh size={25} />
          </div>
        </div> */}

        {/* <div className=" py-2 px-4 mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <label
            htmlFor="itemsPerPage"
            className="text-sm font-medium whitespace-nowrap text-gray-700"
          >
            Items per page:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="border  sm:w-fit border-gray-300 rounded-md px-1 lg:px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>

          <div
            onClick={() => jsonToCsvExport({ data: exportedData, headers })}
            className="bg-green-500 w-fit text-white border py-1 px-3 cursor-pointer rounded flex items-center gap-2 "
          >
            <FaFileExcel />
            <span className="font-medium">Export</span>
          </div>

          <div
            onClick={handleAddRow}
            className="bg-green-500 w-fit text-white border py-1 px-3 cursor-pointer rounded flex items-center gap-2 "
          >
            <FaPlus />
            <span className="font-medium">Add Lead</span>
          </div>
        </div> */}
      </div>

      <div className="bg-white p-4 mb-10">
        <div className="flex lg:flex-row flex-col justify-between lg:items-center mb-4">
          <div className="flex lg:flex-row flex-col justify-between lg:items-center gap-2 max-w-3xl w-full">
            {/* <div className="relative w-3/4"> */}
            <div>
              <select
                className="border border-gray-300 rounded-md px-4 py-2 lg:w-fit w-full"
                onChange={(e) => handleTabClick(e.target.value)}
              >
                {header.map((item, index) => (
                  <option
                    value={index}
                    key={index}
                    // onClick={() => handleTabClick(index)}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full">
              <span className="absolute top-3.5 left-2 -z-10">
                <Search />
              </span>
              <input
                type="text"
                placeholder="Search clients by name, contact or message"
                className=" px-3 pl-2 lg:pl-8 w-full py-2 text-[14px] border rounded-md outline-none"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full">
              <div className="border border-gray-300 rounded-md p-1.5 w-full">
                <DatePicker
                  // maxDate={msg?.disabled ? new Date() : undefined}
                  className="outline-none w-full"
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  required
                  onChange={(update) => {
                    setDateRange(update);
                  }}
                  popperClassName="!z-50"
                  placeholderText="Select date range"
                  // isClearable
                  // minDate={new Date()}
                />
              </div>

              {startDate && endDate && (
                <span
                  className="text-[#575757] text-[14px] font-semibold cursor-pointer"
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);

                    fetchEnquires(localStorage.getItem("token"));
                  }}
                >
                  Clear
                </span>
              )}
            </div>

            {/* <div className="w-1/3">
            <button
              className="w-full px-4 py-2 text-[#575757] text-[14px] font-medium bg-gray-200 rounded-md flex items-center justify-between"
              onClick={() => setFilterPopup(true)}
            >
              <span className="flex items-center gap-2">
                <Filter className="w-2 h-2" /> Filter
              </span>
              <span className="text-[#575757] text-[14px] font-semibold rotate-180">
                <Arrow />
              </span>
            </button>

            <FilterPopup open={filterPopup} setOpen={setOpen} />
          </div> */}
          </div>

          <div className="py-2 lg:px-4 flex flex-col sm:flex-row sm:items-center gap-4">
            {/* <label
              htmlFor="itemsPerPage"
              className="text-sm font-medium whitespace-nowrap text-gray-700"
            >
              Items per page:
            </label> */}
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border  sm:w-fit border-gray-300 rounded-md px-1 lg:px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <div
              onClick={() => jsonToCsvExport({ data: exportedData, headers })}
              className="bg-green-500 w-fit text-white border py-1 px-3 cursor-pointer rounded flex items-center gap-2 "
            >
              <FaFileExcel />
              <span className="font-medium">Export</span>
            </div>

            <div
              onClick={handleAddRow}
              className="bg-green-500 whitespace-nowrap w-fit text-white border py-1 px-3 cursor-pointer rounded flex items-center gap-2 "
            >
              <FaPlus />
              <span className="font-medium">Add Lead</span>
            </div>
          </div>
        </div>

        {!loading ? (
          <div className="overflow-auto">
            {rowSelected?.length > 0 && (
              <button
                className="mb-2 bg-red-700/90 text-white rounded-lg px-3 py-2 text-sm flex items-center gap-2"
                onClick={handleDeleteAll}
              >
                Delete <span>{rowSelected.length}</span>{" "}
                <FaTrashAlt size={12} />
              </button>
            )}
            <div className="max-h-[700px] overflow-y-auto flex flex-col items-start">
              <table className="w-full text-left bg-[#0a3a75] text-white/90 rounded-sm shadow-md shadow-black/20">
                <thead className="sticky top-0 bg-[#0a3a75] z-10">
                  <tr className="border-b">
                    <th className="py-3 px-2 text-[14px] font-medium capitalize">
                      {/* <input
                      type="checkbox"
                      onClick={handleSelectAll}
                      checked={rowSelected.length === currentItems.length}
                    /> */}
                      Select
                    </th>

                    <th className="py-3 px-2 text-[14px] font-medium capitalize">
                      #
                    </th>
                    {/* <th className="py-3 px-2 text-[14px] font-medium capitalize">
                    Reserve
                  </th> */}
                    <th className="py-3 px-2 text-[14px] font-medium capitalize">
                      Date Added
                    </th>
                    <th className="py-3 px-2 text-[14px] font-medium capitalize">
                      Source
                    </th>

                    {/* <th className="py-3 px-2 text-[14px] font-medium capitalize">
                    Source Url
                  </th> */}
                    <th className="py-3 px-2 text-[14px] font-medium capitalize">
                      Name
                    </th>
                    <th className="py-3 px-2 text-[14px] font-medium capitalize">
                      Contact
                    </th>
                    <th className="py-3 px-2 text-[14px] font-medium capitalize">
                      Email
                    </th>
                    <th className="py-3 px-4 text-[14px] font-medium capitalize whitespace-nowrap">
                      Number of Guests
                    </th>
                    <th className="py-3 px-2 text-[14px] font-medium capitalize whitespace-nowrap">
                      Check In
                    </th>
                    <th className="py-3 px-2 text-[14px] font-medium capitalize whitespace-nowrap">
                      Check Out
                    </th>
                    <th className="py-3 px-2 text-[14px] font-medium capitalize">
                      Stages
                    </th>

                    <th className="py-3 px-2 text-[14px] font-medium capitalize">
                      Actions
                    </th>
                  </tr>
                </thead>

                {currentItems?.length > 0 ? (
                  <tbody>
                    {/* {newRow && (
                    <tr className="text-sm border-b border-gray-200 text-[#575757] bg-blue-100">
                      <td className="py-2 px-2">-</td>
                      <td className="text-black p-2">-</td>
                      <td className="py-2 px-2">
                        {newRow.isReserved ? "Reserved" : "Unreserved"}
                        <select
                          onChange={(e) => {
                            setNewRow({
                              ...newRow,
                              isReserved: e.target.value,
                            });
                          }}
                          value={newRow.isReserved}
                        >
                          <option value="">Select</option>
                          <option value={false}>Unreserved</option>
                          <option value={true}>Reserved</option>
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          className="outline-none px-2 py-1"
                          value={formatDateTime(new Date())}
                          readOnly
                          onChange={(e) =>
                            setNewRow({ ...newRow, date: e.target.value })
                          }
                        />
                      </td>
                      <td className="py-2 px-2 font-medium">
                        Dashboard
                        <select
                          onChange={(e) => {
                            setNewRow({ ...newRow, source: e.target.value });
                          }}
                          className="outline-none px-2 py-1"
                          value={newRow.source}
                        >
                          <option value="">Select</option>
                          <option value="Dashboard">Dashboard</option>
                          <option value="Eazbot">Eazbot</option>
                          <option value="WebForm">WebForm</option>
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          placeholder="Name"
                          className="outline-none px-2 py-1"
                          value={newRow.name}
                          onChange={(e) =>
                            setNewRow({ ...newRow, name: e.target.value })
                          }
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          placeholder="Contact"
                          className="outline-none px-2 py-1"
                          value={newRow.contact}
                          onChange={(e) =>
                            setNewRow({ ...newRow, contact: e.target.value })
                          }
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="email"
                          placeholder="Email"
                          className="outline-none px-2 py-1"
                          value={newRow.email}
                          onChange={(e) =>
                            setNewRow({ ...newRow, email: e.target.value })
                          }
                        />
                      </td>

                      <td className="py-2 px-2">
                        <input
                          type="date"
                          placeholder="date"
                          className="border px-2 py-1 rounded w-full"
                          value={newRow.check_in}
                          onChange={(e) =>
                            setNewRow({ ...newRow, check_in: e.target.value })
                          }
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="date"
                          placeholder="Email"
                          className="border px-2 py-1 rounded w-full"
                          value={newRow.check_out}
                          onChange={(e) =>
                            setNewRow({ ...newRow, check_out: e.target.value })
                          }
                        />
                      </td>
                      <td className="py-2 px-2">
                        Open
                        <select
                          onChange={(e) => {
                            setNewRow({ ...newRow, status: e.target.value });
                          }}
                          value={newRow.status}
                        >
                          <option value="">Select</option>
                          <option value="Open">Open</option>
                          <option value="Out Of Budget">Out Of Budget</option>
                          <option value="Dead Lead">Dead Lead</option>
                        </select>
                      </td>
                      <td className="py-2 px-2 flex gap-2">
                        <button
                          onClick={handleSaveRow}
                          className="px-3 py-1 bg-green-500 text-white rounded flex items-center gap-1"
                        >
                          Save {isLeadLoading && <Loader color="#fff" />}
                        </button>
                        <button
                          onClick={handleCancelRow}
                          className="px-3 py-1 bg-gray-400 text-white rounded"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  )} */}

                    {currentItems.map((enquery, index) => {
                      if (!enquery.Contact || enquery.Contact === "undefined")
                        return null;
                      return (
                        <tr
                          key={index}
                          className={`py-1 border-b odd:bg-gray-50 even:bg-gray-100 border-gray-200 hover:bg-[#f8f8fb] transition duration-300 cursor-pointer ${
                            enquery?.status === "Open"
                              ? " text-[#575757]"
                              : "text-[#575757]"
                          }`}
                          onClick={() => {
                            setSelectedLead(enquery);
                            setIsPopupOpen(true);
                          }}
                        >
                          <td className="py-3 px-2 text-[14px] capitalize whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={rowSelected.includes(enquery?._id)}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowSelect(enquery?._id);
                              }}
                            />
                          </td>
                          <td className="py-3 px-2 text-[14px] capitalize whitespace-nowrap">
                            {index + 1}
                          </td>

                          {/* <td
                        className="py-3 px-2 text-[14px] capitalize whitespace-nowrap"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReserveData(enquery);
                        }}
                      >
                        Unreserved
                      </td> */}

                          <td className="py-3 px-2 text-[14px] whitespace-nowrap capitalize">
                            {enquery?.Created_at
                              ? formatDateTime(enquery?.Created_at)
                              : ""}
                          </td>
                          <td className="py-3 px-2 text-[14px] font-semibold">
                            {enquery?.created_from?.toLowerCase() === "chatbot"
                              ? "Eazbot"
                              : enquery?.created_from?.toLowerCase() ===
                                "Eazbot"
                              ? "Eazbot"
                              : enquery?.created_from === "Eazobt"
                              ? "Eazbot"
                              : enquery?.created_from?.toLowerCase() ===
                                "eazobot"
                              ? "Eazbot"
                              : enquery?.created_from === "Website"
                              ? "Webform"
                              : enquery?.created_from === null
                              ? "Webform"
                              : "Webform"}
                          </td>
                          {/* <td className="py-3 px-2 text-[14px] font-semibold whitespace-nowrap">
                        <span title={enquery?.source_url || "Landing Page"}>
                          {(enquery?.source_url?.length ?? 0) > 60
                            ? `${enquery?.source_url.slice(0, 40)}...`
                            : enquery?.source_url || "Landing Page"}
                        </span>
                      </td> */}
                          <td className="py-3 px-2 text-[14px] font-semibold whitespace-nowrap">
                            {/* {enquery?.Name.slice(0, 15)} */}
                            {enquery?.Name?.substring(0, 15)}
                          </td>
                          <td className="py-3 px-2 text-[14px] capitalize whitespace-nowrap">
                            {formatPhoneNumber(enquery?.Contact)}
                          </td>
                          <td className="py-3 px-2 text-[14px] text-[#575757]">
                            {enquery?.Email === "undefined"
                              ? "-"
                              : enquery?.Email}
                          </td>

                          <td className="py-3 px-2 text-[14px] text-[#575757] text-center">
                            {enquery?.numberOfGuest == ""
                              ? "-"
                              : enquery?.numberOfGuest
                              ? enquery?.numberOfGuest
                              : isNaN(
                                  extractBookingInfo(enquery?.Message)?.guests
                                ) ||
                                extractBookingInfo(enquery?.Message)?.guests ===
                                  0
                              ? "-"
                              : extractBookingInfo(enquery?.Message)?.guests}
                          </td>

                          {/* <td className="py-3 px-2 text-[14px] text-[#575757]">
                        {enquery?.Message}
                      </td> */}
                          <td className="py-3 px-2 text-[14px] text-[#575757]">
                            {enquery?.check_in
                              ? enquery?.check_in === "undefined"
                                ? "-"
                                : enquery.check_in
                              : extractBookingInfo(enquery?.Message)?.checkIn ||
                                "-"}
                          </td>
                          <td className="py-3 px-2 text-[14px] text-[#575757]">
                            {enquery?.check_out
                              ? enquery?.check_out === "undefined"
                                ? "-"
                                : enquery.check_out
                              : extractBookingInfo(enquery?.Message)
                                  ?.checkOut || "-"}
                          </td>
                          {/* <td className="py-3 px-2 text-[14px] text-[#575757] font-medium">
                        {enquery?.status}
                      </td> */}

                          <td className="py-3 px-2 text-[14px] text-[#575757] font-medium">
                            <select
                              className="outline-none py-2 bg-gray-50 cursor-pointer"
                              defaultValue={enquery?.status}
                              value={enquery?.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                handleStatusChange(enquery, e.target.value);
                              }}
                            >
                              <option
                                disabled
                                className="text-gray-500 bg-white"
                              >
                                Select Status
                              </option>
                              <option
                                value="Converted"
                                className="bg-white text-black"
                              >
                                Converted
                              </option>
                              <option
                                value="Contacted"
                                className="bg-white  text-black"
                              >
                                Contacted
                              </option>
                              <option
                                value="Open"
                                className="bg-white  text-black"
                              >
                                Open
                              </option>

                              <option
                                value="Out Of Budget"
                                className="bg-white  text-black"
                              >
                                Out Of Budget
                              </option>
                              <option
                                value="Potential"
                                className="bg-white  text-black"
                              >
                                Potential For Later
                              </option>

                              <option
                                value="Quotation Provided"
                                className="bg-white  text-black"
                              >
                                Quotation Provided
                              </option>
                              <option
                                value="Dead Lead"
                                className="bg-white  text-black"
                              >
                                Dead Lead
                              </option>

                              <option
                                value="Date Sold Out"
                                className="bg-white  text-black"
                              >
                                Date Sold Out
                              </option>

                              <option
                                value="Duplicate"
                                className="bg-white  text-black"
                              >
                                Duplicate
                              </option>

                              <option
                                value="Reserved"
                                className="bg-white  text-black"
                              >
                                Reserved
                              </option>

                              <option
                                value="Hot"
                                className="bg-white  text-black"
                              >
                                Hot
                              </option>
                            </select>
                          </td>

                          <td className="py-3 px-2 text-[14px] text-[#575757] font-medium">
                            <span
                              className="flex justify-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(enquery._id, enquery.Email);
                              }}
                            >
                              <MdDeleteOutline size={22} color="#df4545" />
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                ) : (
                  <tbody>
                    <tr className="bg-white text-gray-600 text-center border">
                      <td colSpan={12} className="py-2">
                        Data not found!
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>

            {newRow && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/60 bg-opacity-40 z-[99999] px-4">
                <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl p-6 relative animate-fadeIn">
                  <h2 className="text-lg font-semibold mb-4 text-gray-800">
                    Add New Lead
                  </h2>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Domain */}
                    {/* <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Domain
                      </label>
                      <input
                        type="text"
                        placeholder="Enter domain"
                        className="border rounded px-2 py-1 w-full outline-none"
                        value={lead.Domain}
                        onChange={(e) =>
                          setLead({ ...lead, Domain: e.target.value })
                        }
                      />
                    </div> */}

                    {/* hId */}
                    {/* <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        hId
                      </label>
                      <input
                        type="text"
                        placeholder="Enter hId"
                        className="border rounded px-2 py-1 w-full outline-none"
                        // value={lead.hId}
                        // onChange={(e) =>
                        //   setLead({ ...lead, hId: e.target.value })
                        // }
                      />
                    </div> */}

                    {/* Email */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="Enter email"
                        className="border rounded px-2 py-1 w-full outline-none"
                        value={lead.email}
                        onChange={(e) =>
                          setLead({ ...lead, email: e.target.value })
                        }
                      />
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter name"
                        className="border rounded px-2 py-1 w-full outline-none"
                        value={lead.name}
                        onChange={(e) =>
                          setLead({ ...lead, name: e.target.value })
                        }
                      />
                    </div>

                    {/* Contact */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Contact
                      </label>
                      <input
                        type="number"
                        placeholder="Enter contact"
                        className="border rounded px-2 py-1 w-full outline-none"
                        value={lead.contact}
                        onChange={(e) =>
                          setLead({ ...lead, contact: e.target.value })
                        }
                      />
                    </div>

                    {/* Created From */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Created From
                      </label>
                      <select
                        className="border rounded px-2 py-1 w-full outline-none"
                        value={lead.created_from}
                        onChange={(e) =>
                          setLead({ ...lead, created_from: e.target.value })
                        }
                      >
                        <option value="" disabled>
                          Select
                        </option>

                        <option value="webform" selected>
                          Web Form
                        </option>
                        <option value="WhatsApp campaign" selected>
                          WhatsApp campaign
                        </option>
                        <option value="WhatsApp organic" selected>
                          WhatsApp organic
                        </option>
                        <option value="phone call" selected>
                          Phone call
                        </option>
                        <option value="Instagram" selected>
                          Instagram
                        </option>

                        <option value="Facebook" selected>
                          Facebook
                        </option>
                      </select>
                    </div>

                    {/* Check In */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Check In
                      </label>
                      <input
                        type="date"
                        className="border rounded px-2 py-1 w-full outline-none"
                        value={lead.check_in}
                        onChange={(e) =>
                          setLead({ ...lead, check_in: e.target.value })
                        }
                      />
                    </div>

                    {/* Check Out */}
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Check Out
                      </label>
                      <input
                        type="date"
                        className="border rounded px-2 py-1 w-full outline-none"
                        value={lead.check_out}
                        onChange={(e) =>
                          setLead({ ...lead, check_out: e.target.value })
                        }
                      />
                    </div>

                    {/* Description */}
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-600 mb-1">
                        Description
                      </label>
                      <textarea
                        placeholder="Enter description"
                        className="border rounded px-2 py-1 w-full outline-none h-20 resize-none"
                        value={lead.Description}
                        onChange={(e) =>
                          setLead({ ...lead, Description: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={handleCloseModal}
                      className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveRow}
                      // disabled={isLeadLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2 hover:bg-green-700 disabled:opacity-60"
                    >
                      {isLeadLoading ? (
                        <>
                          Saving <Loader color="#fff" />
                        </>
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {[...Array(itemsPerPage)].map((_, index) => (
              <div key={index}>
                <p className="py-[1.35rem] animate-pulse bg-gray-100"></p>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 max-w-[800px] overflow mx-auto">
            <nav className="inline-flex items-center gap-1 rounded-lg border bg-white px-2 py-1 shadow-sm">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 text-sm rounded-md transition-all whitespace-nowrap duration-200
          ${
            currentPage === 1
              ? "text-gray-300 cursor-not-allowed"
              : "hover:bg-gray-100 text-gray-700"
          }`}
              >
                ← Previous
              </button>

              {/* Page Numbers */}
              <div className="flex overflow-x-auto hide-scrollbar">
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter((page) => {
                    return (
                      page === 1 || // first page
                      page === totalPages || // last page
                      (page >= currentPage - 1 && page <= currentPage + 1) // nearby pages
                    );
                  })
                  .reduce((acc, page, index, arr) => {
                    if (index > 0 && page - arr[index - 1] > 1) {
                      acc.push("ellipsis");
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "ellipsis" ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 text-gray-400"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => handlePageChange(item)}
                        className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all duration-200
                  ${
                    currentPage === item
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                      >
                        {item}
                      </button>
                    )
                  )}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition-all duration-200
          ${
            currentPage === totalPages
              ? "text-gray-300 cursor-not-allowed"
              : "hover:bg-gray-100 text-gray-700"
          }`}
              >
                Next →
              </button>
            </nav>
          </div>
        )}

        {reserveData && (
          <div className="fixed inset-0 z-50 bg-black/50 overflow-auto hide-scrollbar">
            <div className="max-w-7xl w-full p-2 mx-auto rounded-md">
              <div
                className="bg-white flex justify-end px-4 pt-2 text-2xl font-bold cursor-pointer rounded-t-md"
                onClick={() => setReserveData(null)}
              >
                X
              </div>

              <div>
                <ReservationForm
                  data={reserveData}
                  setReserveData={setReserveData}
                  fetchEnquires={fetchEnquires}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <LeadPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        lead={selectedLead}
        fetchEnquires={fetchEnquires}
        handleTabClick={handleTabClick}
        activeIndex={active}
      />
    </div>
  );
};

export default Leads;
